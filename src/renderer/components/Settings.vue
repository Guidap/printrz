<template>
  <div>
    <md-card md-with-hover>
      <md-card-header>
        <md-card-media>
          <md-icon class="md-size-3x">router</md-icon>
        </md-card-media>
      
        <md-card-header-text>
          <div class="md-title">
            {{ ip }} &nbsp<md-button class="md-dense md-icon-button md-primary" @click="copyIp()"><md-icon>content_copy</md-icon></md-button>
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
  import ip from 'ip'
  import Vue from 'vue'
  import { MdCard, MdField, MdSnackbar } from 'vue-material/dist/components'
  import { getCertificateFiles, generateCertificateFiles } from '&/certificate'
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
      this.server.port = this.$electron.remote.getGlobal('printrz').configuration.port
      getCertificateFiles(this.$electron.remote.app.getPath('userData'))
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
      save: function () {
        let configPath = this.$electron.remote.app.getPath('userData')
        setConfiguration(configPath, {
          port: this.server.port
        })
          .then(() => {
            this.snackbarContent = 'Configuration saved! \nYou must restart the app to apply these changes.'
            if (confirm('You must restart the app to apply these changes. Do you want to restart the app?')) {
              this.$electron.remote.app.relaunch()
              this.$electron.remote.app.exit()
            }
          })
          .catch(err => {
            this.snackbarContent = 'An error happened when saving.'
            console.log('setConfiguration', err)
          })
      },
      generateCertificate: function () {
        if (
          this.hasCertificate &&
          !confirm('A certificate already exists, do you want to continue? This action will overwrite the previous certificate.')
        ) {
          return
        }

        let configPath = this.$electron.remote.app.getPath('userData')
        generateCertificateFiles(configPath,
          {
            organizationName: this.certificate.organizationName || this.$options.CERTIFICATE_PLACEHOLDERS.organizationName,
            countryName: this.certificate.countryName || this.$options.CERTIFICATE_PLACEHOLDERS.countryName,
            stateOrProvinceName: this.certificate.stateOrProvinceName || this.$options.CERTIFICATE_PLACEHOLDERS.stateOrProvinceName,
            localityName: this.certificate.localityName || this.$options.CERTIFICATE_PLACEHOLDERS.localityName
          })
          .then(files => {
            this.certificateFiles = files
            this.snackbarContent = 'Certificate files generated! \nYou must restart the app to apply these changes.'
            if (confirm('You must restart the app to apply these changes. Do you want to restart the app?')) {
              this.$electron.remote.app.relaunch()
              this.$electron.remote.app.exit()
            }
          }).catch(err => {
            this.snackbarContent = 'An error happened when generating certificate files.'
            console.log('generateCertificateFiles', err)
          })
      }
    }
  }
</script>

<style scoped lang="scss">
  .md-card {
    margin-bottom: 12px;
  }
</style>