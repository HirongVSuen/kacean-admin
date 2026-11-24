import { defineComponent, reactive } from 'vue'
import { Form, FormItem } from 'tdesign-vue-next'
import type { CalendarProps, CalendarValue, DateRangeValue, DateValue } from 'tdesign-vue-next'
import {
  FormDatePicker,
  FormCalendar,
  FormDatePickerPanel,
  FormDateRangePicker,
  FormDateRangePickerPanel,
  FormGrid,
  PageContainer,
  SectionCard
} from '@kacean/ui'

interface DateExampleData {
  singleDate: DateValue
  rangeDate: DateRangeValue
  startDate: string
  endDate: string
  panelDate: DateValue
  panelRange: DateRangeValue
  calendarDate: CalendarValue
}

const toTimestamp = (value: DateValue) => {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  return new Date(`${value}T00:00:00`).getTime()
}

const displayDate = (value: DateValue) => {
  if (value instanceof Date) return value.toLocaleDateString('zh-CN')
  return String(value)
}

const displayRange = (value: DateRangeValue) => value.map(displayDate).join(' 至 ')

export default defineComponent({
  name: 'TemplateDateExamples',
  setup() {
    const formData = reactive<DateExampleData>({
      singleDate: '2026-04-15',
      rangeDate: ['2026-05-01', '2026-05-20'],
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      panelDate: '2026-04-15',
      panelRange: ['2026-06-01', '2026-06-18'],
      calendarDate: '2026-04-15'
    })

    // 开始日期不能晚于结束日期，结束日期也不能早于开始日期。
    const disableStartDate = (date: DateValue) => {
      return formData.endDate ? toTimestamp(date) > toTimestamp(formData.endDate) : false
    }
    const disableEndDate = (date: DateValue) => {
      return formData.startDate ? toTimestamp(date) < toTimestamp(formData.startDate) : false
    }

    const handleCalendarCellClick: NonNullable<CalendarProps['onCellClick']> = ({ cell }) => {
      formData.calendarDate = cell.formattedDate ?? ''
    }

    return () => (
      <PageContainer
        title="日期选择"
        description="演示日期选择框、开始与结束日期联动、独立日期面板和完整日历板；所有值均为本地示例。"
      >
        <SectionCard title="日期选择框" description="单个日期与完整范围选择均支持 v-model 和清空。">
          <Form data={formData} labelWidth={90}>
            <FormGrid>
              <FormItem label="单个日期" name="singleDate">
                <FormDatePicker v-model={formData.singleDate} placeholder="请选择日期" valueType="YYYY-MM-DD" />
              </FormItem>
              <FormItem label="日期范围" name="rangeDate">
                <FormDateRangePicker
                  v-model={formData.rangeDate}
                  placeholder={['开始日期', '结束日期']}
                  valueType="YYYY-MM-DD"
                />
              </FormItem>
            </FormGrid>
          </Form>
        </SectionCard>

        <SectionCard
          title="开始和结束联动"
          description="开始日期不能晚于结束日期，结束日期不能早于开始日期；清空任一端后，另一端恢复不限。"
        >
          <Form data={formData} labelWidth={90}>
            <FormGrid>
              <FormItem label="开始日期" name="startDate">
                <FormDatePicker
                  v-model={formData.startDate}
                  placeholder="请选择开始日期"
                  disableDate={disableStartDate}
                  valueType="YYYY-MM-DD"
                />
              </FormItem>
              <FormItem label="结束日期" name="endDate">
                <FormDatePicker
                  v-model={formData.endDate}
                  placeholder="请选择结束日期"
                  disableDate={disableEndDate}
                  valueType="YYYY-MM-DD"
                />
              </FormItem>
            </FormGrid>
          </Form>
        </SectionCard>

        <SectionCard title="日历板" description="完整月历支持年月切换、周末显示和日期点击选择，当前值由页面管理。">
          <FormCalendar
            value={formData.calendarDate}
            year={2026}
            month={4}
            firstDayOfWeek={1}
            isShowWeekendDefault={true}
            onCellClick={handleCalendarCellClick}
          />
          <p class="date-example-result">当前选中：{displayDate(formData.calendarDate)}</p>
        </SectionCard>

        <SectionCard title="日期面板" description="不依赖输入框和弹层，直接在页面中选择单个日期。">
          <FormDatePickerPanel v-model={formData.panelDate} />
          <p class="date-example-result">当前日期：{displayDate(formData.panelDate)}</p>
        </SectionCard>

        <SectionCard title="日期范围面板" description="通过双面板连续选择开始与结束日期，并同步显示当前范围。">
          <FormDateRangePickerPanel v-model={formData.panelRange} />
          <p class="date-example-result">当前范围：{displayRange(formData.panelRange)}</p>
        </SectionCard>
      </PageContainer>
    )
  }
})
