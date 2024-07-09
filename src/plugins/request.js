import axios from 'axios'
import { VueAxios } from './axios'

// 创建 axios 实例
const service = axios.create({
  // baseURL: process.env.VUE_APP_API_BASE_URL, // api base_url
  timeout: 60000 // 请求超时时间
})

const err = (error) => {
  return Promise.reject(error)
}

// request interceptor
service.interceptors.request.use(config => {
  config.headers['Cache-Control'] = 'no-cache';
  return config;
}, err)

// response interceptor
service.interceptors.response.use((response) => {
  return response.data
}, err)

const installer = {
  vm: {},
  install (Vue) {
    Vue.use(VueAxios, service)
  }
}

export {
  installer as VueAxios,
  service as axios
}
