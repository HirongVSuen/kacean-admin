import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Alert, Button, Form, FormItem, MessagePlugin } from 'tdesign-vue-next'
import type { FormInstanceFunctions, FormRules, PageInfo, PrimaryTableCol } from 'tdesign-vue-next'
import { HTTP_ABORTED_ERROR_CODE, HttpError } from '@kacean/common'
import { AppDialog, ConfirmDialog, FormInput, PaginatedTable } from '@kacean/shared'
import { createDataDictValueApi } from '../api/dataDictValue'
import type { DataDictValuePayload, DataDictValueRecord } from '../api/dataDictValue'
import { useServiceClient } from '../api/http'

interface DictValueFormData {
  dictCode: string
  dictValue: string
}

const initialFormData = (): DictValueFormData => ({ dictCode: '', dictValue: '' })

function formatDateTime(value?: string) {
  return value ? value.replace('T', ' ').replace(/\.\d+$/, '') : '-'
}

function errorMessage(action: string, error: unknown) {
  if (error instanceof HttpError) return `${action}失败：${error.message}`
  if (error instanceof Error) return `${action}失败：${error.message}`
  return `${action}失败，请稍后重试`
}

/** overlay 面板内容：管理指定数据字典下的字典值，列表本地过滤并分页。 */
export default defineComponent({
  name: 'DictValuePanel',
  props: {
    dictId: { type: String, required: true },
    dictName: { type: String, default: '' }
  },
  setup(props) {
    const api = createDataDictValueApi(useServiceClient('two-ticket'))
    /** 仅保存当前字典的值；后端 Query 不支持 dictId 条件，加载后按 dictId 过滤。 */
    const rows = ref<DataDictValueRecord[]>([])
    const keyword = ref('')
    const appliedKeyword = ref('')
    const current = ref(1)
    const pageSize = ref(10)
    const loading = ref(false)
    const loadError = ref('')
    let listController: AbortController | undefined
    let latestListRequest = 0

    const filteredRows = computed(() => {
      const kw = appliedKeyword.value.toLowerCase()
      if (!kw) return rows.value
      return rows.value.filter(
        (row) => row.dictCode?.toLowerCase().includes(kw) || row.dictValue?.toLowerCase().includes(kw)
      )
    })
    const total = computed(() => filteredRows.value.length)
    const pageRows = computed(() => {
      const start = (current.value - 1) * pageSize.value
      return filteredRows.value.slice(start, start + pageSize.value)
    })

    const formRef = ref<FormInstanceFunctions>()
    const formData = reactive<DictValueFormData>(initialFormData())
    const formVisible = ref(false)
    const editingRecord = ref<DataDictValueRecord | null>(null)
    const saving = ref(false)
    const deleteTarget = ref<DataDictValueRecord | null>(null)
    const deleteVisible = ref(false)
    const deleting = ref(false)

    const rules: FormRules<DictValueFormData> = {
      dictCode: [
        { required: true, message: '请输入字典编码', trigger: 'blur' },
        { pattern: /\S/, message: '字典编码不能只包含空白字符', trigger: 'blur' }
      ],
      dictValue: [
        { required: true, message: '请输入字典值', trigger: 'blur' },
        { pattern: /\S/, message: '字典值不能只包含空白字符', trigger: 'blur' }
      ]
    }

    const loadList = async () => {
      listController?.abort()
      const controller = new AbortController()
      listController = controller
      const requestId = ++latestListRequest
      loading.value = true
      loadError.value = ''

      try {
        const result = await api.list(
          { keyword: '', sorts: [{ field: 'createAt', direction: 'DESC' }] },
          controller.signal
        )
        if (requestId !== latestListRequest) return
        rows.value = (result ?? []).filter((row) => String(row.dictId) === props.dictId)
      } catch (error) {
        if (error instanceof HttpError && error.code === HTTP_ABORTED_ERROR_CODE) return
        if (requestId !== latestListRequest) return
        rows.value = []
        loadError.value = errorMessage('查询字典值', error)
      } finally {
        if (requestId === latestListRequest) loading.value = false
      }
    }

    const applyFilters = () => {
      appliedKeyword.value = keyword.value.trim()
      current.value = 1
    }

    const resetFilters = () => {
      keyword.value = ''
      applyFilters()
    }

    const handlePageChange = (pageInfo: PageInfo) => {
      current.value = pageInfo.current
      pageSize.value = pageInfo.pageSize
    }

    const openForm = (record?: DataDictValueRecord) => {
      editingRecord.value = record ?? null
      Object.assign(formData, {
        dictCode: record?.dictCode ?? '',
        dictValue: record?.dictValue ?? ''
      })
      formVisible.value = true
      void nextTick(() => formRef.value?.clearValidate())
    }

    const save = async () => {
      const valid = await formRef.value?.validate()
      if (valid !== true || saving.value) return

      const editing = editingRecord.value
      const payload: DataDictValuePayload = {
        id: editing?.id,
        externalNo: editing?.externalNo,
        dictId: props.dictId,
        dictCode: formData.dictCode.trim(),
        dictValue: formData.dictValue.trim()
      }

      saving.value = true
      try {
        const succeeded = await (editing ? api.update(payload) : api.create(payload))
        if (succeeded !== true) throw new Error('后端未确认保存成功')
        formVisible.value = false
        MessagePlugin.success(editing ? '字典值已更新' : '字典值已新增')
        await loadList()
      } catch (error) {
        MessagePlugin.error(errorMessage('保存字典值', error))
      } finally {
        saving.value = false
      }
    }

    const askDelete = (record: DataDictValueRecord) => {
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
        MessagePlugin.success('字典值已删除')
        if (pageRows.value.length === 1 && current.value > 1) current.value -= 1
        await loadList()
      } catch (error) {
        MessagePlugin.error(errorMessage('删除字典值', error))
      } finally {
        deleting.value = false
      }
    }

    const columns: PrimaryTableCol[] = [
      { title: '字典编码', colKey: 'dictCode', minWidth: 110, ellipsis: true },
      { title: '字典值', colKey: 'dictValue', minWidth: 110, ellipsis: true },
      {
        title: '修改时间',
        colKey: 'modifyAt',
        width: 160,
        cell: (_h, { row }) => formatDateTime((row as DataDictValueRecord).modifyAt)
      },
      {
        title: '操作',
        colKey: 'operations',
        width: 110,
        cell: (_h, { row }) => {
          const record = row as DataDictValueRecord
          return (
            <div class="data-dict-management__operations">
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

    onMounted(() => void loadList())
    onBeforeUnmount(() => {
      latestListRequest += 1
      listController?.abort()
    })

    return () => (
      <div class="data-dict-values">
        <div class="data-dict-values__toolbar">
          <FormInput v-model={keyword.value} placeholder="搜索字典编码 / 字典值" onEnter={applyFilters} />
          <div class="data-dict-management__search-actions">
            <Button theme="primary" loading={loading.value} onClick={applyFilters}>
              查询
            </Button>
            <Button variant="outline" onClick={resetFilters}>
              重置
            </Button>
          </div>
          <Button theme="primary" variant="outline" onClick={() => openForm()}>
            新增字典值
          </Button>
        </div>
        {loadError.value ? <Alert class="data-dict-management__error" theme="error" message={loadError.value} /> : null}
        <PaginatedTable
          rowKey="id"
          data={pageRows.value}
          columns={columns}
          total={total.value}
          current={current.value}
          pageSize={pageSize.value}
          pageSizeOptions={[10, 20, 50]}
          fillHeight
          loading={loading.value}
          onPageChange={handlePageChange}
        />

        <AppDialog
          v-model:visible={formVisible.value}
          header={editingRecord.value ? '编辑字典值' : '新增字典值'}
          width="480px"
          confirmLoading={saving.value}
          onConfirm={save}
        >
          <Form ref={formRef} data={formData} rules={rules} labelWidth={90}>
            <FormItem label="所属字典">
              <span class="data-dict-values__dict-name">{props.dictName || props.dictId}</span>
            </FormItem>
            <FormItem label="字典编码" name="dictCode">
              <FormInput v-model={formData.dictCode} placeholder="请输入字典编码" />
            </FormItem>
            <FormItem label="字典值" name="dictValue">
              <FormInput v-model={formData.dictValue} placeholder="请输入字典中文值" />
            </FormItem>
          </Form>
        </AppDialog>

        <ConfirmDialog
          v-model:visible={deleteVisible.value}
          title="确认删除字典值？"
          content={deleteTarget.value ? `删除字典值“${deleteTarget.value.dictValue}”后不可恢复，请确认。` : ''}
          theme="danger"
          confirmText="确认删除"
          confirmLoading={deleting.value}
          onConfirm={confirmDelete}
        />
      </div>
    )
  }
})
