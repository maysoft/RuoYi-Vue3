import request from '@/utils/request'

// 查询平台实例列表
export function listPlatform(query) {
  return request({
    url: '/miniapp/platform/list',
    method: 'get',
    params: query
  })
}

// 查询详情
export function getPlatform(id) {
  return request({
    url: `/miniapp/platform/${id}`,
    method: 'get'
  })
}

// 新增
export function addPlatform(data) {
  return request({
    url: '/miniapp/platform',
    method: 'post',
    data: data
  })
}

// 修改
export function updatePlatform(id, data) {
  return request({
    url: '/miniapp/platform',
    method: 'put',
    params: { platformInstanceId: id },
    data: data
  })
}

// 删除
export function delPlatform(ids) {
  return request({
    url: `/miniapp/platform/${ids}`,
    method: 'delete'
  })
}
