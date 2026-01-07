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
      <el-form-item label="订单号/交易号" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="模糊搜索" clearable style="width: 220px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="订单状态" prop="orderStatus">
        <el-select v-model="queryParams.orderStatus" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="item in orderStatusOptions" :key="item.value" :value="item.value" :label="item.label" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付状态" prop="payStatus">
        <el-select v-model="queryParams.payStatus" placeholder="全部" clearable style="width: 160px">
          <el-option v-for="item in payStatusOptions" :key="item.value" :value="item.value" :label="item.label" />
        </el-select>
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

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="订单号" prop="outTradeNo" min-width="190" show-overflow-tooltip />
      <el-table-column label="所属应用" prop="appName" min-width="160" show-overflow-tooltip />
      <el-table-column label="平台" prop="platformType" width="110" align="center" />
      <el-table-column label="商品" prop="productName" min-width="160" show-overflow-tooltip />
      <el-table-column label="金额" prop="amount" width="100" align="center" />
      <el-table-column label="支付状态" prop="payStatus" width="120" align="center">
        <template #default="scope">
          <el-tag :type="renderPayStatusType(scope.row.payStatus)">{{ scope.row.payStatus || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" prop="orderStatus" width="120" align="center">
        <template #default="scope">
          <el-tag :type="renderOrderStatusType(scope.row.orderStatus)">{{ scope.row.orderStatus || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" prop="payTime" width="170" align="center" />
      <el-table-column label="创建时间" prop="createTime" width="170" align="center" />
      <el-table-column label="操作" align="center" width="240">
        <template #default="scope">
          <el-button type="primary" link @click="handleView(scope.row)">详情</el-button>
          <el-button type="warning" link @click="handleEditStatus(scope.row)">改状态</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 详情弹窗 -->
    <el-dialog title="订单详情" v-model="detailOpen" width="900px" append-to-body>
      <el-descriptions :column="2" border v-if="detail">
        <el-descriptions-item label="订单号">{{ detail.outTradeNo }}</el-descriptions-item>
        <el-descriptions-item label="交易号">{{ detail.transactionId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="应用">{{ detail.appName || detail.appId }}</el-descriptions-item>
        <el-descriptions-item label="平台">{{ detail.platformType || detail.platformInstanceId }}</el-descriptions-item>
        <el-descriptions-item label="用户OpenId">{{ detail.openId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="商品">{{ detail.productName || detail.productId }}</el-descriptions-item>
        <el-descriptions-item label="金额">{{ detail.amount }}</el-descriptions-item>
        <el-descriptions-item label="支付状态">{{ detail.payStatus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">{{ detail.orderStatus || '-' }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ detail.payTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detail.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">下载 Token</el-divider>
      <div v-if="detail?.download">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="Token">{{ detail.download.token }}</el-descriptions-item>
          <el-descriptions-item label="过期时间">{{ detail.download.expiresAt }}</el-descriptions-item>
          <el-descriptions-item label="每日上限">{{ detail.download.dailyLimit }}</el-descriptions-item>
          <el-descriptions-item label="今日已用">{{ detail.download.usedCountToday }}</el-descriptions-item>
          <el-descriptions-item label="累计使用">{{ detail.download.totalUsedCount }}</el-descriptions-item>
          <el-descriptions-item label="是否撤销">{{ detail.download.isRevoked ? '是' : '否' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      <div v-else class="muted">暂无</div>

      <el-divider content-position="left">快照/配送信息</el-divider>
      <el-form label-width="110px">
        <el-form-item label="快照(JSON)">
          <el-input v-model="detail.snapshot" type="textarea" :autosize="{ minRows: 4, maxRows: 10 }" readonly />
        </el-form-item>
        <el-form-item label="配送(JSON)">
          <el-input v-model="detail.deliveryInfo" type="textarea" :autosize="{ minRows: 3, maxRows: 8 }" readonly />
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 状态编辑弹窗 -->
    <el-dialog title="修改状态" v-model="statusOpen" width="520px" append-to-body>
      <el-form ref="statusFormRef" :model="statusForm" label-width="110px">
        <el-form-item label="订单状态">
          <el-select v-model="statusForm.orderStatus" placeholder="不修改" clearable style="width: 320px">
            <el-option v-for="item in orderStatusOptions" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="statusForm.payStatus" placeholder="不修改" clearable style="width: 320px">
            <el-option v-for="item in payStatusOptions" :key="item.value" :value="item.value" :label="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="交易号">
          <el-input v-model="statusForm.transactionId" placeholder="可选" />
        </el-form-item>
        <el-form-item label="支付时间">
          <el-date-picker v-model="statusForm.payTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="可选" style="width: 320px" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitStatus">确定</el-button>
          <el-button @click="statusOpen = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MiniProgramOrder">
import { reactive, ref, toRefs, getCurrentInstance, watch } from 'vue'
import { listOrder, getOrder, updateOrderStatus } from '@/api/miniapp/order'
import { listApp } from '@/api/miniapp/app'
import { listPlatform } from '@/api/miniapp/platform'
import { addDateRange } from '@/utils/ruoyi'

const { proxy } = getCurrentInstance()

const loading = ref(true)
const orderList = ref([])
const total = ref(0)
const ids = ref([])
const showSearch = ref(true)

const appOptions = ref([])
const platformOptions = ref([])

const dateRange = ref([])

const detailOpen = ref(false)
const detail = ref(null)

const statusOpen = ref(false)
const statusFormRef = ref()
const statusForm = ref({ orderId: '', orderStatus: '', payStatus: '', transactionId: '', payTime: '' })

const orderStatusOptions = [
  { label: '已创建', value: 'Created' },
  { label: '已完成', value: 'Completed' },
  { label: '已取消', value: 'Cancelled' }
]

const payStatusOptions = [
  { label: '待支付', value: 'Pending' },
  { label: '已支付', value: 'Paid' },
  { label: '失败', value: 'Failed' }
]

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    appId: undefined,
    platformInstanceId: undefined,
    keyword: undefined,
    orderStatus: undefined,
    payStatus: undefined,
    sorting: 'createTime desc'
  }
})

const { queryParams } = toRefs(data)

function renderPayStatusType(value) {
  if (!value) return 'info'
  if (value === 'Paid') return 'success'
  if (value === 'Pending') return 'warning'
  if (value === 'Failed') return 'danger'
  return 'info'
}

function renderOrderStatusType(value) {
  if (!value) return 'info'
  if (value === 'Completed') return 'success'
  if (value === 'Created') return 'warning'
  if (value === 'Cancelled') return 'info'
  return 'info'
}

async function fetchApps() {
  const res = await listApp({ pageNum: 1, pageSize: 1000 })
  appOptions.value = res.rows || []
}

async function fetchPlatforms(appId) {
  if (!appId) {
    platformOptions.value = []
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
  listOrder(params).then(res => {
    orderList.value = res.rows || []
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
  ids.value = selection.map(item => item.orderId)
}

async function handleView(row) {
  const res = await getOrder(row.orderId)
  detail.value = res.data
  detailOpen.value = true
}

function handleEditStatus(row) {
  statusForm.value = {
    orderId: row.orderId,
    orderStatus: row.orderStatus || '',
    payStatus: row.payStatus || '',
    transactionId: row.transactionId || '',
    payTime: row.payTime || ''
  }
  statusOpen.value = true
}

async function submitStatus() {
  const payload = {
    orderStatus: statusForm.value.orderStatus || null,
    payStatus: statusForm.value.payStatus || null,
    transactionId: statusForm.value.transactionId || null,
    payTime: statusForm.value.payTime || null
  }
  await updateOrderStatus(statusForm.value.orderId, payload)
  proxy.$modal.msgSuccess('操作成功')
  statusOpen.value = false
  getList()
}

fetchApps().then(() => {
  if (queryParams.value.appId) {
    fetchPlatforms(queryParams.value.appId)
  }
})

getList()

watch(() => queryParams.value.appId, (val) => {
  if (!val) {
    platformOptions.value = []
  }
})
</script>

<style scoped>
.muted {
  color: #999;
  padding: 6px 0;
}
</style>

