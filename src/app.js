//app.js
const { loginwechat, getProfile } = require('./utils/fetch');
App({
  onLaunch: function () {
    const that = this;
    // 展示本地存储能力
    console.log('展示本地存储能力')
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    // wx.getStorage({
    //   key: 'keys',
    //   success: function (res) {
    //     // console.log(res, '$%$%$')
    //     that.globalData['keys'] = res.data
    //   },
    //   fail: function (res) {
    //     // console.log(res, '$%$%$')
    //     getUsers().then( data => {
    //       if (data.statusCode === 200) {
    //         let arr = {};
    //         data.data.map( item => {
    //           arr[item.id] = item
    //         })
    //         console.log(arr)
    //         wx.setStorage({
    //           key:"keys",
    //           data: arr
    //         })
    //       }else{

    //       }
    //     })
    //   }
    // })

    
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // console.log(res, '*****')
        if (res.code) {
          loginwechat(`?source=wxapp&code=${res.code}`).then( token => {
            console.log(token)
            if (token.data && !token.data.code) {
              if (token.data.openId) {
                // 说明这个人没有注册
                that.globalData.userInfo['openId'] = token.data.openId || '123'
              }else{
                // 会直接返回给我登录的结果，token

                // getProfile(token).then( data => {
                //   if (data && !data.code) {
                //         wx.setStorage({
                //           key:"keys",
                //           data: {...token, ...data}
                //         })
                //   }else{

                //   }
                // })
              }
            }else{
              console.log('400le')
              // that.globalData['openId'] = token.data.openId || '123'
            }
          })

          // wx.request({
          //   url: `https://api.weixin.qq.com/sns/jscode2session?appid=wxcf39c349ae983765&secret=24e8f47d53a91f23a58d81c11b3300fb&js_code=${res.code}&grant_type=authorization_code`,
          //   success: function (res) {
          //     console.log(res )
          //   }
          // })
        }
      }
    })
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     console.log(res, '---')
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           console.log(res)
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     }
    //   }
    // })
  },
  globalData: {
    userInfo: null
  }
})