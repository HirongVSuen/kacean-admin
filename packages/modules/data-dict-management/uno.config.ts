import { defineConfig, presetUno } from 'unocss'

// 与 shell 保持一致：语义原子类统一映射到 TDesign token。
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
