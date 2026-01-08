<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="所属应用" prop="appId">
        <el-select v-model="queryParams.appId" placeholder="请选择应用" clearable style="width: 200px" @change="handleAppChanged">
          <el-option v-for="item in appOptions" :key="item.appId" :label="item.name" :value="item.appId" />
        </el-select>
      </el-form-item>
      <el-form-item label="平台实例" prop="platformInstanceId">
        <el-select v-model="queryParams.platformInstanceId" placeholder="全部" clearable style="width: 200px">
          <el-option v-for="item in platformOptions" :key="item.platformInstanceId" :label="item.label" :value="item.platformInstanceId" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="OpenId/手机号/昵称" clearable style="width: 220px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="-"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 340px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="所属应用" prop="appName" min-width="160" show-overflow-tooltip />
      <el-table-column label="平台" prop="platformType" width="110" align="center" />
      <el-table-column label="OpenId" prop="openId" min-width="220" show-overflow-tooltip />
      <el-table-column label="手机号" prop="phoneNumber" width="140" align="center" show-overflow-tooltip />
      <el-table-column label="昵称" prop="nickname" min-width="140" show-overflow-tooltip />
      <el-table-column label="订阅消息" prop="subscribeMsgEnabled" width="110" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.subscribeMsgEnabled ? 'success' : 'info'">{{ scope.row.subscribeMsgEnabled ? '已开启' : '未开启' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最近登录" prop="lastLoginTime" width="170" align="center" />
      <el-table-column label="创建时间" prop="createTime" width="170" align="center" />
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <el-button type="primary" link @click="handleView(scope.row)">详情</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog title="用户详情" v-model="detailOpen" width="900px" append-to-body>
      <el-form label-width="120px" v-if="detail">
        <el-form-item label="所属应用">{{ detail.appName || '-' }}</el-form-item>
        <el-form-item label="平台">{{ detail.platformType || '-' }}</el-form-item>
        <el-form-item label="GlobalUserId">{{ detail.globalUserId || '-' }}</el-form-item>
        <el-form-item label="OpenId">{{ detail.openId || '-' }}</el-form-item>
        <el-form-item label="UnionId">{{ detail.unionId || '-' }}</el-form-item>
        <el-form-item label="手机号">{{ detail.phoneNumber || '-' }}</el-form-item>
        <el-form-item label="昵称">{{ detail.nickname || '-' }}</el-form-item>
        <el-form-item label="头像">{{ detail.avatarUrl || '-' }}</el-form-item>
        <el-form-item label="订阅消息">{{ detail.subscribeMsgEnabled ? '已开启' : '未开启' }}</el-form-item>
        <el-form-item label="最近登录">{{ detail.lastLoginTime || '-' }}</el-form-item>
        <el-form-item label="来源渠道">{{ detail.sourceChannel || '-' }}</el-form-item>
        <el-form-item label="创建时间">{{ detail.createTime || '-' }}</el-form-item>
        <el-form-item label="更新时间">{{ detail.updateTime || '-' }}</el-form-item>
        <el-form-item label="SessionKey">
          <el-input v-model="detail.sessionKey" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" readonly />
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup name="MiniProgramUser">
import { reactive, ref, toRefs, getCurrentInstance, watch } from 'vue'
import { listMiniProgramUser, getMiniProgramUser, delMiniProgramUser } from '@/api/miniapp/user'
import { listApp } from '@/api/miniapp/app'
import { listPlatform } from '@/api/miniapp/platform'
import { addDateRange } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance()

const loading = ref(true)
const userList = ref([])
const total = ref(0)
const ids = ref([])
const showSearch = ref(true)

const appOptions = ref([])
const platformOptions = ref([])
const dateRange = ref([])

const detailOpen = ref(false)
const detail = ref(null)

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    appId: undefined,
    platformInstanceId: undefined,
    keyword: undefined,
    sorting: 'createTime desc'
  }
})

const { queryParams } = toRefs(data)

async function fetchApps() {
  const res = await listApp({ pageNum: 1, pageSize: 1000 })
  appOptions.value = res.rows || []
}

async function fetchPlatforms(appId) {
  if (!appId) {
    // 未选择应用时，默认拉取全部平台实例，便于直接筛选
    const res = await listPlatform({ pageNum: 1, pageSize: 1000 })
    const rows = res.rows || []
    platformOptions.value = rows.map(x => ({
      platformInstanceId: x.platformInstanceId,
      label: x.platformType || x.platformInstanceId
    }))
    return
  }
  const res = await listPlatform({ pageNum: 1, pageSize: 1000, appId })
  const rows = res.rows || []
  platformOptions.value = rows.map(x => ({
    platformInstanceId: x.platformInstanceId,
    label: x.platformType || x.platformInstanceId
  }))
}

const handleAppChanged = async (appId) => {
  queryParams.value.platformInstanceId = undefined
  await fetchPlatforms(appId)
}

function getList() {
  loading.value = true
  const params = addDateRange({ ...queryParams.value }, dateRange.value)
  listMiniProgramUser(params).then(res => {
    userList.value = res.rows || []
    total.value = res.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function handleQuery() {
  queryParams.value.pageNum = 1
  getList()
}

function resetQuery() {
  dateRange.value = []
  proxy.resetForm('queryRef')
  queryParams.value.pageNum = 1
  queryParams.value.platformInstanceId = undefined
  getList()
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId)
}

async function handleView(row) {
  const res = await getMiniProgramUser(row.userId)
  detail.value = res.data
  detailOpen.value = true
}

function handleDelete(row) {
  const userIds = row?.userId ? row.userId : ids.value.join(',')
  if (!userIds) {
    proxy.$modal.msgWarning('请选择要删除的用户')
    return
  }

  proxy.$modal.confirm('确认删除选中的小程序用户吗？').then(async () => {
    await delMiniProgramUser(userIds)
    proxy.$modal.msgSuccess('删除成功')
    getList()
  })
}

fetchApps().then(() => {
  fetchPlatforms(queryParams.value.appId)
})

getList()

watch(() => queryParams.value.appId, (val) => {
  if (!val) {
    fetchPlatforms(undefined)
  }
})
</script>
