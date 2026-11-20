import { createApp } from 'vue'
// 组件在 TSX 中具名导入使用，不做 app.use 全量注册，保证 tree-shaking
// 样式暂时全量引入（后续可按需引入收敛体积）
import 'tdesign-vue-next/es/style/index.css'
import './styles/theme.css'
import 'virtual:uno.css'
import App from './App'
import router from './router'

createApp(App).use(router).mount('#app')
