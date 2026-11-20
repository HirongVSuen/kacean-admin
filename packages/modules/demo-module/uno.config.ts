import { defineConfig, presetUno } from 'unocss'

// 与 shell 的 uno.config.ts 保持一致：语义原子类映射 TDesign token。
// 独立开发（dev:module）时使用本配置；集成到 shell 时由基座配置统一生成。
export default defineConfig({
  presets: [presetUno()],
  theme: {
    colors: {
      primary: 'var(--td-brand-color)',
      success: 'var(--td-success-color)',
      warning: 'var(--td-warning-color)',
      error: 'var(--td-error-color)',
      page: 'var(--td-bg-color-page)',
      container: 'var(--td-bg-color-container)',
      secondary: 'var(--td-text-color-secondary)'
    }
  },
  shortcuts: {
    'flex-center': 'flex items-center justify-center'
  }
})
