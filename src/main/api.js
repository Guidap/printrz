const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const printer = require('printer')
const port = 5000

export default function (callback) {
  const server = express()
  server.use(cors())
  server.use(bodyParser())
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
  /* const instance = */server.listen(port, () => {
    console.log(`Print server listening on port ${port}!`)
    if (callback) {
      callback()
    }
  })

  return {
    // TODO: fix that stuff
    /* stopServer () {
      return new Promise((resolve, reject) => {
        try {
          instance.close(() => {
            console.log(`Print server stopped!`)
            resolve()
          })
        } catch (e) {
          reject(e)
        }
      })
    } */
  }
}
