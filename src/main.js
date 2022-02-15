import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
// 引入element-ui
import './plugins/element.js'
import 'element-ui/lib/theme-chalk/index.css';
// 引入树形表格
import treeTable from 'vue-table-with-tree-grid'
import './assets/iconfont.css'
import './assets/css/global.css'

Vue.config.productionTip = false
// 网络请求配置
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

// 时间过滤器
Vue.filter('dateFormat', originval => {
  const dt = new Date(originval)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1).toString().padStart(2, '0')
  const d = (dt.getDate()).toString().padStart(2, '0')

  const hh = dt.getHours().toString().padStart(2, '0')
  const mm = dt.getMinutes().toString().padStart(2, '0')
  const ss = dt.getSeconds().toString().padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


Vue.prototype.$http = axios
Vue.component('tree-table', treeTable)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
