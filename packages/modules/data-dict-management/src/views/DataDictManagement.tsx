import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Alert, Button, Form, FormItem, MessagePlugin, Tag } from 'tdesign-vue-next'
import type { FormInstanceFunctions, FormRules, PageInfo, PrimaryTableCol } from 'tdesign-vue-next'
import { HTTP_ABORTED_ERROR_CODE, HttpError } from '@kacean/common'
import { AppDialog, ConfirmDialog, DataTableTemplate, FormGrid, FormInput, FormSelect, SidePanel } from '@kacean/shared'
import { createDataDictApi } from '../api/dataDict'
import type { DataDictPayload, DataDictRecord } from '../api/dataDict'
import { useServiceClient } from '../api/http'
import DictValuePanel from './DictValuePanel'

interface DictFormData {
  dictName: string
  isEnabled: number
}

const initialFormData = (): DictFormData => ({ dictName: '', isEnabled: 1 })

const enabledOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

function formatDateTime(value?: string) {
  return value ? value.replace('T', ' ').replace(/\.\d+$/, '') : '-'
}

function errorMessage(action: string, error: unknown) {
  if (error instanceof HttpError) return `${action}失败：${error.message}`
  if (error instanceof Error) return `${action}失败：${error.message}`
  return `${action}失败，请稍后重试`
}

export default defineComponent({
  name: 'DataDictManagement',
  setup() {
    const api = createDataDictApi(useServiceClient('two-ticket'))
    const rows = ref<DataDictRecord[]>([])
    const keyword = ref('')
    const appliedKeyword = ref('')
    const current = ref(1)
    const pageSize = ref(10)
    const loading = ref(false)
    const loadError = ref('')
    let listController: AbortController | undefined
    let latestListRequest = 0

    // 后端 keyword 不过滤、page 的 total/pageNum 未生效，这里本地过滤并分页。
    const filteredRows = computed(() => {
      const kw = appliedKeyword.value.toLowerCase()
      if (!kw) return rows.value
      return rows.value.filter((row) => row.dictName?.toLowerCase().includes(kw))
    })
    const total = computed(() => filteredRows.value.length)
    const pageRows = computed(() => {
      const start = (current.value - 1) * pageSize.value
      return filteredRows.value.slice(start, start + pageSize.value)
    })

    const formRef = ref<FormInstanceFunctions>()
    const formData = reactive<DictFormData>(initialFormData())
    const formVisible = ref(false)
    const editingRecord = ref<DataDictRecord | null>(null)
    const saving = ref(false)
    const deleteTarget = ref<DataDictRecord | null>(null)
    const deleteVisible = ref(false)
    const deleting = ref(false)

    /** overlay 面板状态：activeDict 决定面板管理哪一本字典的字典值。 */
    const activeDict = ref<DataDictRecord | null>(null)
    const panelVisible = ref(false)

    const rules: FormRules<DictFormData> = {
      dictName: [
        { required: true, message: '请输入字典名称', trigger: 'blur' },
        { pattern: /\S/, message: '字典名称不能只包含空白字符', trigger: 'blur' }
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
        rows.value = result ?? []
      } catch (error) {
        if (error instanceof HttpError && error.code === HTTP_ABORTED_ERROR_CODE) return
        if (requestId !== latestListRequest) return
        rows.value = []
        loadError.value = errorMessage('查询数据字典', error)
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

    const openForm = (record?: DataDictRecord) => {
      editingRecord.value = record ?? null
      Object.assign(formData, {
        dictName: record?.dictName ?? '',
        isEnabled: record?.isEnabled ?? 1
      })
      formVisible.value = true
      void nextTick(() => formRef.value?.clearValidate())
    }

    const openValuePanel = (record: DataDictRecord) => {
      activeDict.value = record
      panelVisible.value = true
    }

    const closeValuePanel = () => {
      panelVisible.value = false
    }

    const save = async () => {
      const valid = await formRef.value?.validate()
      if (valid !== true || saving.value) return

      const editing = editingRecord.value
      const payload: DataDictPayload = {
        id: editing?.id,
        externalNo: editing?.externalNo,
        dictName: formData.dictName.trim(),
        isEnabled: formData.isEnabled
      }

      saving.value = true
      try {
        const succeeded = await (editing ? api.update(payload) : api.create(payload))
        if (succeeded !== true) throw new Error('后端未确认保存成功')
        formVisible.value = false
        MessagePlugin.success(editing ? '数据字典已更新' : '数据字典已新增')
        // 面板标题跟随字典名更新，避免面板中仍显示旧名称。
        if (editing && activeDict.value?.id === editing.id) {
          activeDict.value = { ...activeDict.value, dictName: payload.dictName, isEnabled: payload.isEnabled }
        }
        await loadList()
      } catch (error) {
        MessagePlugin.error(errorMessage('保存数据字典', error))
      } finally {
        saving.value = false
      }
    }

    const askDelete = (record: DataDictRecord) => {
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
        MessagePlugin.success('数据字典已删除')
        if (activeDict.value?.id === target.id) closeValuePanel()
        if (pageRows.value.length === 1 && current.value > 1) current.value -= 1
        await loadList()
      } catch (error) {
        MessagePlugin.error(errorMessage('删除数据字典', error))
      } finally {
        deleting.value = false
      }
    }

    const columns: PrimaryTableCol[] = [
      { title: '字典名称', colKey: 'dictName', minWidth: 180, ellipsis: true },
      {
        title: '状态',
        colKey: 'isEnabled',
        width: 90,
        cell: (_h, { row }) => {
          const record = row as DataDictRecord
          const enabled = record.isEnabled === 1
          return (
            <Tag theme={enabled ? 'success' : 'default'} variant="light">
              {enabled ? '启用' : '禁用'}
            </Tag>
          )
        }
      },
      {
        title: '创建人',
        colKey: 'createBy',
        width: 110,
        ellipsis: true,
        cell: (_h, { row }) => (row as DataDictRecord).createBy || '-'
      },
      {
        title: '创建时间',
        colKey: 'createAt',
        width: 170,
        cell: (_h, { row }) => formatDateTime((row as DataDictRecord).createAt)
      },
      {
        title: '修改时间',
        colKey: 'modifyAt',
        width: 170,
        cell: (_h, { row }) => formatDateTime((row as DataDictRecord).modifyAt)
      },
      {
        title: '操作',
        colKey: 'operations',
        width: 200,
        fixed: 'right',
        cell: (_h, { row }) => {
          const record = row as DataDictRecord
          return (
            <div class="data-dict-management__operations">
              <Button size="small" variant="text" theme="primary" onClick={() => openValuePanel(record)}>
                字典值
              </Button>
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
      <div class="data-dict-management">
        <div class="data-dict-management__main">
          <DataTableTemplate
            title="数据字典管理"
            rowKey="id"
            data={pageRows.value}
            columns={columns}
            total={total.value}
            current={current.value}
            pageSize={pageSize.value}
            pageSizeOptions={[10, 20, 50]}
            loading={loading.value}
            empty={loadError.value ? '加载失败，请重试' : '暂无数据字典'}
            onPageChange={handlePageChange}
            v-slots={{
              search: () => (
                <>
                  <div class="data-dict-management__search">
                    <FormInput v-model={keyword.value} placeholder="搜索字典名称" onEnter={applyFilters} />
                    <div class="data-dict-management__search-actions">
                      <Button theme="primary" loading={loading.value} onClick={applyFilters}>
                        查询
                      </Button>
                      <Button variant="outline" onClick={resetFilters}>
                        重置
                      </Button>
                    </div>
                    <Button theme="primary" variant="outline" onClick={() => openForm()}>
                      新增字典
                    </Button>
                  </div>
                  {loadError.value ? (
                    <Alert class="data-dict-management__error" theme="error" message={loadError.value} />
                  ) : null}
                </>
              )
            }}
          />
        </div>

        <SidePanel
          visible={panelVisible.value && Boolean(activeDict.value)}
          showClose={false}
          showCollapse={false}
          mode="overlay"
          width={560}
          title={activeDict.value ? `字典值：${activeDict.value.dictName}` : '字典值'}
          onClose={closeValuePanel}
          v-slots={{
            default: () =>
              activeDict.value ? (
                <DictValuePanel
                  key={activeDict.value.id}
                  dictId={activeDict.value.id}
                  dictName={activeDict.value.dictName}
                />
              ) : null
          }}
        />

        <AppDialog
          v-model:visible={formVisible.value}
          header={editingRecord.value ? '编辑数据字典' : '新增数据字典'}
          width="520px"
          confirmLoading={saving.value}
          onConfirm={save}
        >
          <Form ref={formRef} data={formData} rules={rules} labelWidth={110}>
            <FormGrid columns={1}>
              <FormItem label="字典名称" name="dictName">
                <FormInput v-model={formData.dictName} placeholder="请输入字典名称" />
              </FormItem>
              <FormItem label="是否启用" name="isEnabled">
                <FormSelect v-model={formData.isEnabled} options={enabledOptions} clearable={false} />
              </FormItem>
            </FormGrid>
          </Form>
        </AppDialog>

        <ConfirmDialog
          v-model:visible={deleteVisible.value}
          title="确认删除数据字典？"
          content={
            deleteTarget.value ? `删除字典“${deleteTarget.value.dictName}”后不可恢复，其字典值需另行清理，请确认。` : ''
          }
          theme="danger"
          confirmText="确认删除"
          confirmLoading={deleting.value}
          onConfirm={confirmDelete}
        />
      </div>
    )
  }
})
