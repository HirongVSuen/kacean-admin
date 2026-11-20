import { defineConfig, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno()],
  // 语义原子类统一映射到 TDesign token：业务侧写 text-primary / bg-page 等，
  // 宿主或 shell 覆盖 --td-* 变量即可整体换肤，禁止硬编码色板值
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
