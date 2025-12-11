<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="90px">
      <el-form-item label="所属应用" prop="appId">
        <el-select v-model="queryParams.appId" placeholder="请选择应用" clearable style="width: 200px">
          <el-option
            v-for="item in appOptions"
            :key="item.appId"
            :label="item.name"
            :value="item.appId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词" prop="keyword">
        <el-input v-model="queryParams.keyword" placeholder="按产品名称模糊搜索" clearable style="width: 220px" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-input v-model="queryParams.status" placeholder="如 0/1" clearable style="width: 160px" />
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
      <el-table-column label="产品名称" prop="name" align="center" />
      <el-table-column label="所属应用" prop="appName" align="center" />
      <el-table-column label="售价" prop="salePrice" align="center" />
      <el-table-column label="状态" prop="status" align="center" />
      <el-table-column label="SKU 数量" prop="skuCount" align="center" />
      <el-table-column label="总库存" prop="totalStock" align="center" />
      <el-table-column label="排序" prop="sort" align="center" />
      <el-table-column label="创建时间" prop="createTime" align="center" width="180" />
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="900px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属应用" prop="appId">
              <el-select v-model="form.appId" placeholder="请选择应用">
                <el-option
                  v-for="item in appOptions"
                  :key="item.appId"
                  :label="item.name"
                  :value="item.appId"
                />
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
              <el-input v-model="form.status" placeholder="如 0/1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="上架时间" prop="onShelfTime">
              <el-date-picker
                v-model="form.onShelfTime"
                type="datetime"
                placeholder="选择上架时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下架时间" prop="offShelfTime">
              <el-date-picker
                v-model="form.offShelfTime"
                type="datetime"
                placeholder="选择下架时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入描述" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="封面图" prop="coverImage">
              <el-input v-model="form.coverImage" placeholder="URL 或路径" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图库" prop="gallery">
              <el-input v-model="form.gallery" placeholder="可用逗号分隔多图" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="销量" prop="salesVolume">
              <el-input-number v-model="form.salesVolume" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生效开始" prop="priceEffectiveFrom">
              <el-date-picker
                v-model="form.priceEffectiveFrom"
                type="datetime"
                placeholder="价格生效起始"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效结束" prop="priceEffectiveTo">
              <el-date-picker
                v-model="form.priceEffectiveTo"
                type="datetime"
                placeholder="价格生效结束"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%;"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">SKU 列表</el-divider>
        <div class="mb8">
          <el-button type="primary" icon="Plus" plain @click="addSku">新增 SKU</el-button>
        </div>
        <el-table :data="skuList" border>
          <el-table-column label="SKU 编码" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.skuCode" placeholder="必填" />
            </template>
          </el-table-column>
          <el-table-column label="规格(JSON)" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.specJson" placeholder="可填写规格 JSON" />
            </template>
          </el-table-column>
          <el-table-column label="售价" align="center" width="140">
            <template #default="scope">
              <el-input-number v-model="scope.row.salePrice" :min="0" :precision="2" :step="0.01" />
            </template>
          </el-table-column>
          <el-table-column label="原价" align="center" width="140">
            <template #default="scope">
              <el-input-number v-model="scope.row.originalPrice" :min="0" :precision="2" :step="0.01" />
            </template>
          </el-table-column>
          <el-table-column label="库存" align="center" width="120">
            <template #default="scope">
              <el-input-number v-model="scope.row.stock" :min="0" />
            </template>
          </el-table-column>
          <el-table-column label="条码" align="center">
            <template #default="scope">
              <el-input v-model="scope.row.barcode" placeholder="可选" />
            </template>
          </el-table-column>
          <el-table-column label="生效开始" align="center" width="200">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.priceEffectiveFrom"
                type="datetime"
                placeholder="开始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%;"
              />
            </template>
          </el-table-column>
          <el-table-column label="生效结束" align="center" width="200">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.priceEffectiveTo"
                type="datetime"
                placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%;"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="100">
            <template #default="scope">
              <el-button type="text" icon="Delete" @click="removeSku(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MiniProgramProduct">
import { ref, reactive, toRefs, getCurrentInstance } from 'vue'
import { listProduct, getProduct, addProduct, updateProduct, delProduct } from '@/api/miniapp/product'
import { listApp } from '@/api/miniapp/app'

const { proxy } = getCurrentInstance()

const loading = ref(true)
const productList = ref([])
const appOptions = ref([])
const skuList = ref([])
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
    keyword: undefined,
    status: undefined
  },
  rules: {
    appId: [{ required: true, message: '所属应用不能为空', trigger: 'change' }],
    name: [{ required: true, message: '产品名称不能为空', trigger: 'blur' }],
    salePrice: [{ required: true, message: '售价不能为空', trigger: 'blur' }]
  }
})

const { form, queryParams, rules } = toRefs(data)

function loadAppOptions() {
  listApp({ pageNum: 1, pageSize: 1000 }).then(res => {
    appOptions.value = res.rows || []
  })
}

function getList() {
  loading.value = true
  listProduct(queryParams.value).then(res => {
    productList.value = res.rows || []
    total.value = res.total || 0
    loading.value = false
  }).catch(() => {
    loading.value = false
  })
}

function resetFormModel() {
  form.value = {
    productId: undefined,
    appId: undefined,
    name: undefined,
    description: undefined,
    status: 0,
    originalPrice: 0,
    salePrice: 0,
    priceEffectiveFrom: null,
    priceEffectiveTo: null,
    salesVolume: 0,
    sort: 0,
    coverImage: undefined,
    gallery: undefined,
    onShelfTime: null,
    offShelfTime: null
  }
  skuList.value = [
    {
      skuId: undefined,
      skuCode: '',
      specJson: '',
      originalPrice: 0,
      salePrice: 0,
      stock: 0,
      barcode: '',
      priceEffectiveFrom: null,
      priceEffectiveTo: null
    }
  ]
  proxy.resetForm('formRef')
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
      status: data.status,
      originalPrice: data.originalPrice,
      salePrice: data.salePrice,
      priceEffectiveFrom: data.priceEffectiveFrom,
      priceEffectiveTo: data.priceEffectiveTo,
      salesVolume: data.salesVolume,
      sort: data.sort,
      coverImage: data.coverImage,
      gallery: data.gallery,
      onShelfTime: data.onShelfTime,
      offShelfTime: data.offShelfTime
    }
    skuList.value = (data.skus || []).map(s => ({
      skuId: s.skuId,
      skuCode: s.skuCode,
      specJson: s.specJson,
      originalPrice: s.originalPrice,
      salePrice: s.salePrice,
      stock: s.stock,
      barcode: s.barcode,
      priceEffectiveFrom: s.priceEffectiveFrom,
      priceEffectiveTo: s.priceEffectiveTo
    }))
    if (!skuList.value.length) {
      addSku()
    }
    open.value = true
    title.value = '编辑产品'
  })
}

function addSku() {
  skuList.value.push({
    skuId: undefined,
    skuCode: '',
    specJson: '',
    originalPrice: 0,
    salePrice: 0,
    stock: 0,
    barcode: '',
    priceEffectiveFrom: null,
    priceEffectiveTo: null
  })
}

function removeSku(index) {
  if (skuList.value.length <= 1) {
    proxy.$modal.msgWarning('至少保留一个 SKU')
    return
  }
  skuList.value.splice(index, 1)
}

function buildPayload() {
  const payload = { ...form.value }
  delete payload.productId
  payload.skus = skuList.value.map(s => ({
    skuId: s.skuId,
    skuCode: s.skuCode,
    specJson: s.specJson,
    originalPrice: Number(s.originalPrice ?? 0),
    salePrice: Number(s.salePrice ?? 0),
    stock: Number(s.stock ?? 0),
    barcode: s.barcode,
    priceEffectiveFrom: s.priceEffectiveFrom,
    priceEffectiveTo: s.priceEffectiveTo
  }))
  return payload
}

function validateSkus() {
  if (!skuList.value.length) {
    proxy.$modal.msgError('请至少添加一个 SKU')
    return false
  }
  const invalid = skuList.value.some(s => !s.skuCode || s.salePrice === undefined || s.salePrice === null)
  if (invalid) {
    proxy.$modal.msgError('SKU 编码和售价不能为空')
    return false
  }
  return true
}

function submitForm() {
  proxy.$refs['formRef'].validate(valid => {
    if (!valid) {
      return
    }
    if (!validateSkus()) {
      return
    }
    const payload = buildPayload()
    const productId = form.value.productId
    const request = productId ? updateProduct(productId, payload) : addProduct(payload)
    request.then(() => {
      proxy.$modal.msgSuccess('保存成功')
      open.value = false
      getList()
    })
  })
}

function handleDelete(row) {
  const delIds = row?.productId || ids.value
  if (!delIds || (Array.isArray(delIds) && !delIds.length)) {
    proxy.$modal.msgWarning('请选择要删除的数据')
    return
  }
  proxy.$modal.confirm('是否确认删除选中的数据项？').then(function () {
    return delProduct(delIds)
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess('删除成功')
  }).catch(() => {})
}

function cancel() {
  open.value = false
  resetFormModel()
}

loadAppOptions()
getList()
</script>
