import request from '@/utils/request'

// 查询小程序用户列表
export function listMiniProgramUser(query) {
  return request({
    url: '/miniapp/user/list',
    method: 'get',
    params: query
  })
}

// 查询小程序用户详情
export function getMiniProgramUser(userId) {
  return request({
    url: `/miniapp/user/${userId}`,
    method: 'get'
  })
}

// 删除小程序用户
export function delMiniProgramUser(userIds) {
  return request({
    url: `/miniapp/user/${userIds}`,
    method: 'delete'
  })
}

