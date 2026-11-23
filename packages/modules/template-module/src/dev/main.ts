import { createApp } from 'vue'
// 独立开发时由模块自行引入样式；集成到 shell 时由基座全局注入 TDesign 样式
import 'tdesign-vue-next/es/style/index.css'
import 'virtual:uno.css'
import '../styles.css'
import DevApp from './App'

createApp(DevApp).mount('#app')
