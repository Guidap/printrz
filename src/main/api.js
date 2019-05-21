import { app } from 'electron'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import logger from 'morgan'
import printer from 'printer'
import https from 'https'
import { getCertificateFiles } from './certificate'

export default function ({ port }) {
  const server = express()
  server.use(cors())
  server.use(bodyParser.json())
  server.use(logger('short', {
    skip: function (req, res) { return res.statusCode < 400 }
  }))
  /**
   * Check if the server is running
   */
  server.get('/', (req, res) => res.send("Server's Up!"))
  /**
   * Fetch the list of available printers
   */
  server.get('/printers', (req, res) => {
    res.send(JSON.stringify(
      printer.getPrinters()
    ))
  })
  /**
   * Create a new print job
   * Payload expected:
   * {
   *    "printer": "Printer-name"
   *    "type": "RAW, TEXT, PDF, JPEG, etc." // if missing then will print to default printer
   *    "data": "the command data to send to the printer"
   * }
   */
  server.post('/job', (req, res) => {
    printer.printDirect({
      data: req.body.data,
      printer: req.body.printer,
      type: req.body.type,
      success (jobID) {
        console.log(`Job ${jobID} printed!`)
        res.send(JSON.stringify({ jobID }))
      },
      error (err) {
        console.log(`Job error`, err)
        res.status(500).send(JSON.stringify(err))
      }
    })
  })

  let isHttps = false
  let callback = () => {
    console.log(`Print server listening on port ${port}!`)
  }
  try {
    console.log('Starting server on HTTPS...')
    let certFiles = getCertificateFiles(app.getPath('userData'), true)
    https
      .createServer(
        {
          key: certFiles.privateKey,
          cert: certFiles.certificate
        },
        server
      )
      .listen(port, callback)
    isHttps = true
  } catch (e) {
    console.log('Cannot run with HTTPS, fallback on HTTP...')
    server.listen(port, callback)
  }

  return {
    isHttps,
    port
  }
}
