// 模块示例样式随源码入口引入，保证 shell 静态集成时间距、布局等样式生效
import './styles.css'

// UMD 产物通过 window.TemplateModule.manifest 暴露模块清单，供 shell 的模块加载器读取
export { manifest } from './manifest'
