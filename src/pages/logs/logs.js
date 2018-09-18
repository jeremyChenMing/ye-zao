//logs.js
const app = getApp();
const { getPersonMes, HOST, getProfile, againwechat, getMyVotesProducts, getMyProducts } = require('../../utils/fetch');
const { unique, formatTimeCH } = require('../../utils/util');
const l = `${HOST}/api/v1/file/thumbnail?size=250x200&origin=`
Page({
  data: {
    login: 'white',
    logs: [],
    userInfo: {},
    tab: 1,
    host: l,
    cells: [],
    authorIdJSON: {},
    // showRecordBtn: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openId: null
  },
  onLoad: function () {
    const that = this;
    if (app.globalData.again) {

      console.log('用户有openId,需要again', app.globalData)
      this.setData({
        openId: app.globalData.openid,
        login: 'login'
      })
      // this.getMessage();
    }else{
      console.log('说明用户经过主题授权，可以直接从本地获取个人相关的信息以及token， 没有openId')
      this.setData({login: 'list'})
      wx.getStorage({
        key: 'keys',
        success: function (res) {
          console.log(res.data, '$%$%$') // setData: userInfo
          that.setData({
            userInfo: res.data
          })
          that.getMyData(res.data.access_token)
        },
        fail: function (res) {
          
        }
      })

    }

    
    

  },
  getMessage: function () {
    const that = this;
    wx.getSetting({
      success: function(res){
        if (res.authSetting['scope.userInfo']) {
          console.log('授权过了')
          wx.getUserInfo({
            success: function(res) {
              that.encrypDataFun(res)
            }
          })
        }else{
          console.log('没有授权')
          // that.setData({
          //   showRecordBtn: true
          // })
        }
      },
      fail: function () {
        console.log('wxgettingSetting失败了')
      }
    })
  },
  encrypDataFun: function (data) {
    const that = this;
    console.log(data, '用encrypData+openId请求接口, 返回的是登录信息，token哪些值')
    againwechat({openid: this.data.openId, encrypted_data: data.encryptedData, iv: data.iv}).then( token => {
      console.log(token) //应该是登录后的token信息
      if (token.statusCode === 200) {
        getProfile(token.data.access_token).then( mess => {
          if (mess.statusCode === 200) {
                app.globalData.again = false;
                wx.setStorage({
                  key:"keys",
                  data: {...token.data, ...mess.data}
                })
                that.setData({
                  userInfo: {...token.data, ...mess.data}
                })
                that.getMyData(token.data.access_token)
                setTimeout(function(){
                  wx.hideLoading()
                  that.setData({
                    login: 'list'
                  })
                },1000)
          }else{
            wx.showToast({
              image: '../../images/error.png',
              title: mess.data.message
            })
          }
        })

      }else{
        wx.showToast({
          image: '../../images/error.png',
          title: token.data.message
        })
      }
    })


    // 用登录信息请求 getProfile
    // 然后先存在本地
    // wx.setStorage({key: 'users', data: {}})
  },
  bindGetUserInfo: function (e) {
    if (e.detail.userInfo){
      console.log('用户按了允许授权按钮')
      wx.showLoading({
        title: '登录中...',
      })
      this.encrypDataFun(e.detail)
      // this.setData({
      //   showRecordBtn: false
      // })
    } else {
      console.log('用户按了拒绝按钮')
    }
  },

  getVoteData: function (token) {
    getMyVotesProducts(token).then( data => {
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
      }else{
        wx.showToast({
          image: '../../images/error.png',
          title: '获取信息失败'
        })
      }
    })
  },
  getMyData: function (token) {
    getMyProducts(token).then( data => {
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
      }else{
        wx.showToast({
          image: '../../images/error.png',
          title: '获取信息失败'
        })
      }
    })
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
        if (item.data.avatar.indexOf('http') === -1) {
          item.data.avatar = HOST + item.data.avatar
        }
        if (item.data.intro && item.data.intro.length > 9) {
          item.data.strbool = true
        }
        item.data.str = item.data.intro.slice(0,9)
        json[item.data.id] = item.data;
      })
      console.log(json)
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
    const dataSet = e.currentTarget.dataset
    console.log(dataSet)
    this.setData({
      tab: dataSet.id
    })
    if (dataSet.id === '1') {
      this.getMyData(this.data.userInfo.access_token)
    }else{
      this.getVoteData(this.data.userInfo.access_token)
    }
  }

})
