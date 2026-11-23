import { defineComponent, reactive, ref } from 'vue'
import { Button, Form, FormItem, MessagePlugin } from 'tdesign-vue-next'
import type { FormInstanceFunctions, FormRules, UploadFile } from 'tdesign-vue-next'
import {
  FormActions,
  FormCheckboxGroup,
  FormDatePicker,
  FormGrid,
  FormInput,
  FormRadioGroup,
  FormSelect,
  FormSwitch,
  FormTextarea,
  FormUpload,
  PageContainer,
  SectionCard
} from '@kacean/shared'

interface SectionFormData {
  platformName: string
  platformCode: string
  category: string
  owner: string
  effectiveDate: string
  accessMode: 'internal' | 'public'
  audiences: string[]
  maintenance: boolean
  description: string
  logoFiles: UploadFile[]
  attachments: UploadFile[]
}

const initialFormData = (): SectionFormData => ({
  platformName: '能源数据服务平台',
  platformCode: 'energy-data',
  category: '数据服务',
  owner: '平台运营组',
  effectiveDate: '2026-04-15',
  accessMode: 'internal',
  audiences: ['项目管理员', '数据分析师'],
  maintenance: false,
  description: '整合项目能耗指标与数据服务目录，为内部业务团队提供统一的数据查询入口。',
  logoFiles: [],
  attachments: []
})

const rules: FormRules<SectionFormData> = {
  platformName: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
  platformCode: [
    { required: true, message: '请输入平台编码', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9-]*$/, message: '使用小写字母、数字与连字符', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择服务分类', trigger: 'change' }],
  audiences: [{ required: true, message: '请至少选择一个使用角色', trigger: 'change' }]
}

export default defineComponent({
  name: 'TemplateSectionForm',
  setup() {
    const formRef = ref<FormInstanceFunctions>()
    const saving = ref(false)
    const formData = reactive<SectionFormData>(initialFormData())

    const submit = async () => {
      const valid = await formRef.value?.validate()
      if (valid !== true) return
      saving.value = true
      await new Promise((resolve) => setTimeout(resolve, 500))
      saving.value = false
      MessagePlugin.success('表单校验通过，模板未保存数据')
    }

    const reset = () => {
      formRef.value?.reset()
      Object.assign(formData, initialFormData())
      formRef.value?.clearValidate()
    }

    return () => (
      <PageContainer
        title="分块表单"
        description="按信息语义组织字段，适合平台设置、资料维护等中等长度表单；所有输入均为本地示例。"
      >
        <Form ref={formRef} class="example-form example-form--centered" data={formData} rules={rules} labelWidth={110}>
          <div class="section-form">
            <SectionCard title="基础信息" description="填写业务对象的核心标识、分类与责任归属。">
              <FormGrid>
                <FormItem label="平台名称" name="platformName">
                  <FormInput v-model={formData.platformName} placeholder="请输入平台名称" />
                </FormItem>
                <FormItem label="平台编码" name="platformCode">
                  <FormInput v-model={formData.platformCode} placeholder="例如 energy-data" />
                </FormItem>
                <FormItem label="服务分类" name="category">
                  <FormSelect
                    v-model={formData.category}
                    options={['数据服务', '业务应用', '公共能力'].map((value) => ({ label: value, value }))}
                    placeholder="请选择服务分类"
                  />
                </FormItem>
                <FormItem label="负责团队" name="owner">
                  <FormInput v-model={formData.owner} placeholder="请输入负责团队" />
                </FormItem>
                <FormItem label="生效日期" name="effectiveDate">
                  <FormDatePicker v-model={formData.effectiveDate} placeholder="请选择生效日期" />
                </FormItem>
              </FormGrid>
            </SectionCard>

            <SectionCard title="使用范围" description="配置面向用户与消息提醒，展示复选框和开关的典型组合。">
              <FormGrid>
                <FormItem label="访问方式" name="accessMode">
                  <FormRadioGroup
                    v-model={formData.accessMode}
                    options={[
                      { label: '仅内部访问', value: 'internal' },
                      { label: '开放访问', value: 'public' }
                    ]}
                  />
                </FormItem>
                <FormItem label="维护模式" name="maintenance">
                  <FormSwitch v-model={formData.maintenance} label={['开启', '关闭']} />
                </FormItem>
                <FormItem label="使用角色" name="audiences" class="kacean-form-grid__full">
                  <FormCheckboxGroup
                    v-model={formData.audiences}
                    options={['项目管理员', '数据分析师', '普通成员'].map((value) => ({ label: value, value }))}
                  />
                </FormItem>
              </FormGrid>
            </SectionCard>

            <SectionCard title="附件材料" description="演示单文件与多文件选择；autoUpload=false，不会发起上传请求。">
              <FormGrid>
                <FormItem label="平台图标" name="logoFiles" class="kacean-form-grid__full">
                  <FormUpload
                    v-model={formData.logoFiles}
                    autoUpload={false}
                    accept=".png,.jpg,.jpeg,.svg"
                    tips="单文件示例：支持 PNG、JPG、JPEG、SVG，仅本地选择，不会上传。"
                  />
                </FormItem>
                <FormItem label="附件资料" name="attachments" class="kacean-form-grid__full">
                  <FormUpload
                    v-model={formData.attachments}
                    autoUpload={false}
                    multiple
                    max={5}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    tips="多文件示例：最多 5 个文件，仅本地选择，不会上传。"
                  />
                </FormItem>
              </FormGrid>
            </SectionCard>

            <SectionCard title="附加说明" description="使用多行文本补充背景信息，长文本字段独占一行。">
              <FormGrid>
                <FormItem label="平台简介" name="description" class="kacean-form-grid__full">
                  <FormTextarea
                    v-model={formData.description}
                    placeholder="请输入平台简介"
                    maxlength={300}
                    autosize={{ minRows: 4, maxRows: 7 }}
                  />
                </FormItem>
              </FormGrid>
            </SectionCard>

            <FormActions>
              <Button variant="outline" onClick={reset}>
                重置
              </Button>
              <Button theme="primary" loading={saving.value} onClick={submit}>
                保存配置
              </Button>
            </FormActions>
          </div>
        </Form>
      </PageContainer>
    )
  }
})
