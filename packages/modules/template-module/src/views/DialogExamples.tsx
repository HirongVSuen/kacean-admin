import { defineComponent, reactive, ref } from 'vue'
import { Button, Descriptions, Form, FormItem, MessagePlugin } from 'tdesign-vue-next'
import type { FormInstanceFunctions, FormRules } from 'tdesign-vue-next'
import {
  AppDialog,
  AppDrawer,
  ConfirmDialog,
  FormGrid,
  FormInput,
  FormTextarea,
  PageContainer,
  SectionCard
} from '@kacean/shared'

interface DialogFormData {
  name: string
  owner: string
  description: string
}

const rules: FormRules<DialogFormData> = {
  name: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
  owner: [{ required: true, message: '请输入负责团队', trigger: 'blur' }]
}

export default defineComponent({
  name: 'TemplateDialogExamples',
  setup() {
    const formRef = ref<FormInstanceFunctions>()
    const formVisible = ref(false)
    const confirmVisible = ref(false)
    const drawerVisible = ref(false)
    const drawerMask = ref(true)
    const saving = ref(false)
    const deleting = ref(false)
    const formData = reactive<DialogFormData>({
      name: '能源数据服务平台',
      owner: '平台运营组',
      description: '用于演示标准弹框与表单字段组件的组合，不会保存修改。'
    })

    const save = async () => {
      const valid = await formRef.value?.validate()
      if (valid !== true) return
      saving.value = true
      await new Promise((resolve) => setTimeout(resolve, 500))
      saving.value = false
      formVisible.value = false
      MessagePlugin.success('表单校验通过，弹框示例未保存数据')
    }

    const confirmDelete = async () => {
      deleting.value = true
      await new Promise((resolve) => setTimeout(resolve, 500))
      deleting.value = false
      confirmVisible.value = false
      MessagePlugin.success('确认操作已完成，示例未删除数据')
    }

    const openDrawer = (mask: boolean) => {
      drawerMask.value = mask
      drawerVisible.value = true
    }

    return () => (
      <PageContainer
        title="弹框组件"
        description="演示标准对话框、确认对话框与抽屉；所有操作均为本地交互，不保存或删除数据。"
      >
        <SectionCard title="标准对话框" description="统一宽度与关闭行为，可与表单栅格、字段组件和校验组合。">
          <Button theme="primary" onClick={() => (formVisible.value = true)}>
            打开表单弹框
          </Button>
        </SectionCard>

        <SectionCard title="确认对话框" description="通过主题、按钮文案和加载状态表达危险操作与异步确认。">
          <Button theme="danger" variant="outline" onClick={() => (confirmVisible.value = true)}>
            删除项目
          </Button>
        </SectionCard>

        <SectionCard
          title="抽屉"
          description="复用 SidePanel 的 overlay 形态，带滑入滑出过渡；无遮罩版本不遮挡背景，面板外区域可继续操作。"
        >
          <div class="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => openDrawer(true)}>
              查看项目详情
            </Button>
            <Button variant="outline" onClick={() => openDrawer(false)}>
              打开无遮罩抽屉
            </Button>
          </div>
        </SectionCard>

        <AppDialog
          v-model:visible={formVisible.value}
          header="编辑平台信息"
          width="640px"
          confirmLoading={saving.value}
          onConfirm={save}
        >
          <Form ref={formRef} data={formData} rules={rules} labelWidth={90}>
            <FormGrid columns={1}>
              <FormItem label="平台名称" name="name">
                <FormInput v-model={formData.name} placeholder="请输入平台名称" />
              </FormItem>
              <FormItem label="负责团队" name="owner">
                <FormInput v-model={formData.owner} placeholder="请输入负责团队" />
              </FormItem>
              <FormItem label="平台简介" name="description">
                <FormTextarea
                  v-model={formData.description}
                  placeholder="请输入平台简介"
                  autosize={{ minRows: 3, maxRows: 5 }}
                />
              </FormItem>
            </FormGrid>
          </Form>
        </AppDialog>

        <ConfirmDialog
          v-model:visible={confirmVisible.value}
          title="确认删除项目？"
          content="删除后项目将不再显示。此弹框仅演示确认流程，不会删除任何数据。"
          theme="danger"
          confirmText="确认删除"
          confirmLoading={deleting.value}
          onConfirm={confirmDelete}
        />

        <AppDrawer v-model:visible={drawerVisible.value} mask={drawerMask.value} title="项目详情" width={420}>
          <Descriptions column={1} bordered>
            <Descriptions.DescriptionsItem label="项目名称">能源数据服务平台</Descriptions.DescriptionsItem>
            <Descriptions.DescriptionsItem label="负责团队">平台运营组</Descriptions.DescriptionsItem>
            <Descriptions.DescriptionsItem label="项目状态">运行中</Descriptions.DescriptionsItem>
            <Descriptions.DescriptionsItem label="可见范围">仅内部访问</Descriptions.DescriptionsItem>
            <Descriptions.DescriptionsItem label="项目说明">
              统一维护能耗指标与数据服务目录，当前内容仅用于抽屉布局演示。
            </Descriptions.DescriptionsItem>
          </Descriptions>
        </AppDrawer>
      </PageContainer>
    )
  }
})
