'use strict'

import { app, BrowserWindow } from 'electron'
import * as remoteMain from '@electron/remote/main'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import Api from './api'
import { getConfiguration } from './configuration'

remoteMain.initialize()

app.commandLine.appendSwitch('ignore-certificate-errors')

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'info'
log.info('App starting...')

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function makeStubApi (conf, err) {
  return {
    isHttps: false,
    port: conf.port,
    error: err && err.code === 'EADDRINUSE'
      ? `Port ${conf.port} is already in use.`
      : (err && err.message) || 'API server is not running.',
    stopServer: () => Promise.resolve()
  }
}

async function createWindow () {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdatesAndNotify()

  let conf = getConfiguration(app.getPath('userData'), true)
  let api
  try {
    api = await Api(conf)
  } catch (err) {
    log.warn(`Could not start API on port ${conf.port}:`, err.message)
    api = makeStubApi(conf, err)
  }
  global.printrz = {
    configuration: conf,
    api,
    restartApi: async function (newConf) {
      const oldConf = global.printrz.configuration
      await global.printrz.api.stopServer()
      try {
        global.printrz.api = await Api(newConf)
        global.printrz.configuration = newConf
      } catch (err) {
        // New port failed: restart on the previous conf so the app stays alive.
        try {
          global.printrz.api = await Api(oldConf)
        } catch (rollbackErr) {
          log.error('Rollback to previous conf failed:', rollbackErr.message)
          global.printrz.api = makeStubApi(oldConf, rollbackErr)
        }
        const e = new Error(err.code === 'EADDRINUSE'
          ? `Port ${newConf.port} is already in use.`
          : err.message)
        e.code = err.code
        throw e
      }
      return {
        isHttps: global.printrz.api.isHttps,
        port: global.printrz.api.port
      }
    }
  }

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  remoteMain.enable(mainWindow.webContents)
  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  app.quit()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
