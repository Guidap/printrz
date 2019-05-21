import fs from 'fs'
import path from 'path'
import forge from 'node-forge'
import { promisify } from 'util'
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
forge.options.usePureJavaScript = true

/**
 * Get certificate files paths and names
 * @param {String} certsPath The certificate's files main location
 */
let getPaths = function (certsPath) {
  return {
    key: path.join(certsPath, 'key.pem'),
    cert: path.join(certsPath, 'cert.pem')
  }
}

/**
 * Get certificate files content
 * @param {String} certsPath The certificate's files main location
 * @param {*} sync           If true, load the file synchronously (default false)
 */
let getCertificateFiles = function (certsPath, sync = false) {
  let paths = getPaths(certsPath)

  if (sync) {
    return {
      privateKey: fs.readFileSync(paths.key),
      certificate: fs.readFileSync(paths.cert)
    }
  }

  return Promise.all([
    readFileAsync(paths.key),
    readFileAsync(paths.cert)
  ]).then(results => ({
    privateKey: results[0],
    certificate: results[1]
  }))
}

/**
 * Generate new SSL certificate files
 * @param {String} certsPath The certificate's files main location
 * @param {Object} object The certificate attributes
 */
let generateCertificateFiles = function (certsPath, { organizationName, countryName, stateOrProvinceName, localityName }) {
  let paths = getPaths(certsPath)
  let pki = forge.pki
  let keys = pki.rsa.generateKeyPair(2048)
  let cert = pki.createCertificate()
  let attributes = [
    {name: 'commonName', value: organizationName},
    {name: 'countryName', value: countryName},
    {shortName: 'ST', value: stateOrProvinceName},
    {name: 'localityName', value: localityName},
    {name: 'organizationName', value: organizationName},
    {shortName: 'OU', value: organizationName}
  ]

  cert.publicKey = keys.publicKey
  cert.serialNumber = '01'
  cert.validity.notBefore = new Date()
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10)
  cert.setSubject(attributes)
  cert.setIssuer(attributes)
  cert.sign(keys.privateKey)
  let privateKey = pki.privateKeyToPem(keys.privateKey)
  let certificate = pki.certificateToPem(cert)

  return Promise.all([
    writeFileAsync(paths.key, privateKey),
    writeFileAsync(paths.cert, certificate)
  ]).then(() => ({
    privateKey,
    certificate
  }))
}

export {
  getPaths,
  getCertificateFiles,
  generateCertificateFiles
}
