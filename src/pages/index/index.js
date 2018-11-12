//index.js
//获取应用实例

const app = getApp()
const { getProducts, getPersonMes, givePraise, HOST } = require('../../utils/fetch')
const { unique, formatTimeCH } = require('../../utils/util')
const l = `${HOST}/api/v1/file/thumbnail?size=520x400&origin=`

Page({
  data: {
    tab: 1,
    host: l,
    authorIdJSON: {},
    cells: [],
    allCells: [],
    loadings: false,
    dots: false,
    auto: false,
    current: 0,
    pre: '80rpx',
    next: '80rpx',



    ids: [],
    filter: 'hot',
    total: 0,
    loading: true,
    line: false,
    pageNum: 1,
    index: 1,
  },
  
  onLoad: function () { // 页面初始化
    // wx.showShareMenu({
    //   withShareTicket: true,
    // })

    // this.getDatas('?limit=10&offset=0&order=recommend')
    let animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in',
    })
    this.animation = animation

  },
  onShow: function () {
    // console.log('onShow,----')
    if (this.data.cells.length) {
      console.log('nononononono需要再次请求')
    }else{
      console.log('需要再次请求')
      this.getDatas('?limit=10&offset=0&order=recommend')
    }
  },

  getDatas: function (search, type) {
    const that = this;
    getProducts(search).then( data => { // 获取所有产品的数据
      const need = data.data.results
      if (data.statusCode === 200) {
        need.map( item => {
          item['CHN'] = formatTimeCH(item.create_at)
          this.data.ids.push(item.author_id)
        })
        this.mapAuthor(unique(this.data.ids));
        this.setData({
          cells: this.data.cells.concat(need),
        })

        setTimeout(function () {
          that.getAllDatas('?limit=10&offset=0&order=hot')
        },800)

      }else {
        wx.showToast({
          image: '../../images/error.png',
          title: '获取信息失败'
        })
      }
    })
  },
  getAllDatas: function (search, type) {
    if (type) {
      wx.showLoading({
        title: '正在加载....'
      })
    }
    getProducts(search).then( data => { // 获取所有产品的数据
      const need = data.data.results;
      if (type) {
        wx.hideLoading()
      }
      if (data.statusCode === 200) {
        let arr = [];
        need.map( item => {
          item['CHN'] = formatTimeCH(item.create_at)
          if (this.data.authorIdJSON[item.author_id]) {
            
          }else{
            arr.push(item.author_id)
            // this.data.ids.push(item.author_id)
          }
        })

        this.mapAuthor(unique(arr));

        this.setData({
          allCells: this.data.allCells.concat(need),
          total: data.data.count
        })
      }else {
        console.log('错误了')
      }
    })
  },

  mapAuthor: function (mes) { //获取作者相关信息
    // 此接口作用本地缓存，五分钟过期就清除
    const that = this;
    
    const localJson = wx.getStorageSync('authJson') ? wx.getStorageSync('authJson'): this.data.authorIdJSON;
    let need = [];
      mes.map( ks => {
        if (!localJson[ks]) {
          need.push(ks)
        }
      })
      console.log(need, 'need,除了本地缓存的外，其他都需要重新获取')
      // push 需要的请求接口
      let arr = [];
      for(let i=0; i<need.length; i++) {
        arr.push(getPersonMes(need[i]))
      }
      Promise.all(arr).then( data => {
        let json = {};
        data.map( item => {
          if (item.data.avatar && item.data.avatar.indexOf('http') === -1) {
            item.data.avatar = HOST + item.data.avatar
          }
          if (item.data.intro && item.data.intro.length > 9) {
            item.data.strbool = true
          }
          item.data.str = item.data.intro.slice(0,9)
          json[item.data.id] = item.data;
        })
        that.setData({
          authorIdJSON: {...localJson, ...json}
        })
        // console.log(that.data.authorIdJSON)
        if (data.length) {
          // console.log('setStorageSync', {...localJson, ...json})
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
  //事件处理函数
  bindViewTap: function(e) {
    const id = e.currentTarget.dataset
    wx.navigateTo({
      url: `../detail/detail?id=${id.id}&author=${id.auth}`
    })
    
  },
  setNavTitle: function (id) { //设置navbar的文字
    const ids = this.data.tab
    wx.setNavigationBarTitle({
      title: ids == 1 ? '推荐作品' : '所有作品'
    })
  },

  handleNav: function(e) {
    const dataSet = e.currentTarget.dataset
    this.setData({
      tab: dataSet.id,
      // cells: []
    })
    // if (dataSet.id === '2') {
    //   this.getDatas(`?limit=10&offset=0&order=recommend`)
    // }else{
    //   this.getDatas('?limit=10&offset=0&order=recommend')
    // }
  },
  


  handleChange: function (event) {
    if (event.detail.source === "touch") {
      // 用户操作
      this.setData({
        current: event.detail.current
      })
    }
  },

  noPrise: function () {
    this.setData({
      current: this.data.current + 1
    })
  },
  prise: function (e) {
    const item = e.currentTarget.dataset;
    const that = this;
    if (!app.globalData.again) {
      // 说明这个人已经登录了，并且有了token在本地了，所以可以直接点赞
      wx.getStorage({
        key: 'keys',
        success: function (res) {
          // console.log(res.data, '$%$%$') // setData: userInfo
          const token = res.data.access_token;
          that.setData({ loading: true})
          givePraise(item.id, {}, token).then( data => {
            if (data.statusCode === 200) {
              that.data.cells[item.index].num_votes = that.data.cells[item.index].num_votes + 1
              that.animation.scale(2,2).opacity(.5).step();
              that.animation.scale(1,1).opacity(1).step();
              that.setData({
                cells: that.data.cells, 
                animationData: that.animation.export()
              })
              setTimeout(function () {
                that.setData({
                  loading: false
                })
              }, 1000)
            }else{
              that.setData({
                loading: false
              })
              wx.showToast({
                image: '../../images/error.png',
                title: data.data.message
              })
            }
          })

        },
        fail: function (res) {
          
        }
      })

    }else{
      wx.showModal({
        title: '暂未获得用户相关信息',
        content: '需要授权用户信息！',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.switchTab({
              url: '../logs/logs'
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      
    }
  },




  bindscrolltolower: function () {

    let index = this.data.index; //
    const offset = index * 10; // < this.data.total ? index * 10;
    // console.log('触发了', this.data.index, offset, this.data.total)
    if (offset < this.data.total) {
      this.setData({
        index: this.data.index + 1
      })
      const search = `?limit=10&offset=${offset}&order=${this.data.filter}`;
      // this.getDatas(search)
      this.getAllDatas(search)
    } else{
      this.setData({
        loading: false,
        line: true
      })
    }
  },

  linkSelf: function (e) {
    const obj = e.currentTarget.dataset
    wx.navigateTo({
      url: `../auth/auth?id=${obj.id}`
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'menu') {
      // 来自右上角的转发菜单
      return {
        title: '也造'
      }
    }else if (res.from === 'button') {
      // 来自按钮转发
      const datas = this.data.cells[this.data.current]
      return {
        title: `${datas.title} -- ${this.data.authorIdJSON[datas.author_id] ? this.data.authorIdJSON[datas.author_id].nickname : ''}`,
        path: `/pages/detail/detail?id=${datas.id}&author=${datas.author_id}`,
        imageUrl: `${HOST}${datas.images[0].url}`,
        success: (res) => {
          // console.log(res, '---')
        },
        fail: (res) => {
          // console.log(res)
        }
      }
    }
    
  },



  changeTabs: function (e) {
    const para = e.currentTarget.dataset.type;
    this.setData({
      filter: para,
      allCells: [],
      total: 0,
      index: 1
    })
    
    const search = `?limit=10&offset=0&order=${para}`;
    this.getAllDatas(search)
  },
  bindscroll: function (event) {
    // console.log(event.detail.scrollTop)
    // if (event.detail.scrollTop > 40) {
    //   console.log('需要的内容')
    // }
  }



})
