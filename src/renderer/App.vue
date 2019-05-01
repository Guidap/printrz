<template>
  <div id="app">
    <md-app>
      <md-app-toolbar class="md-primary">
        <h1 class="md-title">{{ title }}</h1>
      </md-app-toolbar>

      <md-app-drawer md-permanent="full">
        <md-toolbar class="md-transparent" md-elevation="0">
          <h1>Printrz</h1>
        </md-toolbar>

        <md-list>
          <md-list-item to="/">
            <md-icon>list_alt</md-icon>
            <span class="md-list-item-text">Printers</span>
          </md-list-item>

          <!-- <md-list-item to="/settings">
            <md-icon>settings</md-icon>
            <span class="md-list-item-text">Settings</span>
          </md-list-item> -->
        </md-list>

        <p class="made-with-love">Made with <span class="heart">❤</span> by GUIDAP</p>
        <p>v{{ $electron.remote.app.getVersion() }}</p>
      </md-app-drawer>
      
      <md-app-content>
        <router-view></router-view>
      </md-app-content>
    </md-app>
  </div>
</template>

<script>
  import 'vue-material/dist/vue-material.min.css'
  import 'vue-material/dist/theme/default.css'
  import Vue from 'vue'
  import { MdApp, MdDrawer, MdToolbar, MdContent, MdList, MdIcon } from 'vue-material/dist/components'

  Vue.use(MdApp)
  Vue.use(MdDrawer)
  Vue.use(MdToolbar)
  Vue.use(MdContent)
  Vue.use(MdList)
  Vue.use(MdIcon)

  export default {
    name: 'printrz',

    computed: {
      title () {
        switch (this.$route.name) {
          default:
          case 'home':
            return 'Printers'
          case 'settings':
            return 'Settings'
        }
      }
    }
  }
</script>

<style lang="scss">
  $material-icons-font-path: '~material-icons/iconfont/';
 
  @import '~material-icons/iconfont/material-icons.scss';

  .md-drawer {
    width: 230px;
    max-width: calc(100vw - 125px);
  }
  
  .md-content.md-app-content {
    background-color: #fafafa;
  }

  p {
    text-align: center;
    margin-bottom: 0;
  }
  .made-with-love {
    font-weight: 600;
    .heart {
      color: #f44336;
      transition: .3s cubic-bezier(.4,0,.2,1);
      &:hover {
        -webkit-transform: scale(1.4);
        transform: scale(1.4);
        color: #d32f2f;
      }
    }
  }
</style>
