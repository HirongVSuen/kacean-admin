import { defineComponent, reactive, ref } from 'vue'
import {
  Alert,
  Button,
  DatePicker,
  Descriptions,
  Form,
  FormItem,
  Input,
  InputNumber,
  MessagePlugin,
  RadioGroup,
  Select,
  Switch,
  Textarea
} from 'tdesign-vue-next'
import type { FormInstanceFunctions, FormRules } from 'tdesign-vue-next'
import { FormActions, FormGrid, PageContainer, SectionCard, StepFormLayout } from '@kacean/shared'

interface StepFormData {
  name: string
  type: string
  owner: string
  startDate: string
  budget: number
  description: string
  visibility: 'public' | 'private'
  layout: 'side' | 'top'
  notification: boolean
}

const initialFormData = (): StepFormData => ({
  name: '客户协同管理平台',
  type: '管理平台',
  owner: '林晓',
  startDate: '2026-04-01',
  budget: 30,
  description: '面向内部团队的客户信息、跟进记录与交付任务协同平台。',
  visibility: 'private',
  layout: 'side',
  notification: true
})

const typeOptions = ['管理平台', '数据看板', '运营工具'].map((value) => ({ label: value, value }))
const ownerOptions = ['林晓', '陈明', '周洁'].map((value) => ({ label: value, value }))
const steps = [{ title: '基本信息' }, { title: '展示配置' }, { title: '确认提交' }]

export default defineComponent({
  name: 'TemplateStepForm',
  setup() {
    const formRef = ref<FormInstanceFunctions>()
    const current = ref(0)
    const submitting = ref(false)
    const formData = reactive<StepFormData>(initialFormData())

    const rules: FormRules<StepFormData> = {
      name: [
        { required: true, message: '请输入项目名称', trigger: 'blur' },
        { min: 4, message: '项目名称至少 4 个字符', trigger: 'blur' }
      ],
      type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
      owner: [{ required: true, message: '请选择负责人', trigger: 'change' }],
      startDate: [{ required: true, message: '请选择启动日期', trigger: 'change' }],
      layout: [{ required: true, message: '请选择导航布局', trigger: 'change' }]
    }

    const next = async () => {
      if (current.value === 0) {
        const valid = await formRef.value?.validate()
        if (valid !== true) return
      }
      current.value = Math.min(current.value + 1, steps.length - 1)
    }

    const submit = async () => {
      const valid = await formRef.value?.validate()
      if (valid !== true) return
      submitting.value = true
      await new Promise((resolve) => setTimeout(resolve, 500))
      submitting.value = false
      MessagePlugin.success('模板校验通过，未提交真实数据')
    }

    const reset = () => {
      formRef.value?.reset()
      Object.assign(formData, initialFormData())
      current.value = 0
      formRef.value?.clearValidate()
    }

    return () => (
      <PageContainer
        title="分步表单"
        description="将较长的创建流程拆分为基本信息、展示配置和确认提交，适合项目创建、入驻申请等场景。"
      >
        <SectionCard title="创建项目" description="当前为静态交互模板，最终提交不会请求接口或写入业务数据。">
          <Form
            ref={formRef}
            class="example-form example-form--centered"
            data={formData}
            rules={rules}
            labelWidth={110}
          >
            <StepFormLayout current={current.value} steps={steps}>
              {current.value === 0 && (
                <FormGrid>
                  <FormItem label="项目名称" name="name">
                    <Input v-model={formData.name} placeholder="请输入项目名称" clearable />
                  </FormItem>
                  <FormItem label="项目类型" name="type">
                    <Select v-model={formData.type} options={typeOptions} placeholder="请选择项目类型" />
                  </FormItem>
                  <FormItem label="负责人" name="owner">
                    <Select v-model={formData.owner} options={ownerOptions} placeholder="请选择负责人" />
                  </FormItem>
                  <FormItem label="启动日期" name="startDate">
                    <DatePicker v-model={formData.startDate} placeholder="请选择启动日期" clearable />
                  </FormItem>
                  <FormItem label="项目预算" name="budget">
                    <InputNumber v-model={formData.budget} min={0} max={9999} suffix="万元" />
                  </FormItem>
                  <FormItem label="项目说明" name="description" class="kacean-form-grid__full">
                    <Textarea v-model={formData.description} maxlength={200} autosize={{ minRows: 3, maxRows: 5 }} />
                  </FormItem>
                </FormGrid>
              )}

              {current.value === 1 && (
                <FormGrid>
                  <FormItem label="可见范围" name="visibility">
                    <RadioGroup
                      v-model={formData.visibility}
                      options={[
                        { label: '团队可见', value: 'public' },
                        { label: '仅管理员', value: 'private' }
                      ]}
                    />
                  </FormItem>
                  <FormItem label="消息提醒" name="notification">
                    <Switch v-model={formData.notification} label={['开启', '关闭']} />
                  </FormItem>
                  <FormItem label="导航布局" name="layout" class="kacean-form-grid__full">
                    <RadioGroup
                      v-model={formData.layout}
                      options={[
                        { label: '左侧导航', value: 'side' },
                        { label: '顶部导航', value: 'top' }
                      ]}
                    />
                  </FormItem>
                </FormGrid>
              )}

              {current.value === 2 && (
                <div class="step-form-confirm">
                  <Alert theme="info" message="请确认以下信息。此模板仅演示校验与提交流程，不会保存数据。" />
                  <Descriptions column={2} bordered>
                    <Descriptions.DescriptionsItem label="项目名称">{formData.name}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="项目类型">{formData.type}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="负责人">{formData.owner}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="启动日期">{formData.startDate}</Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="项目预算">
                      {formData.budget} 万元
                    </Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="可见范围">
                      {formData.visibility === 'public' ? '团队可见' : '仅管理员'}
                    </Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="导航布局">
                      {formData.layout === 'side' ? '左侧导航' : '顶部导航'}
                    </Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="消息提醒">
                      {formData.notification ? '已开启' : '已关闭'}
                    </Descriptions.DescriptionsItem>
                    <Descriptions.DescriptionsItem label="项目说明" span={2}>
                      {formData.description}
                    </Descriptions.DescriptionsItem>
                  </Descriptions>
                  <p class="step-form-tip">点击「确认创建」后仅展示成功反馈，可返回上一步修改。</p>
                </div>
              )}
            </StepFormLayout>

            <FormActions
              split
              v-slots={{
                secondary: () => (
                  <Button variant="outline" onClick={reset}>
                    重置
                  </Button>
                ),
                default: () => (
                  <>
                    {current.value > 0 && (
                      <Button variant="outline" onClick={() => (current.value -= 1)}>
                        上一步
                      </Button>
                    )}
                    {current.value < steps.length - 1 ? (
                      <Button theme="primary" onClick={next}>
                        下一步
                      </Button>
                    ) : (
                      <Button theme="primary" loading={submitting.value} onClick={submit}>
                        确认创建
                      </Button>
                    )}
                  </>
                )
              }}
            />
          </Form>
        </SectionCard>
      </PageContainer>
    )
  }
})
