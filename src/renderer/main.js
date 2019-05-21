import { remote } from 'electron'
import Vue from 'vue'

import App from './App'
import router from './router'
import http from './plugins/http'

const api = remote.getGlobal('printrz').api

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false
Vue.use(http, {
  protocol: api.isHttps ? 'https' : 'http',
  host: 'localhost',
  port: api.port
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
