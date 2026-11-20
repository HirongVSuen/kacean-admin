import { createApp } from 'vue'
// 独立开发时模块自行引入 TDesign 样式；集成到 shell 时由基座全局注入，模块不重复携带
import 'tdesign-vue-next/es/style/index.css'
import 'virtual:uno.css'
import DevApp from './App'

createApp(DevApp).mount('#app')
