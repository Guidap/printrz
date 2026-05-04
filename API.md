# Printrz REST API

Printrz exposes a small HTTP/HTTPS server on `localhost` that any web app can use to send print jobs to printers installed on the host OS.

## Overview

| | |
|---|---|
| **Host** | `localhost` (bind on all interfaces of the machine running Printrz) |
| **Port** | configurable in **Settings → Server configuration** (default: `5001`) |
| **Protocol** | `https` if a certificate has been generated, `http` otherwise |
| **Authentication** | none — the API is meant to be reached from the same machine over a local network |
| **CORS** | enabled for all origins |
| **Content-Type** | request bodies must be `application/json` |

The server is restarted in-place when the port or the SSL certificate change — the Electron app does not need to be relaunched.

### TLS

Printrz can generate a self-signed certificate from the **Settings → SSL Certificate** page. The files are stored next to the app config:

- macOS: `~/Library/Application Support/Printrz/`
- Windows: `%APPDATA%\Printrz\`
- Linux: `~/.config/Printrz/`

File names: `guidap_printrz_key.pem` and `guidap_printrz_cert.pem` (legacy installs may still use `key.pem` / `cert.pem`).

Because the certificate is self-signed, browsers will reject the HTTPS endpoint until the user accepts it manually, or until the certificate is added to the OS trust store.

## Endpoints

### `GET /`

Health check. Returns `200 OK` with the body `Server's Up!` (plain text).

```bash
curl http://localhost:5001/
# → Server's Up!
```

---

### `GET /printers`

Returns the list of printers installed on the OS.

**Response** — `200 OK`, `application/json`. JSON array of printer objects. Field shape depends on the OS (CUPS on macOS/Linux, Win32 spooler on Windows).

```bash
curl http://localhost:5001/printers
```

```json
[
  {
    "name": "Samsung_M2070_Series",
    "isDefault": true,
    "options": {
      "printer-info": "Samsung M2070 Series",
      "printer-make-and-model": "Samsung M2070 Series",
      "printer-state": "3",
      "printer-state-reasons": "none",
      "device-uri": "usb://Samsung/M2070%20Series?serial=...",
      "...": "..."
    },
    "jobs": [],
    "status": "IDLE"
  }
]
```

Useful fields:

- `name` — the unique identifier you must pass to `POST /job` as `printer`.
- `isDefault` — whether this is the OS-level default printer.
- `options['printer-info']` (CUPS) / display name (Win) — human-friendly label.
- `status` — IDLE / PRINTING / etc.

---

### `POST /job`

Send a print job to a specific printer.

**Request body** — `application/json`:

| Field | Type | Required | Description |
|---|---|---|---|
| `printer` | `string` | yes | The printer `name` returned by `GET /printers`. |
| `type` | `string` | yes | Job format. Common values: `RAW` (raw bytes, e.g. ESC/POS commands), `TEXT` (plain text), `PDF`, `JPEG`, `COMMAND`. The list of supported types depends on the OS — see [`node-printer` docs](https://github.com/tojocky/node-printer). |
| `data` | `string` | yes | The payload to print. For `RAW`, the raw bytes encoded as a string (each character is one byte — use `\x..` escapes for non-printable bytes). For `PDF` / `JPEG`, the file content as a base64 string is supported on most platforms. |

**Responses**

- `200 OK` — `{ "jobID": <number> }` — the OS-level job id (useful to track the job in the printer queue).
- `500 Internal Server Error` — error payload returned by the OS (shape varies, often a string or an object with a `message`).

**Example — print an ESC/POS receipt on a thermal printer**

```bash
curl -X POST http://localhost:5001/job \
  -H 'Content-Type: application/json' \
  -d '{
    "printer": "EPSON_TM_T20",
    "type": "RAW",
    "data": "@HELLO\n\n\n\n\ni"
  }'
# → {"jobID":42}
```

(`@` = ESC `@`, init printer · `i` = GS `i`, partial cut.)

**Example — print a PDF**

```bash
PDF_B64=$(base64 -i ticket.pdf)
curl -X POST http://localhost:5001/job \
  -H 'Content-Type: application/json' \
  -d "{\"printer\":\"Samsung_M2070_Series\",\"type\":\"PDF\",\"data\":\"$PDF_B64\"}"
```

## Browser usage

```js
const PRINTRZ_URL = 'https://localhost:5001'

async function listPrinters () {
  const r = await fetch(`${PRINTRZ_URL}/printers`)
  return r.json()
}

async function printRaw (printer, escposCommands) {
  const r = await fetch(`${PRINTRZ_URL}/job`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ printer, type: 'RAW', data: escposCommands })
  })
  if (!r.ok) throw new Error(await r.text())
  return r.json() // { jobID }
}
```

A live JSFiddle is available [here](https://jsfiddle.net/3pc1vna5/).

## Errors

| HTTP status | Cause |
|---|---|
| `500` on `POST /job` | The OS spooler refused the job — printer offline, unknown `printer` name, malformed `data` for the given `type`, etc. The body contains the underlying error returned by `node-printer`. |
| connection refused | Printrz is not running, the port differs from what the client uses, or a firewall blocks the loopback connection. |
| TLS error (`self-signed certificate`) | The HTTPS endpoint is using the self-signed certificate generated by the app. Trust it in the OS trust store or use HTTP (delete the certificate via the file system, then restart the server from Settings). |

## Notes

- The list of supported `type` values, and the expected `data` format for each type, is inherited from [`node-printer`](https://github.com/tojocky/node-printer) (and its maintained fork [`@grandchef/node-printer`](https://github.com/grandchef/node-printer) used by Printrz). Behaviour may differ between Windows and CUPS-based OSes.
- The API has no authentication. Printrz is designed to run on a trusted local network. Do not expose the port to the internet.
