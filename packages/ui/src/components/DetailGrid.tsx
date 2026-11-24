import { defineComponent } from 'vue'

/** 详情页主侧栏布局，窄屏自动折叠为单列。 */
export const DetailGrid = defineComponent({
  name: 'KaceanDetailGrid',
  setup(_props, { slots }) {
    return () => (
      <div class="kacean-detail-grid">
        <div class="kacean-detail-grid__main">{slots.default?.()}</div>
        <aside class="kacean-detail-grid__aside">{slots.aside?.()}</aside>
      </div>
    )
  }
})
