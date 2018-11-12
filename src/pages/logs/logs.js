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
    voteCells: [],
    authorIdJSON: {},
    // showRecordBtn: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    openId: null,

    page: 1,
    total: 0,
    loading: true,
    line: false,
  },
  onLoad: function () {
    const that = this;
    if (app.globalData.again) {

      console.log('用户有openId,需要again')
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
          // console.log(res.data, '$%$%$') // setData: userInfo
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
    console.log('用encrypData+openId请求接口, 返回的是登录信息，token哪些值')
    againwechat({openid: this.data.openId, encrypted_data: data.encryptedData, iv: data.iv}).then( token => {
      // console.log(token) //应该是登录后的token信息
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
      // console.log('用户按了允许授权按钮')
      wx.showLoading({
        title: '登录中...',
      })
      this.encrypDataFun(e.detail)
      // this.setData({
      //   showRecordBtn: false
      // })
    } else {
      // console.log('用户按了拒绝按钮')
    }
  },

  getVoteData: function (token, url) {
    getMyVotesProducts(token, url).then( data => {
      if (data.statusCode === 200) {
        let arr = [];
        data.data.results.map( item => {
          item['CHN'] = formatTimeCH(item.create_at)
          if (this.data.authorIdJSON[item.author_id]) {
            
          }else{
            arr.push(item.author_id)
          }
        })
        console.log(unique(arr), 'arr')
        this.mapAuthor(unique(arr));
        this.setData({
          voteCells: this.data.voteCells.concat(data.data.results),
          total: data.data.count
        })
        console.log(this.data.voteCells)
      }else{
        wx.showToast({
          image: '../../images/error.png',
          title: '获取信息失败'
        })
      }
    })
  },
  getMyData: function (token) {
    const that = this;
    getMyProducts(token).then( data => {
    // getMyVotesProducts(token).then( data => {
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
        setTimeout(function () {
          const url = `?limit=10&offset=${(that.data.page - 1) * 10}`
          that.getVoteData(that.data.userInfo.access_token, url)
        }, 800)
        
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
    let need = [];
    const localJson = wx.getStorageSync('authJson') ? wx.getStorageSync('authJson') : that.data.authorIdJSON
    mes.map( ks => {
      if (!localJson[ks]) {
        need.push(ks)
      }
    })

    
    let arr = [];
    for(let i=0; i<need.length; i++) {
      arr.push(getPersonMes(need[i]))
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
      that.setData({
        // authorIdJSON: {...that.data.authorIdJSON, ...json}
        authorIdJSON: {...localJson, ...json}
      })
      if (data.length) {
        // wx.setStorageSync('authJson', {...localJson, ...json})
        wx.setStorage({
          key: 'authJson',
          data: {...localJson, ...json},
          success: function () {
            console.log('success')
          },
          fail: function () {
            console.log('error')
          }
        })
      }
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
    this.setData({
      tab: dataSet.id
    })
    if (dataSet.id === '1') {
      // this.getMyData(this.data.userInfo.access_token)
    }else{
      // this.getVoteData(this.data.userInfo.access_token)
    }
  },
  linkSelf: function (e) {
    const obj = e.currentTarget.dataset
    wx.navigateTo({
      url: `../auth/auth?id=${obj.id}`
    })
  },




  bindscrolltolower: function () {
    console.log('到底了')
    let index = this.data.page; //
    const offset = index * 10; // < this.data.total ? index * 10;
    if (offset < this.data.total) {
      this.setData({
        page: this.data.index + 1
      })
      const search = `?limit=10&offset=${offset}`;
      this.getVoteData(this.data.userInfo.access_token, search)
    } else{
      this.setData({
        loading: false,
        line: true
      })
    }
  }

})
