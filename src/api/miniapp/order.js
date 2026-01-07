import request from '@/utils/request'

// 查询订单列表
export function listOrder(query) {
  return request({
    url: '/miniapp/order/list',
    method: 'get',
    params: query
  })
}

// 查询订单详情
export function getOrder(orderId) {
  return request({
    url: `/miniapp/order/${orderId}`,
    method: 'get'
  })
}

// 修改订单状态/支付状态（后台手动修正）
export function updateOrderStatus(orderId, data) {
  return request({
    url: `/miniapp/order/${orderId}/status`,
    method: 'put',
    data
  })
}

