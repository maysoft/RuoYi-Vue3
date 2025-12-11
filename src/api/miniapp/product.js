import request from '@/utils/request'

// 查询产品列表（包含 SKU 概要）
export function listProduct(query) {
  return request({
    url: '/miniapp/product/list',
    method: 'get',
    params: query
  })
}

// 查询产品详情（含 SKU 列表）
export function getProduct(productId) {
  return request({
    url: `/miniapp/product/${productId}`,
    method: 'get'
  })
}

// 新增产品
export function addProduct(data) {
  return request({
    url: '/miniapp/product',
    method: 'post',
    data
  })
}

// 修改产品
export function updateProduct(productId, data) {
  return request({
    url: '/miniapp/product',
    method: 'put',
    params: { productId },
    data
  })
}

// 删除产品
export function delProduct(productIds) {
  return request({
    url: `/miniapp/product/${productIds}`,
    method: 'delete'
  })
}
