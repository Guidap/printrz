<template>
  <div>
    <md-card md-with-hover>
      <md-card-header>
        <md-card-media>
          <md-icon class="md-size-3x">router</md-icon>
        </md-card-media>
      
        <md-card-header-text>
          <div class="md-title">
            {{ ip }} &nbsp;<md-button class="md-dense md-icon-button md-primary" @click="copyIp()"><md-icon>content_copy</md-icon></md-button>
          </div>
          <div class="md-subhead">Local IP</div>
        </md-card-header-text>
      </md-card-header>
    </md-card>

    <form novalidate @submit.prevent="save">
      <md-card>
        <md-card-header>
          <md-card-media>
            <md-icon class="md-size-2x">storage</md-icon>
          </md-card-media>
        
          <md-card-header-text>
            <div class="md-title">
              Server configuration
            </div>
          </md-card-header-text>
        </md-card-header>

        <md-card-content>
          <md-field>
            <label for="port">Port</label>
            <md-input type="text" name="port" id="port" v-model="server.port" />
          </md-field>
        </md-card-content>

        <md-card-actions>
          <md-button type="submit" class="md-raised md-primary">Save</md-button>
        </md-card-actions>
      </md-card>
    </form>

    <form novalidate @submit.prevent="generateCertificate">
      <md-card>
        <md-card-header>
          <md-card-media>
            <md-icon class="md-size-2x">security</md-icon>
          </md-card-media>
        
          <md-card-header-text>
            <div class="md-title">
              SSL Certificate
            </div>
          </md-card-header-text>
        </md-card-header>

        <md-card-content v-if="hasCertificate" class="cert-paths">
          <p><span class="cert-paths__label">Private key</span><code>{{ certificatePaths.key }}</code></p>
          <p><span class="cert-paths__label">Certificate</span><code>{{ certificatePaths.cert }}</code></p>
          <md-button class="md-dense" @click="openCertificateFolder" type="button">
            <md-icon>folder_open</md-icon>
            Open folder
          </md-button>
        </md-card-content>

        <md-card-content>
          <md-field>
            <label for="organizationName">Organization name</label>
            <md-input type="text" name="organizationName" id="organizationName"
                      v-model="certificate.organizationName"
                      :placeholder="$options.CERTIFICATE_PLACEHOLDERS.organizationName"/>
          </md-field>
          <md-field>
            <label for="countryName">Country name</label>
            <md-input type="text" name="countryName" id="countryName"
                      v-model="certificate.countryName"
                      :placeholder="$options.CERTIFICATE_PLACEHOLDERS.countryName"/>
          </md-field>
          <md-field>
            <label for="stateOrProvinceName">State or province name</label>
            <md-input type="text" name="stateOrProvinceName" id="stateOrProvinceName"
                      v-model="certificate.stateOrProvinceName"
                      :placeholder="$options.CERTIFICATE_PLACEHOLDERS.stateOrProvinceName"/>
          </md-field>
          <md-field>
            <label for="localityName">City name</label>
            <md-input type="text" name="localityName" id="localityName"
                      v-model="certificate.localityName"
                      :placeholder="$options.CERTIFICATE_PLACEHOLDERS.localityName"/>
          </md-field>
        </md-card-content>

        <md-card-actions>
          <md-button v-if="!hasCertificate" type="submit" class="md-raised md-primary">
            Generate a certificate
          </md-button>
          <md-button v-else type="submit" class="md-raised md-accent">
            Re-generate a certificate
          </md-button>
        </md-card-actions>
      </md-card>
    </form>
    
    <md-snackbar md-position="center" :md-duration="4000" :md-active.sync="showSnackbar" md-persistent>
      <span>{{ snackbarContent }}</span>
    </md-snackbar>
  </div>
</template>

<script>
  // TODO: improve accuracy with https://github.com/indutny/node-ip/issues/85#issuecomment-417925130
  // and https://github.com/indutny/node-ip/blob/master/lib/ip.js#L342
  import * as remote from '@electron/remote'
  import { shell } from 'electron'
  import ip from 'ip'
  import Vue from 'vue'
  import { MdCard, MdField, MdSnackbar } from 'vue-material/dist/components'
  import { getCertificateFiles, generateCertificateFiles, getPaths } from '&/certificate'
  import { setConfiguration } from '&/configuration'

  Vue.use(MdCard)
  Vue.use(MdField)
  Vue.use(MdSnackbar)

  export default {
    name: 'settings',

    CERTIFICATE_PLACEHOLDERS: {
      organizationName: 'Printrz',
      countryName: 'France',
      stateOrProvinceName: 'Haute-garonne',
      localityName: 'Toulouse'
    },

    created: function () {
      this.server.port = remote.getGlobal('printrz').configuration.port
      getCertificateFiles(remote.app.getPath('userData'))
        .then(files => {
          this.certificateFiles = files
        })
        .catch(err => console.log('No certificate found', err))
    },

    data: function () {
      return {
        ip: ip.address('public'),
        snackbarContent: null,
        certificateFiles: null,
        server: {
          port: null
        },
        certificate: {}
      }
    },

    computed: {
      showSnackbar: {
        get: function () {
          return this.snackbarContent !== null
        },
        set: function () {
          this.snackbarContent = null
        }
      },
      hasCertificate: function () {
        return this.certificateFiles !== null
      },
      certificateFolder: function () {
        return remote.app.getPath('userData')
      },
      certificatePaths: function () {
        return getPaths(this.certificateFolder)
      }
    },

    methods: {
      copyIp: function () {
        const el = document.createElement('textarea')
        el.value = this.ip
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
        this.snackbarContent = 'Local IP copied in your clipboard!'
      },
      openCertificateFolder: function () {
        shell.openPath(this.certificateFolder)
      },
      save: function () {
        let configPath = remote.app.getPath('userData')
        let newConf = { port: Number(this.server.port) }
        setConfiguration(configPath, newConf)
          .then(() => remote.getGlobal('printrz').restartApi(newConf))
          .then(api => {
            this.$http.defaults.baseURL = `${api.isHttps ? 'https' : 'http'}://localhost:${api.port}`
            this.snackbarContent = `Server restarted on port ${api.port}.`
          })
          .catch(err => {
            console.log('save', err)
            const msg = (err && err.message) || ''
            if (err && (err.code === 'EADDRINUSE' || msg.includes('already in use'))) {
              this.snackbarContent = `Port ${this.server.port} is already in use. Please choose a different port.`
              this.server.port = remote.getGlobal('printrz').configuration.port
            } else {
              this.snackbarContent = `An error happened when saving: ${msg || 'unknown error'}`
            }
          })
      },
      generateCertificate: function () {
        if (
          this.hasCertificate &&
          !confirm('A certificate already exists, do you want to continue? This action will overwrite the previous certificate.')
        ) {
          return
        }

        let configPath = remote.app.getPath('userData')
        generateCertificateFiles(configPath,
          {
            organizationName: this.certificate.organizationName || this.$options.CERTIFICATE_PLACEHOLDERS.organizationName,
            countryName: this.certificate.countryName || this.$options.CERTIFICATE_PLACEHOLDERS.countryName,
            stateOrProvinceName: this.certificate.stateOrProvinceName || this.$options.CERTIFICATE_PLACEHOLDERS.stateOrProvinceName,
            localityName: this.certificate.localityName || this.$options.CERTIFICATE_PLACEHOLDERS.localityName
          })
          .then(files => {
            this.certificateFiles = files
            let runningPort = remote.getGlobal('printrz').configuration.port
            return remote.getGlobal('printrz').restartApi({ port: runningPort })
          })
          .then(api => {
            this.$http.defaults.baseURL = `${api.isHttps ? 'https' : 'http'}://localhost:${api.port}`
            this.snackbarContent = api.isHttps
              ? `Certificate generated. Server restarted on HTTPS port ${api.port}.`
              : `Certificate generated but server failed to switch to HTTPS — still on HTTP port ${api.port}.`
          }).catch(err => {
            console.log('generateCertificate', err)
            const msg = (err && err.message) || ''
            if (err && (err.code === 'EADDRINUSE' || msg.includes('already in use'))) {
              this.snackbarContent = `Certificate written, but the port is now busy. Try changing the port in Server configuration.`
            } else {
              this.snackbarContent = `An error happened when generating certificate files: ${msg || 'unknown error'}`
            }
          })
      }
    }
  }
</script>

<style scoped lang="scss">
  .md-card {
    margin-bottom: 12px;
  }

  .cert-paths {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding-bottom: 0;
    p {
      text-align: left;
      margin: 4px 0;
      font-size: 13px;
      word-break: break-all;
    }
    .cert-paths__label {
      display: inline-block;
      width: 90px;
      color: rgba(0, 0, 0, 0.54);
    }
    code {
      background: rgba(0, 0, 0, 0.04);
      padding: 1px 6px;
      border-radius: 3px;
      font-family: 'SF Mono', Menlo, Consolas, monospace;
    }
  }
</style>