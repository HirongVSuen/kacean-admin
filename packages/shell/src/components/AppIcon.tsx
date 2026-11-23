import { defineComponent } from 'vue'

/** shell 统一维护的轻量图标，业务模块只需在 manifest 中声明图标名。 */
function renderIconPath(name: string) {
  switch (name) {
    case 'dashboard':
      return (
        <>
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
        </>
      )
    case 'setting':
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.08A1.7 1.7 0 0 0 9 19.37a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15a1.7 1.7 0 0 0-1.55-1.03H3v-4h.08A1.7 1.7 0 0 0 4.63 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63a1.7 1.7 0 0 0 1.03-1.55V3h4v.08A1.7 1.7 0 0 0 15 4.63a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9a1.7 1.7 0 0 0 1.55 1.03H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z" />
        </>
      )
    case 'fullscreen-enter':
      return (
        <>
          <path d="M3 8V3h5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
        </>
      )
    case 'fullscreen-exit':
      return (
        <>
          <path d="M8 3v5H3M16 3v5h5M8 21v-5H3M16 21v-5h5" />
        </>
      )
    case 'menu-fold':
      return (
        <>
          <path d="M4 6h16M4 12h10M4 18h16" />
          <path d="m17 9-3 3 3 3" />
        </>
      )
    case 'menu-unfold':
      return (
        <>
          <path d="M4 6h16M10 12h10M4 18h16" />
          <path d="m7 9 3 3-3 3" />
        </>
      )
    case 'chevron-down':
      return <path d="m6 9 6 6 6-6" />
    case 'arrow-right':
      return (
        <>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </>
      )
    case 'layers':
      return (
        <>
          <path d="m12 2 9 5-9 5-9-5 9-5Z" />
          <path d="m3 12 9 5 9-5M3 17l9 5 9-5" />
        </>
      )
    case 'link':
      return (
        <>
          <path d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L11 4.93" />
          <path d="M14 11a5 5 0 0 0-7.07 0l-2.12 2.12a5 5 0 0 0 7.07 7.07L13 19.07" />
        </>
      )
    case 'list':
      return (
        <>
          <path d="M8 6h13M8 12h13M8 18h13" />
          <path d="M3 6h.01M3 12h.01M3 18h.01" />
        </>
      )
    case 'check-circle':
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 2.5 2.5L16 9" />
        </>
      )
    case 'user':
      return (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
        </>
      )
    case 'app':
    default:
      return (
        <>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18M9 21V9" />
        </>
      )
  }
}

export default defineComponent({
  name: 'AppIcon',
  props: {
    name: { type: String, default: 'app' },
    size: { type: [Number, String], default: 18 }
  },
  setup(props) {
    return () => (
      <svg
        class="app-icon t-icon"
        width={props.size}
        height={props.size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        {renderIconPath(props.name)}
      </svg>
    )
  }
})
