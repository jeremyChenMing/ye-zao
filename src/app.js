//app.js
const { loginwechat, getProfile } = require('./utils/fetch');
App({
  onLaunch: function () {
    const that = this;
    // 展示本地存储能力
    console.log('展示本地存储能力, 每次进入可以先清理一次，如果需要的话')
    wx.clearStorageSync()
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          loginwechat({code:res.code}).then( token => {
            if (token.statusCode === 200) {
              const need = token.data;
              if (need.token && need.token.access_token) {
                console.log('说明这个人已经注册过了，有相关的userinfo信息了')
                getProfile(need.token.access_token).then( data => {
                  if (data.statusCode === 200) {
                        wx.setStorage({
                          key:"keys",
                          data: {...need.token, ...data.data}
                        })
                  }else{
                    wx.showToast({
                      image: '../../images/error.png',
                      title: '获取信息失败'
                    })
                  }
                })

              }else{
                console.log('这个人没有经过主体授权，需要授权信息或者在个人中心请求接口')
                wx.clearStorage()
                that.globalData['openid'] = need.openid
                that.globalData['again'] = true
              }
            } else{
              console.log('400le')
              wx.showToast({
                image: '../../images/error.png',
                title: '获取信息失败'
              })
            }
          })

        }
      }
    })
    
  },
  onShow: function (options) {
    console.log(options)
    this.globalData.options = options
  },
  globalData: {
    openid: '',
    again: false,
    userInfo: null,
    options: {}
  }
})