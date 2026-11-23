// 模块样式随源码入口引入，保证 shell 静态集成与独立构建表现一致。
import './styles.css'

// UMD 产物通过 window.MenuManagement.manifest 暴露模块清单。
export { manifest } from './manifest'
