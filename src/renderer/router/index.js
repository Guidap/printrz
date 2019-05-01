import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)
Vue.component('router-link', Vue.options.components.RouterLink)
Vue.component('router-view', Vue.options.components.RouterView)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: require('@/components/Home').default
    },
    // {
    //   path: '/settings',
    //   name: 'settings',
    //   component: require('@/components/Settings').default
    // },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
