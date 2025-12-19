<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="所属应用" prop="appId">
        <el-select v-model="queryParams.appId" placeholder="请选择应用" clearable style="width: 200px">
          <el-option v-for="item in appOptions" :key="item.appId" :label="item.name" :value="item.appId" />
        </el-select>
      </el-form-item>
      <el-form-item label="平台类型" prop="platformType">
        <el-input v-model="queryParams.platformType" placeholder="如 wechat/alipay" clearable style="width: 200px" />
      </el-form-item>
      <el-form-item label="是否启用" prop="isActive">
        <el-select v-model="queryParams.isActive" placeholder="全部" clearable style="width: 140px">
          <el-option :value="true" label="启用" />
          <el-option :value="false" label="禁用" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="platformList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="应用" align="center" prop="appName" />
      <el-table-column label="平台类型" align="center" prop="platformType" />
      <el-table-column label="订阅消息" align="center" prop="enableSubscribeMsg">
        <template #default="scope">
          <el-tag :type="scope.row.enableSubscribeMsg ? 'success' : 'info'">
            {{ scope.row.enableSubscribeMsg ? '开' : '关' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="启用" align="center" prop="isActive">
        <template #default="scope">
          <el-tag :type="scope.row.isActive ? 'success' : 'info'">{{ scope.row.isActive ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="所属应用" prop="appId">
          <el-select v-model="form.appId" placeholder="请选择应用">
            <el-option v-for="item in appOptions" :key="item.appId" :label="item.name" :value="item.appId" />
          </el-select>
        </el-form-item>
        <el-form-item label="平台类型" prop="platformType">
          <el-input v-model="form.platformType" placeholder="如 wechat/alipay" />
        </el-form-item>
        <el-form-item label="平台 AppId" prop="appIdValue">
          <el-input v-model="form.appIdValue" placeholder="请输入平台 AppId" />
        </el-form-item>
        <el-form-item label="平台 Secret" prop="appSecretValue">
          <el-input v-model="form.appSecretValue" placeholder="请输入平台密钥" />
        </el-form-item>
        <el-form-item label="证书路径" prop="certPath">
          <el-input v-model="form.certPath" placeholder="可选，支付等能力需要" />
        </el-form-item>
        <el-form-item label="回调域名" prop="callbackDomain">
          <el-input v-model="form.callbackDomain" placeholder="回调/消息推送域名" />
        </el-form-item>
        <el-form-item label="消息 Token" prop="messageToken">
          <el-input v-model="form.messageToken" placeholder="消息校验 Token" />
        </el-form-item>
        <el-form-item label="订阅消息" prop="enableSubscribeMsg">
          <el-switch v-model="form.enableSubscribeMsg" />
        </el-form-item>
        <el-form-item label="是否启用" prop="isActive">
          <el-switch v-model="form.isActive" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MiniProgramPlatform">
import { ref, reactive, toRefs, getCurrentInstance } from 'vue'
import { listPlatform, getPlatform, addPlatform, updatePlatform, delPlatform } from '@/api/miniapp/platform'
import { listApp } from '@/api/miniapp/app'

const { proxy } = getCurrentInstance()

const loading = ref(true)
const platformList = ref([])
const appOptions = ref([])
const showSearch = ref(true)
const open = ref(false)
const total = ref(0)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    appId: undefined,
    platformType: undefined,
    isActive: undefined
  },
  rules: {
    appId: [{ required: true, message: '所属应用不能为空', trigger: 'change' }],
    platformType: [{ required: true, message: '平台类型不能为空', trigger: 'blur' }],
    appIdValue: [{ required: true, message: '平台 AppId 不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

function loadAppOptions() {
  listApp({ pageNum: 1, pageSize: 1000 }).then(res => {
    appOptions.value = res.rows || []
  })
}

function getList() {
  loading.value = true
  listPlatform(queryParams.value)
    .then(res => {
      platformList.value = res.rows || []
      total.value = res.total || 0
    })
    .finally(() => {
      loading.value = false
    })
}

function resetFormModel() {
  form.value = {
    platformInstanceId: undefined,
    appId: undefined,
    platformType: '',
    appIdValue: '',
    appSecretValue: '',
    certPath: '',
    callbackDomain: '',
    messageToken: '',
    enableSubscribeMsg: false,
    isActive: true
  }
  proxy?.resetForm?.('formRef')
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  proxy.resetForm('queryRef')
  handleQuery()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.platformInstanceId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  resetFormModel()
  open.value = true
  title.value = '新增平台实例'
}

function handleUpdate(row) {
  const id = row?.platformInstanceId || ids.value[0]
  if (!id) {
    proxy.$modal.msgWarning('请选择一条数据')
    return
  }
  resetFormModel()
  getPlatform(id).then(res => {
    const data = res.data || {}
    form.value = {
      platformInstanceId: data.platformInstanceId,
      appId: data.appId,
      platformType: data.platformType,
      appIdValue: data.appIdValue,
      appSecretValue: data.appSecretValue,
      certPath: data.certPath,
      callbackDomain: data.callbackDomain,
      messageToken: data.messageToken,
      enableSubscribeMsg: data.enableSubscribeMsg,
      isActive: data.isActive
    }
    open.value = true
    title.value = '修改平台实例'
  })
}

function submitForm() {
  proxy.$refs['formRef']?.validate(valid => {
    if (!valid) return
    const payload = {
      appId: form.value.appId,
      platformType: form.value.platformType,
      appIdValue: form.value.appIdValue,
      appSecretValue: form.value.appSecretValue,
      certPath: form.value.certPath,
      callbackDomain: form.value.callbackDomain,
      messageToken: form.value.messageToken,
      enableSubscribeMsg: form.value.enableSubscribeMsg,
      isActive: form.value.isActive
    }
    const request = form.value.platformInstanceId
      ? updatePlatform(form.value.platformInstanceId, payload)
      : addPlatform(payload)
    request.then(() => {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    })
  })
}

function handleDelete(row) {
  const platformIds = row?.platformInstanceId ? [row.platformInstanceId] : ids.value
  if (!platformIds.length) {
    proxy.$modal.msgWarning('请选择要删除的数据')
    return
  }
  proxy.$modal
    .confirm(`是否确认删除平台实例编号为 "${platformIds.join(',')}" 的数据项？`)
    .then(() => delPlatform(platformIds.join(',')))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

function cancel() {
  open.value = false
  resetFormModel()
}

loadAppOptions()
getList()
</script>
