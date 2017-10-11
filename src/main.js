// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import iView from 'iview'
import 'iview/dist/styles/iview.css'
import VueResource from 'vue-resource'
import '../static/js/jquery.barrager'
// import '../static/js/mo'
// import '../static/js/smusic'

Vue.use(VueResource)
Vue.use(iView)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  	el: '#app',
  	router,
  	template: '<App/>',
  	components: { App }
})
