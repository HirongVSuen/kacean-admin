import { onBeforeUnmount, onMounted, reactive, watch } from 'vue'

export type BrandTheme = 'default' | 'energy-blue' | 'grid-green'
export type ThemeMode = 'light' | 'dark' | 'system'
export type NavigationMode = 'side' | 'top'

export interface LayoutPreferences {
  brandTheme: BrandTheme
  theme: ThemeMode
  navigation: NavigationMode
  contentOnly: boolean
}

const STORAGE_KEY = 'kacean-admin.layout-preferences'
const defaultPreferences: LayoutPreferences = {
  brandTheme: 'default',
  theme: 'light',
  navigation: 'side',
  contentOnly: false
}

/** 读取并校验本地偏好，损坏或不可用的存储不应阻断应用启动。 */
function readPreferences(): LayoutPreferences {
  if (typeof window === 'undefined') return { ...defaultPreferences }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return { ...defaultPreferences }

    const parsed: unknown = JSON.parse(stored)
    if (!parsed || typeof parsed !== 'object') return { ...defaultPreferences }

    const value = parsed as Partial<LayoutPreferences>
    return {
      brandTheme:
        value.brandTheme === 'energy-blue' || value.brandTheme === 'grid-green' ? value.brandTheme : 'default',
      theme: value.theme === 'dark' || value.theme === 'system' ? value.theme : 'light',
      navigation: value.navigation === 'top' ? 'top' : 'side',
      contentOnly: value.contentOnly === true
    }
  } catch {
    return { ...defaultPreferences }
  }
}

/** shell 显示偏好：本地持久化，并同步品牌主题与 TDesign 明暗模式。 */
export function useLayoutPreferences() {
  const preferences = reactive<LayoutPreferences>(readPreferences())
  let systemThemeMedia: MediaQueryList | undefined

  const applyTheme = () => {
    if (typeof document === 'undefined') return

    const dark = preferences.theme === 'dark' || (preferences.theme === 'system' && systemThemeMedia?.matches === true)
    document.documentElement.setAttribute('data-brand-theme', preferences.brandTheme)
    document.documentElement.setAttribute('theme-mode', dark ? 'dark' : 'light')
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }

  const handleSystemThemeChange = () => applyTheme()

  if (typeof window !== 'undefined') {
    systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)')
  }

  watch([() => preferences.brandTheme, () => preferences.theme], applyTheme, { immediate: true })
  watch(
    preferences,
    (value) => {
      if (typeof window === 'undefined') return

      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
      } catch {
        // 隐私模式或存储配额异常时保留当前会话设置。
      }
    },
    { deep: true }
  )

  onMounted(() => {
    systemThemeMedia?.addEventListener('change', handleSystemThemeChange)
    applyTheme()
  })

  onBeforeUnmount(() => {
    systemThemeMedia?.removeEventListener('change', handleSystemThemeChange)
  })

  return { preferences }
}
