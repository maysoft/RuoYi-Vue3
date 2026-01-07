<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="所属应用" prop="appId">
        <el-select v-model="queryParams.appId" placeholder="请选择应用" clearable style="width: 200px">
          <el-option v-for="item in appOptions" :key="item.appId" :label="item.name" :value="item.appId" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键字" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="按产品名称模糊搜索" clearable style="width: 220px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 140px">
          <el-option v-for="item in statusOptions" :key="item.value" :value="item.value" :label="item.label" />
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

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="产品名称" prop="name" align="left" min-width="240" show-overflow-tooltip />
      <el-table-column label="所属应用" prop="appName" align="center" min-width="160" show-overflow-tooltip />
      <el-table-column label="售价" prop="salePrice" align="center" />
      <el-table-column label="原价" prop="originalPrice" align="center" />
      <el-table-column label="状态" prop="status" align="center" width="110">
        <template #default="scope">
          <el-tag :type="scope.row.status === 1 ? 'success' : 'info'">{{ renderStatus(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="SKU数量" prop="skuCount" align="center" />
      <el-table-column label="总库存" prop="totalStock" align="center" />
      <el-table-column label="排序" prop="sort" align="center" />
      <el-table-column label="创建时间" prop="createTime" align="center" width="180" />
      <el-table-column label="操作" align="center" width="260">
        <template #default="scope">
          <el-button type="primary" link @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="success" link v-if="scope.row.status !== 1" @click="handleToggleStatus(scope.row, 1)">上架</el-button>
          <el-button type="warning" link v-if="scope.row.status === 1" @click="handleToggleStatus(scope.row, 0)">下架</el-button>
          <el-button type="info" link @click="handleUpdateSort(scope.row)">调整排序</el-button>
          <el-button type="danger" link @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <el-dialog :title="title" v-model="open" width="980px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属应用" prop="appId">
              <el-select v-model="form.appId" placeholder="请选择应用">
                <el-option v-for="item in appOptions" :key="item.appId" :label="item.name" :value="item.appId" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="售价" prop="salePrice">
              <el-input-number v-model="form.salePrice" :min="0" :precision="2" :step="0.01" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="原价" prop="originalPrice">
              <el-input-number v-model="form.originalPrice" :min="0" :precision="2" :step="0.01" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-select v-model="form.status" placeholder="请选择">
                <el-option v-for="item in statusOptions" :key="item.value" :value="item.value" :label="item.label" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" :step="1" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销售量" prop="salesVolume">
              <el-input-number v-model="form.salesVolume" :min="0" :step="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类ID" prop="categoryId">
              <el-input v-model="form.categoryId" placeholder="可选，按需填写" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上架时间" prop="onShelfTime">
              <el-date-picker v-model="form.onShelfTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择上架时间" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下架时间" prop="offShelfTime">
              <el-date-picker v-model="form.offShelfTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择下架时间" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图" prop="coverImage">
          <el-input v-model="form.coverImage" placeholder="封面图片地址" />
        </el-form-item>
        <el-form-item label="图集" prop="gallery">
          <el-input v-model="form.gallery" type="textarea" placeholder="可存储多个图片地址，逗号分隔或 JSON" :autosize="{ minRows: 2, maxRows: 4 }" />
        </el-form-item>
        <el-form-item label="扩展属性" prop="specJson">
          <div style="width: 100%">
            <div style="display: flex; gap: 8px; margin-bottom: 8px">
              <el-button type="primary" plain icon="Plus" size="small" @click="handleAddSpecKv">新增属性</el-button>
              <el-button type="danger" plain size="small" @click="handleClearSpecKv">清空</el-button>
            </div>

            <el-table :data="specKvRows" border size="small" style="width: 100%">
              <el-table-column label="Key" min-width="180">
                <template #default="scope">
                  <el-input v-model="scope.row.key" placeholder="例如：dpi" />
                </template>
              </el-table-column>
              <el-table-column label="Value" min-width="260">
                <template #default="scope">
                  <el-input v-model="scope.row.value" placeholder='例如：300 / true / {"w":295,"h":413}' />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" align="center">
                <template #default="scope">
                  <el-button link type="danger" @click="handleRemoveSpecKv(scope.$index)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-input
              v-model="form.specJson"
              type="textarea"
              readonly
              placeholder="spec_json 预览（由上面键值对自动生成）"
              :autosize="{ minRows: 2, maxRows: 5 }"
              style="margin-top: 8px"
            />
          </div>
        </el-form-item>
        <el-form-item label="产品描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入产品描述" :autosize="{ minRows: 3, maxRows: 6 }" />
        </el-form-item>

        <el-divider content-position="left">SKU 列表</el-divider>
        <el-button type="primary" plain icon="Plus" size="small" @click="handleAddSku">新增 SKU</el-button>

        <el-table :data="form.skus" style="width: 100%; margin-top: 10px">
          <el-table-column label="SKU 编码" width="180">
            <template #default="scope">
              <el-input v-model="scope.row.skuCode" placeholder="必填" />
            </template>
          </el-table-column>
          <el-table-column label="规格(JSON)" min-width="240">
            <template #default="scope">
              <el-input v-model="scope.row.specJson" type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" placeholder='例如：{"service":{"code":"multi","name":"保存7种底色"}}' />
            </template>
          </el-table-column>
          <el-table-column label="售价" width="120" align="center">
            <template #default="scope">
              <el-input-number v-model="scope.row.salePrice" :min="0" :precision="2" :step="0.01" />
            </template>
          </el-table-column>
          <el-table-column label="原价" width="120" align="center">
            <template #default="scope">
              <el-input-number v-model="scope.row.originalPrice" :min="0" :precision="2" :step="0.01" />
            </template>
          </el-table-column>
          <el-table-column label="库存" width="120" align="center">
            <template #default="scope">
              <el-input-number v-model="scope.row.stock" :min="0" :step="1" />
            </template>
          </el-table-column>
          <el-table-column label="条码" width="160">
            <template #default="scope">
              <el-input v-model="scope.row.barcode" placeholder="可选" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="scope">
              <el-button link type="danger" @click="handleRemoveSku(scope.$index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="MiniProgramProduct">
import { reactive, ref, toRefs, getCurrentInstance, watch } from 'vue'
import { listProduct, getProduct, addProduct, updateProduct, delProduct, updateProductStatus, updateProductSort } from '@/api/miniapp/product'
import { listApp } from '@/api/miniapp/app'

const { proxy } = getCurrentInstance()

const loading = ref(true)
const productList = ref([])
const appOptions = ref([])
const showSearch = ref(true)
const open = ref(false)
const total = ref(0)
const ids = ref([])
const single = ref(true)
const multiple = ref(true)
const title = ref('')

const statusOptions = [
  { label: '上架', value: 1 },
  { label: '下架', value: 0 }
]

const specKvRows = ref([{ key: '', value: '' }])
const specKvSyncing = ref(false)

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    appId: undefined,
    keyword: undefined,
    status: undefined
  },
  rules: {
    appId: [{ required: true, message: '所属应用不能为空', trigger: 'change' }],
    name: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
    salePrice: [{ required: true, message: '请填写售价', trigger: 'blur' }],
    originalPrice: [{ required: true, message: '请填写原价', trigger: 'blur' }]
  }
})

const { queryParams, form, rules } = toRefs(data)

function renderStatus(value) {
  const match = statusOptions.find(x => x.value === value)
  return match ? match.label : '未知'
}

function loadAppOptions() {
  listApp({ pageNum: 1, pageSize: 1000 }).then(res => {
    appOptions.value = res.rows || []
  })
}

function syncSpecJsonFromKv() {
  const obj = {}
  for (const row of specKvRows.value || []) {
    const key = String(row?.key || '').trim()
    if (!key) continue
    const rawValue = String(row?.value ?? '')
    obj[key] = tryParseSpecValue(rawValue)
  }

  const hasAny = Object.keys(obj).length > 0
  form.value.specJson = hasAny ? JSON.stringify(obj) : ''
}

function syncSpecKvFromSpecJson(specJson) {
  specKvSyncing.value = true
  try {
    const raw = String(specJson || '').trim()
    if (!raw) {
      specKvRows.value = [{ key: '', value: '' }]
      return
    }

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      specKvRows.value = [{ key: '', value: '' }]
      return
    }

    const entries = Object.entries(parsed)
    specKvRows.value = entries.length
      ? entries.map(([key, value]) => ({ key, value: formatSpecValue(value) }))
      : [{ key: '', value: '' }]
  } catch {
    specKvRows.value = [{ key: '', value: '' }]
  } finally {
    specKvSyncing.value = false
  }
}

function tryParseSpecValue(rawValue) {
  const text = String(rawValue ?? '').trim()
  if (!text) return ''

  if (text === 'true') return true
  if (text === 'false') return false
  if (text === 'null') return null

  if (/^[+-]?\d+(\.\d+)?$/.test(text)) {
    const num = Number(text)
    if (!Number.isNaN(num)) return num
  }

  const looksLikeJson =
    (text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))
  if (looksLikeJson) {
    try {
      return JSON.parse(text)
    } catch {
      return rawValue
    }
  }

  return rawValue
}

function formatSpecValue(value) {
  if (value == null) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function getList() {
  loading.value = true
  listProduct(queryParams.value)
    .then(res => {
      productList.value = res.rows || []
      total.value = res.total || 0
    })
    .finally(() => {
      loading.value = false
    })
}

function resetFormModel() {
  form.value = {
    productId: undefined,
    appId: undefined,
    name: '',
    description: '',
    specJson: '',
    categoryId: undefined,
    originalPrice: 0,
    salePrice: 0,
    status: 1,
    coverImage: '',
    gallery: '',
    salesVolume: 0,
    sort: 0,
    onShelfTime: '',
    offShelfTime: '',
    skus: []
  }
  syncSpecKvFromSpecJson(form.value.specJson)
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
  ids.value = selection.map(item => item.productId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}

function handleAdd() {
  resetFormModel()
  open.value = true
  title.value = '新增产品'
}

function handleUpdate(row) {
  const id = row?.productId || ids.value[0]
  if (!id) {
    proxy.$modal.msgWarning('请选择一条数据')
    return
  }
  resetFormModel()
  getProduct(id).then(res => {
    const data = res.data || {}
    form.value = {
      productId: data.productId,
      appId: data.appId,
      name: data.name,
      description: data.description,
      specJson: data.specJson || '',
      categoryId: data.categoryId,
      originalPrice: data.originalPrice,
      salePrice: data.salePrice,
      status: data.status,
      coverImage: data.coverImage,
      gallery: data.gallery,
      salesVolume: data.salesVolume,
      sort: data.sort,
      onShelfTime: data.onShelfTime,
      offShelfTime: data.offShelfTime,
       skus: (data.skus || []).map(x => ({
         skuId: x.skuId,
         skuCode: x.skuCode,
         specJson: x.specJson,
         originalPrice: x.originalPrice,
         salePrice: x.salePrice,
         stock: x.stock,
         barcode: x.barcode
       }))
    }
    syncSpecKvFromSpecJson(form.value.specJson)
    open.value = true
    title.value = '修改产品'
  })
}

function handleAddSpecKv() {
  specKvRows.value = specKvRows.value || []
  specKvRows.value.push({ key: '', value: '' })
}

function handleRemoveSpecKv(index) {
  specKvRows.value.splice(index, 1)
  if (!specKvRows.value.length) {
    specKvRows.value.push({ key: '', value: '' })
  }
}

function handleClearSpecKv() {
  specKvRows.value = [{ key: '', value: '' }]
  form.value.specJson = ''
}

function handleAddSku() {
  form.value.skus = form.value.skus || []
  form.value.skus.push({
    skuId: undefined,
    skuCode: '',
    specJson: '',
    originalPrice: 0,
    salePrice: 0,
    stock: 0,
    barcode: ''
  })
}

function handleRemoveSku(index) {
  form.value.skus.splice(index, 1)
}

watch(
  specKvRows,
  () => {
    if (specKvSyncing.value) return
    syncSpecJsonFromKv()
  },
  { deep: true }
)

function submitForm() {
  proxy.$refs['formRef']?.validate(valid => {
    if (!valid) return
    const payload = {
      appId: form.value.appId,
      name: form.value.name,
      description: form.value.description,
      specJson: form.value.specJson,
      categoryId: form.value.categoryId,
      originalPrice: form.value.originalPrice,
      salePrice: form.value.salePrice,
      status: form.value.status,
      coverImage: form.value.coverImage,
      gallery: form.value.gallery,
      salesVolume: form.value.salesVolume,
      sort: form.value.sort,
      onShelfTime: form.value.onShelfTime,
      offShelfTime: form.value.offShelfTime,
      skus: (form.value.skus || []).map(x => ({
        skuId: x.skuId,
        skuCode: x.skuCode,
        specJson: x.specJson,
        originalPrice: x.originalPrice,
        salePrice: x.salePrice,
        stock: x.stock,
        barcode: x.barcode
      }))
    }

    const request = form.value.productId ? updateProduct(form.value.productId, payload) : addProduct(payload)
    request.then(() => {
      proxy.$modal.msgSuccess('操作成功')
      open.value = false
      getList()
    })
  })
}

function handleDelete(row) {
  const productIds = row?.productId ? [row.productId] : ids.value
  if (!productIds.length) {
    proxy.$modal.msgWarning('请选择要删除的数据')
    return
  }
  proxy.$modal
    .confirm(`是否确认删除产品编号为"${productIds.join(',')}"的数据项？`)
    .then(() => delProduct(productIds.join(',')))
    .then(() => {
      getList()
      proxy.$modal.msgSuccess('删除成功')
    })
}

function cancel() {
  open.value = false
  resetFormModel()
}

function handleToggleStatus(row, status) {
  const id = row?.productId
  if (!id) {
    proxy.$modal.msgWarning('请选择一条数据')
    return
  }
  const payload = {
    status,
    onShelfTime: row.onShelfTime,
    offShelfTime: row.offShelfTime
  }
  updateProductStatus(id, payload).then(() => {
    proxy.$modal.msgSuccess('状态已更新')
    getList()
  })
}

function handleUpdateSort(row) {
  const id = row?.productId
  if (!id) {
    proxy.$modal.msgWarning('请选择一条数据')
    return
  }
  proxy.$modal
    .prompt('请输入新的排序权重（数字越大越靠前）', '调整排序', {
      inputValue: row.sort ?? 0,
      inputPattern: /^\\d+$/,
      inputErrorMessage: '请输入非负整数'
    })
    .then(({ value }) => {
      const sort = Number(value)
      return updateProductSort(id, { sort })
    })
    .then(() => {
      proxy.$modal.msgSuccess('排序已更新')
      getList()
    })
    .catch(() => {})
}

loadAppOptions()
getList()
</script>
