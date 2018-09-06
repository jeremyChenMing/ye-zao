//logs.js
const app = getApp();
const { getPersonMes, HOST, getAuthOfProduce, getProfile } = require('../../utils/fetch');
const { unique, formatTimeCH } = require('../../utils/util');

Page({
  data: {
    logs: [],
    userInfo: {},
    tab: 1,
    host: HOST,
    cells: [],
    authorIdJSON: {},
    showRecordBtn: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openId: null
  },
  onLoad: function () {

    if (app.globalData.openId) {
      console.log('用户有openId')
      this.setData({openId: app.globalData.openId})
      this.getMessage();
    }else{
      console.log('说明用户经过主题授权，可以直接从本地获取个人相关的信息以及token， 没有openId')
      // wx.getStorage({
      //   key: 'keys',
      //   success: function (res) {
      //     console.log(res, '$%$%$') // setData: userInfo
      //   },
      //   fail: function (res) {
          
      //   }
      // })

    }

    getAuthOfProduce('7').then( data => {
      if (data.statusCode === 200) {
        let arr = [];
        data.data.map( item => {
          item['CHN'] = formatTimeCH(item.create_at)
          arr.push(item.author_id)
        })
        this.mapAuthor(unique(arr));
        this.setData({
          cells: data.data
        })
      }else {
        wx.showToast({
          title: '获取信息失败'
        })
      }
    })
    



  },
  getMessage: function () {
    const that = this;
    wx.getSetting({
      success: function(res){
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          console.log('授权过了')
          wx.getUserInfo({
            success: function(res) {
              console.log(res, '授权过后的信息')
              that.encrypDataFun(res)
            }
          })
        }else{
          console.log('没有授权')
          that.setData({
            showRecordBtn: true
          })
        }
      },
      fail: function () {
        console.log('wxgettingSetting失败了')
      }
    })
  },
  encrypDataFun: function (data) {
    console.log('用encrypData+openId请求接口, 返回的是登录信息，token哪些值')
    // 接口 openId = this.data.openId   encrypData: data.encryptedData ==> 返回登录信息
    // 用登录信息请求 getProfile
    // 然后先存在本地
    // wx.setStorage({key: 'users', data: {}})
  },
  bindGetUserInfo: function (e) {
    console.log(e.detail)
    if (e.detail.userInfo){
      console.log('用户按了允许授权按钮')
      this.encrypDataFun(e.detail)
      this.setData({
        showRecordBtn: false
      })
    } else {
      console.log('用户按了拒绝按钮')
    }
  },
  mapAuthor: function (mes) {
    const that = this;
    let arr = [];
    for(let i=0; i<mes.length; i++) {
      arr.push(getPersonMes(mes[i]))
    }
    Promise.all(arr).then( data => {
      let json = {};
      data.map( item => {
        json[item.data.id] = item.data;
      })
      that.setData({
        authorIdJSON: json
      })
    })
  },
  bindViewTap: function(e) {
    const id = e.currentTarget.dataset
    wx.navigateTo({
      url: `../detail/detail?id=${id.id}&author=${id.auth}`
    })
  },
  handleNav: function(e) {
    console.log(e)
    const dataSet = e.currentTarget.dataset
    this.setData({
      tab: dataSet.id
    })
  },

  getGlobal: function () {
    const that = this;
    if (app.globalData.userInfo) {
      console.log('has')
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    }else{
      console.log('no')
      wx.getUserInfo({
        success: res => {
          // 可以将 res 发送给后台解码出 unionId
          this.setData({
            userInfo: app.globalData.userInfo
          })
          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          if (this.userInfoReadyCallback) {
            console.log('callback')
            this.userInfoReadyCallback(res)
          }
        }
      })
    }



    if (app.globalData.keys) {
      this.setData({
        authorIdJSON: app.globalData.keys
      })
    }else{
      wx.getStorage({
        key: 'keys',
        success: function (res) {
          that.setData({
            authorIdJSON: res.data
          })
        },
        fail: function (res) {
          console.log(res)
        }
      })
    }
  }

})
