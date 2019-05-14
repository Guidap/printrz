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
    
    <md-snackbar md-position="center" :md-duration="4000" :md-active.sync="showSnackbar" md-persistent>
      <span>Local IP copied in your clipboard!</span>
    </md-snackbar>
  </div>
</template>

<script>
  import ip from 'ip'
  import Vue from 'vue'
  import { MdCard, MdSnackbar } from 'vue-material/dist/components'

  Vue.use(MdCard)
  Vue.use(MdSnackbar)

  export default {
    name: 'settings',
    data: function () {
      return {
        ip: ip.address(),
        showSnackbar: false
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
        this.showSnackbar = true
      }
    }
  }
</script>