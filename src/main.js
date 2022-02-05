import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
// 引入element-ui
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css';
import './assets/iconfont.css'
import './assets/css/global.css'

Vue.config.productionTip = false

axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
