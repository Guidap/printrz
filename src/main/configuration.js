import fs from 'fs'
import path from 'path'
import { promisify } from 'util'
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const DEFAULT_CONFIGURATION = {
  port: 5000
}

/**
 * Get the path to the configuration file
 * @param {String} configPath     The path to root directory of config.json
 */
let getFilePath = function (configPath) {
  return path.join(configPath, 'config.json')
}

/**
 * Get the configuration file content (parsed to object)
 * @param {String} configPath     The path to root directory of config.json
 * @param {Boolean} sync  If true, load the file synchronously (default false)
 */
let getConfiguration = function (configPath, sync = false) {
  let filePath = getFilePath(configPath)

  if (sync) {
    try {
      return JSON.parse(fs.readFileSync(filePath))
    } catch (e) {
      return DEFAULT_CONFIGURATION
    }
  }

  return readFileAsync(filePath)
    .then(content => JSON.parse(content))
    .catch(() => DEFAULT_CONFIGURATION)
}

/**
 * Update the configuration file with full/partial configuration
 * @param {String} configPath     The path to root directory of config.json
 * @param {Object} configuration  A partial object which will be stored in the config.json file
 */
let setConfiguration = function (configPath, configuration) {
  let filePath = getFilePath(configPath)
  return getConfiguration(configPath)
    .then(content => {
      return writeFileAsync(
        filePath,
        JSON.stringify(
          Object.assign({}, content, configuration),
          null, 4
        )
      )
    })
}

export {
  getFilePath,
  getConfiguration,
  setConfiguration
}
