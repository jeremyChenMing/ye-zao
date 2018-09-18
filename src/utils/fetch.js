
const parseJSON = (data) => {
  const tmp = JSON.parse(JSON.stringify(data))

  if (typeof tmp.data === 'string') {
    try {
      tmp.data = JSON.parse(tmp.data)
      return Promise.resolve(tmp)
    } catch (e) {
      tmp.data = {}
      return Promise.resolve(data)
    }
  } else {
    return Promise.resolve(data)
  }
}

const completeHeader = (header) => {
  const result = {
    ...header,
    ...{
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'credentials': 'include'
    }
  }

  if (!result.Authorization) {
    // result.Authorization = `Bearer ${accessToken}`
    delete result.Authorization
  }

  return result
}


const get = (url, options={}) => {
  return new Promise( (resolve, reject) => {
    wx.request({
      url: url,
      header: completeHeader(options),
      method: 'GET',
      dataType: 'JSON',
      success: resolve,
      fail: reject
    })
  }).then(parseJSON)
}
const post = (url, data, options={}) => {
  return new Promise( (resolve, reject) => {
    wx.request({
      url: url,
      data,
      header: completeHeader(options),
      method: 'POST',
      dataType: 'JSON',
      success: resolve,
      fail: reject
    })
  }).then(parseJSON)
}
// export const HOST = 'https://bricks.upvi.com';
// 正式接口地址 上传的时候记得换过来
export const HOST = 'https://api.51bricks.com'


export const getProducts = (query) => {
  const url = query ? `${query}` : ''
  return get(`${HOST}/api/v1/products${url}`)
}
export const getProductsOfDetail = (id, query) => {
  return get(`${HOST}/api/v1/products/${id}`)
}
// 我的投票作品
export const getMyVotesProducts = (accessToken) => {
  const options = {Authorization: `Bearer ${accessToken}`}
  return get(`${HOST}/api/v1/user/voted_products`, options)
}
export const getMyProducts = (accessToken) => {
  const options = {Authorization: `Bearer ${accessToken}`}
  return get(`${HOST}/api/v1/user/products`, options)
}

// 获取作者信息
export const getPersonMes = (id, query) => {
  return get(`${HOST}/api/v1/users/${id}`)
}
// 点赞
export const givePraise = (id, data, accessToken) => {
  const options = {Authorization: `Bearer ${accessToken}`}
  return post(`${HOST}/api/v1/products/${id}/votes`, data, options)
}


// 获取评论列表
export const getCommentsList = (id) => {
  return get(`${HOST}/api/v1/products/${id}/comments`)
}
// 发起评论
export const addFirComments = (id, data, accessToken) => {
  const options = {Authorization: `Bearer ${accessToken}`}
  return post(`${HOST}/api/v1/products/${id}/comments`, data, options)
}





// 17、获取作者
export const getUsers = () => {
  return get(`${HOST}/api/v1/users`)
}


// 登录
// 已经绑定用户登录
export const loginwechat = (data) => {
  return post(`${HOST}/api/v1/weapp/login`, data)
}
// 没有绑定用户登录
export const againwechat = (data) => {
  return post(`${HOST}/api/v1/weapp/userinfo`, data)
}


export const getProfile = (accessToken) => {
  const options = {Authorization: `Bearer ${accessToken}`}
  return get(`${HOST}/api/v1/user/profile`, options)
}


export const getAuthOfProduce = (id) => {
  return get(`${HOST}/api/v1/users/${id}/products`)
}



