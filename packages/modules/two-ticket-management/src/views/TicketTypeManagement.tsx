import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Alert, Button, Form, FormItem, MessagePlugin } from 'tdesign-vue-next'
import type { FormInstanceFunctions, FormRules, PageInfo, PrimaryTableCol } from 'tdesign-vue-next'
import { HTTP_ABORTED_ERROR_CODE, HttpError } from '@kacean/common'
import { AppDialog, ConfirmDialog, DataTableTemplate, FormGrid, FormInput } from '@kacean/ui'
import { createTicketTypeApi } from '../api/ticketType'
import type { TicketTypePayload, TicketTypeRecord } from '../api/ticketType'
import { http } from '../index'

interface TicketTypeFormData {
  ticketTypeName: string
  catalogNo: string
}

const initialFormData = (): TicketTypeFormData => ({ ticketTypeName: '', catalogNo: '' })

const rules: FormRules<TicketTypeFormData> = {
  ticketTypeName: [
    { required: true, message: '请输入票种类型名称', trigger: 'blur' },
    { pattern: /\S/, message: '票种类型名称不能只包含空白字符', trigger: 'blur' }
  ],
  catalogNo: [
    { required: true, message: '请输入类目编号', trigger: 'blur' },
    { pattern: /\S/, message: '类目编号不能只包含空白字符', trigger: 'blur' }
  ]
}

function formatDateTime(value?: string) {
  return value ? value.replace('T', ' ').replace(/\.\d+$/, '') : '-'
}

function errorMessage(action: string, error: unknown) {
  if (error instanceof HttpError) return `${action}失败：${error.message}`
  if (error instanceof Error) return `${action}失败：${error.message}`
  return `${action}失败，请稍后重试`
}

export default defineComponent({
  name: 'TicketTypeManagement',
  setup() {
    const api = createTicketTypeApi(http())
    const rows = ref<TicketTypeRecord[]>([])
    const current = ref(1)
    const pageSize = ref(10)
    const total = computed(() => rows.value.length)
    const pageRows = computed(() => {
      const start = (current.value - 1) * pageSize.value
      return rows.value.slice(start, start + pageSize.value)
    })
    const keyword = ref('')
    const appliedKeyword = ref('')
    const loading = ref(false)
    const loadError = ref('')
    let listController: AbortController | undefined
    let latestListRequest = 0

    const formRef = ref<FormInstanceFunctions>()
    const formData = reactive<TicketTypeFormData>(initialFormData())
    const formVisible = ref(false)
    const editingRecord = ref<TicketTypeRecord | null>(null)
    const saving = ref(false)
    const deleteTarget = ref<TicketTypeRecord | null>(null)
    const deleteVisible = ref(false)
    const deleting = ref(false)

    const loadPage = async () => {
      listController?.abort()
      const controller = new AbortController()
      listController = controller
      const requestId = ++latestListRequest
      loading.value = true
      loadError.value = ''

      try {
        const result = await api.list(
          {
            keyword: appliedKeyword.value,
            sorts: [{ field: 'createAt', direction: 'DESC' }]
          },
          controller.signal
        )
        if (requestId !== latestListRequest) return
        rows.value = result ?? []
      } catch (error) {
        if (error instanceof HttpError && error.code === HTTP_ABORTED_ERROR_CODE) return
        if (requestId !== latestListRequest) return
        rows.value = []
        loadError.value = errorMessage('查询两票类型', error)
      } finally {
        if (requestId === latestListRequest) loading.value = false
      }
    }

    const applyFilters = () => {
      appliedKeyword.value = keyword.value.trim()
      current.value = 1
      void loadPage()
    }

    const resetFilters = () => {
      keyword.value = ''
      applyFilters()
    }

    const handlePageChange = (pageInfo: PageInfo) => {
      current.value = pageInfo.current
      pageSize.value = pageInfo.pageSize
    }

    const openForm = (record?: TicketTypeRecord) => {
      editingRecord.value = record ?? null
      Object.assign(formData, {
        ticketTypeName: record?.ticketTypeName ?? '',
        catalogNo: record?.catalogNo ?? ''
      })
      formVisible.value = true
      void nextTick(() => formRef.value?.clearValidate())
    }

    const save = async () => {
      const valid = await formRef.value?.validate()
      if (valid !== true || saving.value) return

      const editing = editingRecord.value
      const payload: TicketTypePayload = {
        id: editing?.id,
        externalNo: editing?.externalNo,
        version: editing?.version,
        ticketTypeName: formData.ticketTypeName.trim(),
        catalogNo: formData.catalogNo.trim()
      }

      saving.value = true
      try {
        const succeeded = await (editing ? api.update(payload) : api.create(payload))
        if (succeeded !== true) throw new Error('后端未确认保存成功')
        formVisible.value = false
        MessagePlugin.success(editing ? '两票类型已更新' : '两票类型已新增')
        await loadPage()
      } catch (error) {
        MessagePlugin.error(errorMessage('保存两票类型', error))
      } finally {
        saving.value = false
      }
    }

    const askDelete = (record: TicketTypeRecord) => {
      deleteTarget.value = record
      deleteVisible.value = true
    }

    const confirmDelete = async () => {
      const target = deleteTarget.value
      if (!target || deleting.value) return

      deleting.value = true
      try {
        const succeeded = await api.remove(target.id)
        if (succeeded !== true) throw new Error('后端未确认删除成功')
        deleteVisible.value = false
        deleteTarget.value = null
        MessagePlugin.success('两票类型已删除')
        if (pageRows.value.length === 1 && current.value > 1) current.value -= 1
        await loadPage()
      } catch (error) {
        MessagePlugin.error(errorMessage('删除两票类型', error))
      } finally {
        deleting.value = false
      }
    }

    const columns: PrimaryTableCol[] = [
      { title: 'ID', colKey: 'id', minWidth: 190, ellipsis: true },
      { title: '票种类型名称', colKey: 'ticketTypeName', minWidth: 180, ellipsis: true },
      { title: '类目编号', colKey: 'catalogNo', minWidth: 150, ellipsis: true },
      {
        title: '外部编号',
        colKey: 'externalNo',
        minWidth: 140,
        ellipsis: true,
        cell: (_h, { row }) => (row as TicketTypeRecord).externalNo || '-'
      },
      {
        title: '创建时间',
        colKey: 'createAt',
        width: 170,
        cell: (_h, { row }) => formatDateTime((row as TicketTypeRecord).createAt)
      },
      {
        title: '修改时间',
        colKey: 'modifyAt',
        width: 170,
        cell: (_h, { row }) => formatDateTime((row as TicketTypeRecord).modifyAt)
      },
      {
        title: '操作',
        colKey: 'operations',
        width: 140,
        fixed: 'right',
        cell: (_h, { row }) => {
          const record = row as TicketTypeRecord
          return (
            <div class="ticket-type-management__operations">
              <Button size="small" variant="text" theme="primary" onClick={() => openForm(record)}>
                编辑
              </Button>
              <Button size="small" variant="text" theme="danger" onClick={() => askDelete(record)}>
                删除
              </Button>
            </div>
          )
        }
      }
    ]

    onMounted(() => void loadPage())
    onBeforeUnmount(() => {
      latestListRequest += 1
      listController?.abort()
    })

    return () => (
      <>
        <DataTableTemplate
          title="两票类型管理"
          rowKey="id"
          data={pageRows.value}
          columns={columns}
          total={total.value}
          current={current.value}
          pageSize={pageSize.value}
          pageSizeOptions={[10, 20, 50]}
          loading={loading.value}
          empty={loadError.value ? '加载失败，请重试' : '暂无两票类型'}
          onPageChange={handlePageChange}
          v-slots={{
            search: () => (
              <>
                <div class="ticket-type-management__search">
                  <FormInput v-model={keyword.value} placeholder="搜索票种类型名称或类目编号" onEnter={applyFilters} />
                  <div class="ticket-type-management__search-actions">
                    <Button theme="primary" loading={loading.value} onClick={applyFilters}>
                      查询
                    </Button>
                    <Button variant="outline" onClick={resetFilters}>
                      重置
                    </Button>
                  </div>
                  <Button theme="primary" variant="outline" onClick={() => openForm()}>
                    新增类型
                  </Button>
                </div>
                {loadError.value ? (
                  <Alert class="ticket-type-management__error" theme="error" message={loadError.value} />
                ) : null}
              </>
            )
          }}
        />

        <AppDialog
          v-model:visible={formVisible.value}
          header={editingRecord.value ? '编辑两票类型' : '新增两票类型'}
          width="520px"
          confirmLoading={saving.value}
          onConfirm={save}
        >
          <Form ref={formRef} data={formData} rules={rules} labelWidth={110}>
            <FormGrid columns={1}>
              <FormItem label="票种类型名称" name="ticketTypeName">
                <FormInput v-model={formData.ticketTypeName} placeholder="请输入票种类型名称" />
              </FormItem>
              <FormItem label="类目编号" name="catalogNo">
                <FormInput v-model={formData.catalogNo} placeholder="请输入类目编号" />
              </FormItem>
            </FormGrid>
          </Form>
        </AppDialog>

        <ConfirmDialog
          v-model:visible={deleteVisible.value}
          title="确认删除两票类型？"
          content={
            deleteTarget.value ? `删除“${deleteTarget.value.ticketTypeName}”后不可恢复，请确认该类型未被票据使用。` : ''
          }
          theme="danger"
          confirmText="确认删除"
          confirmLoading={deleting.value}
          onConfirm={confirmDelete}
        />
      </>
    )
  }
})
