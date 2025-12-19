<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="关键字" prop="keyword">
        <el-input
          v-model="queryParams.keyword"
          placeholder="名称/编码"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
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

    <el-table v-loading="loading" :data="appList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="应用编码" align="center" prop="code" />
      <el-table-column label="应用名称" align="center" prop="name" />
      <el-table-column label="启用" align="center" prop="isActive">
        <template #default="scope">
          <el-tag :type="scope.row.isActive ? 'success' : 'info'">{{ scope.row.isActive ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center" prop="description" show-overflow-tooltip />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="应用编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入应用编码" />
        </el-form-item>
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入应用名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
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

<script setup name="MiniProgramApp">
import { reactive, ref, toRefs, getCurrentInstance } from 'vue'
import { listApp, getApp, addApp, updateApp, delApp } from '@/api/miniapp/app'

const { proxy } = getCurrentInstance()

const loading = ref(true)
const appList = ref([])
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
    keyword: undefined,
    isActive: undefined
  },
  rules: {
    code: [{ required: true, message: '应用编码不能为空', trigger: 'blur' }],
    name: [{ required: true, message: '应用名称不能为空', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

function getList() {
  loading.value = true
  listApp(queryParams.value)
    .then(res => {
      appList.value = res.rows || []
      total.value = res.total || 0
    })
    .finally(() => {
      loading.value = false
    })
}

function resetFormModel() {
  form.value = {
    appId: undefined,
    code: '',
    name: '',
    description: '',
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
  ids.value = selection.map(item => item.appId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  resetFormModel()
  open.value = true
  title.value = '新增应用'
}

function handleUpdate(row) {
  const id = row?.appId || ids.value[0]
  if (!id) {
    proxy.$modal.msgWarning('请选择一条数据')
    return
  }
  resetFormModel()
  getApp(id).then(res => {
    const data = res.data || {}
    form.value = {
      appId: data.appId,
      code: data.code,
      name: data.name,
      description: data.description,
      isActive: data.isActive
    }
    open.value = true
    title.value = '修改应用'
  })
}

function submitForm() {
  proxy.$refs['formRef']?.validate(valid => {
    if (!valid) return
    const payload = {
      code: form.value.code,
      name: form.value.name,
      description: form.value.description,
      isActive: form.value.isActive
    }
    const request = form.value.appId ? updateApp(form.value.appId, payload) : addApp(payload)
    request.then(() => {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    })
  })
}

function handleDelete(row) {
  const appIds = row?.appId ? [row.appId] : ids.value
  if (!appIds.length) {
    proxy.$modal.msgWarning('请选择要删除的数据')
    return
  }
  proxy.$modal
    .confirm(`是否确认删除应用编号为 "${appIds.join(',')}" 的数据项？`)
    .then(() => delApp(appIds.join(',')))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

function cancel() {
  open.value = false
  resetFormModel()
}

getList()
</script>
