import axios from 'axios'

export default {
  install: function (Vue, { protocol, host, port }) {
    Vue.http = Vue.prototype.$http = axios.create({
      baseURL: `${protocol}://${host}:${port}`
    })
  }
}
