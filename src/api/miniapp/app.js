import request from '@/utils/request'

// 查询小程序应用列表
export function listApp(query) {
  return request({
    url: '/miniapp/app/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getApp(appId) {
  return request({
    url: `/miniapp/app/${appId}`,
    method: 'get'
  })
}

// 新增
export function addApp(data) {
  return request({
    url: '/miniapp/app',
    method: 'post',
    data: data
  })
}

// 修改
export function updateApp(appId, data) {
  return request({
    url: '/miniapp/app',
    method: 'put',
    params: { appId },
    data: data
  })
}

// 删除
export function delApp(appIds) {
  return request({
    url: `/miniapp/app/${appIds}`,
    method: 'delete'
  })
}
