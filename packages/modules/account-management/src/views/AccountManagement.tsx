import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { Alert, Button, Form, FormItem, MessagePlugin, Tag } from 'tdesign-vue-next'
import type { FormInstanceFunctions, FormRules, PageInfo, PrimaryTableCol } from 'tdesign-vue-next'
import { HTTP_ABORTED_ERROR_CODE, HttpError } from '@kacean/common'
import { AppDialog, ConfirmDialog, DataTableTemplate, FormGrid, FormInput, FormSelect } from '@kacean/shared'
import { createLoginAccountApi } from '../api/loginAccount'
import type { LoginAccountPayload, LoginAccountRecord } from '../api/loginAccount'
import { useServiceClient } from '../api/http'

interface AccountFormData {
  loginAccount: string
  loginPassword: string
  accountStatus: number
}

const initialFormData = (): AccountFormData => ({ loginAccount: '', loginPassword: '', accountStatus: 1 })

const statusOptions = [
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
  name: 'AccountManagement',
  setup() {
    const api = createLoginAccountApi(useServiceClient('two-ticket'))
    const rows = ref<LoginAccountRecord[]>([])
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
    const formData = reactive<AccountFormData>(initialFormData())
    const formVisible = ref(false)
    const editingRecord = ref<LoginAccountRecord | null>(null)
    const saving = ref(false)
    const deleteTarget = ref<LoginAccountRecord | null>(null)
    const deleteVisible = ref(false)
    const deleting = ref(false)

    const rules: FormRules<AccountFormData> = {
      loginAccount: [
        { required: true, message: '请输入登录账号', trigger: 'blur' },
        { pattern: /\S/, message: '登录账号不能只包含空白字符', trigger: 'blur' }
      ],
      loginPassword: [
        {
          validator: (value: string) => Boolean(editingRecord.value) || Boolean(value && value.trim()),
          message: '请输入登录密码',
          trigger: 'blur'
        }
      ]
    }

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
        // 后端 listByQuery 的 keyword 过滤当前未生效，先按登录账号前端兜底过滤（后端修复后结果一致）。
        const normalizedKeyword = appliedKeyword.value.toLowerCase()
        rows.value = (result ?? []).filter((record) => record.loginAccount.toLowerCase().includes(normalizedKeyword))
      } catch (error) {
        if (error instanceof HttpError && error.code === HTTP_ABORTED_ERROR_CODE) return
        if (requestId !== latestListRequest) return
        rows.value = []
        loadError.value = errorMessage('查询账号', error)
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

    const openForm = (record?: LoginAccountRecord) => {
      editingRecord.value = record ?? null
      Object.assign(formData, {
        loginAccount: record?.loginAccount ?? '',
        // 密码哈希不回显；编辑时留空表示保持原密码。
        loginPassword: '',
        accountStatus: record?.accountStatus ?? 1
      })
      formVisible.value = true
      void nextTick(() => formRef.value?.clearValidate())
    }

    const save = async () => {
      const valid = await formRef.value?.validate()
      if (valid !== true || saving.value) return

      const editing = editingRecord.value
      const loginPassword = formData.loginPassword.trim() || editing?.loginPassword || ''
      if (!loginPassword) {
        MessagePlugin.error('请输入登录密码')
        return
      }
      const payload: LoginAccountPayload = {
        id: editing?.id,
        externalNo: editing?.externalNo,
        loginAccount: formData.loginAccount.trim(),
        loginPassword,
        accountStatus: formData.accountStatus
      }

      saving.value = true
      try {
        const succeeded = await (editing ? api.update(payload) : api.create(payload))
        if (succeeded !== true) throw new Error('后端未确认保存成功')
        formVisible.value = false
        MessagePlugin.success(editing ? '账号已更新' : '账号已新增')
        await loadPage()
      } catch (error) {
        MessagePlugin.error(errorMessage('保存账号', error))
      } finally {
        saving.value = false
      }
    }

    const askDelete = (record: LoginAccountRecord) => {
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
        MessagePlugin.success('账号已删除')
        if (pageRows.value.length === 1 && current.value > 1) current.value -= 1
        await loadPage()
      } catch (error) {
        MessagePlugin.error(errorMessage('删除账号', error))
      } finally {
        deleting.value = false
      }
    }

    const columns: PrimaryTableCol[] = [
      { title: '登录账号', colKey: 'loginAccount', minWidth: 180, ellipsis: true },
      {
        title: '状态',
        colKey: 'accountStatus',
        width: 90,
        cell: (_h, { row }) => {
          const record = row as LoginAccountRecord
          const enabled = record.accountStatus === 1
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
        cell: (_h, { row }) => (row as LoginAccountRecord).createBy || '-'
      },
      {
        title: '创建时间',
        colKey: 'createAt',
        width: 170,
        cell: (_h, { row }) => formatDateTime((row as LoginAccountRecord).createAt)
      },
      {
        title: '修改时间',
        colKey: 'modifyAt',
        width: 170,
        cell: (_h, { row }) => formatDateTime((row as LoginAccountRecord).modifyAt)
      },
      {
        title: '操作',
        colKey: 'operations',
        width: 140,
        fixed: 'right',
        cell: (_h, { row }) => {
          const record = row as LoginAccountRecord
          return (
            <div class="account-management__operations">
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
          title="账号管理"
          rowKey="id"
          data={pageRows.value}
          columns={columns}
          total={total.value}
          current={current.value}
          pageSize={pageSize.value}
          pageSizeOptions={[10, 20, 50]}
          loading={loading.value}
          empty={loadError.value ? '加载失败，请重试' : '暂无账号'}
          onPageChange={handlePageChange}
          v-slots={{
            search: () => (
              <>
                <div class="account-management__search">
                  <FormInput v-model={keyword.value} placeholder="搜索登录账号" onEnter={applyFilters} />
                  <div class="account-management__search-actions">
                    <Button theme="primary" loading={loading.value} onClick={applyFilters}>
                      查询
                    </Button>
                    <Button variant="outline" onClick={resetFilters}>
                      重置
                    </Button>
                  </div>
                  <Button theme="primary" variant="outline" onClick={() => openForm()}>
                    新增账号
                  </Button>
                </div>
                {loadError.value ? (
                  <Alert class="account-management__error" theme="error" message={loadError.value} />
                ) : null}
              </>
            )
          }}
        />

        <AppDialog
          v-model:visible={formVisible.value}
          header={editingRecord.value ? '编辑账号' : '新增账号'}
          width="520px"
          confirmLoading={saving.value}
          onConfirm={save}
        >
          <Form ref={formRef} data={formData} rules={rules} labelWidth={110}>
            <FormGrid columns={1}>
              <FormItem label="登录账号" name="loginAccount">
                <FormInput v-model={formData.loginAccount} placeholder="请输入登录账号" />
              </FormItem>
              <FormItem label="登录密码" name="loginPassword">
                <FormInput
                  v-model={formData.loginPassword}
                  type="password"
                  placeholder={editingRecord.value ? '留空则保持原密码' : '请输入登录密码'}
                />
              </FormItem>
              <FormItem label="账号状态" name="accountStatus">
                <FormSelect v-model={formData.accountStatus} options={statusOptions} clearable={false} />
              </FormItem>
            </FormGrid>
          </Form>
        </AppDialog>

        <ConfirmDialog
          v-model:visible={deleteVisible.value}
          title="确认删除账号？"
          content={deleteTarget.value ? `删除账号“${deleteTarget.value.loginAccount}”后不可恢复，请确认。` : ''}
          theme="danger"
          confirmText="确认删除"
          confirmLoading={deleting.value}
          onConfirm={confirmDelete}
        />
      </>
    )
  }
})
