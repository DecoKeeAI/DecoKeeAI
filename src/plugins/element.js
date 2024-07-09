import Vue from 'vue'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// Components ------
import svgIcon from './svgIcon/index.vue'
import { VueAxios } from './request'
// Use components ------
Vue.component('SvgIcon', svgIcon)
Vue.use(VueAxios)
Vue.use(Element)
