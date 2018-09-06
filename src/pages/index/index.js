//index.js
//获取应用实例
const app = getApp()
const { getProducts, getPersonMes, givePraise, HOST } = require('../../utils/fetch')
const { unique, formatTimeCH } = require('../../utils/util')

Page({
  data: {
    tab: 1,
    host: HOST,
    authorIdJSON: {},
    cells: [],
    loadings: false,
    dots: false,
    auto: false,
    current: 0,
    pre: '80rpx',
    next: '80rpx',



    ids: [],
    total: 0,
    loading: true,
    line: false,
    pageNum: 1,
    index: 1
  },
  
  onLoad: function () { // 页面初始化
    // wx.showShareMenu({
    //   withShareTicket: true,
    // })
    this.getDatas('?limit=10&offset=0&order=hot')
    let animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in',
    })
    this.animation = animation

  },

  getDatas: function (search, type) {
    getProducts(search).then( data => { // 获取所有产品的数据
      const need = data.data.results
      if (data.statusCode === 200) {
        need.map( item => {
          item['CHN'] = formatTimeCH(item.create_at)
          this.data.ids.push(item.author_id)
        })
        this.mapAuthor(unique(this.data.ids));
        // this.getGlobal()
        this.setData({
          cells: this.data.cells.concat(need),
          total: data.data.count
        })
      }else {
        wx.showToast({
          title: '获取信息失败'
        })
      }
    })
  },

  mapAuthor: function (mes) { //获取作者相关信息
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
      tab: dataSet.id
    })
    // if (dataSet.id === '2') {
    //   this.getDatas(`?limit=10&offset=${this.data.pageNum}&order=hot`)
    // }else{
    //   this.getDatas('?limit=10&offset=0&order=hot')
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



  // onShareAppMessage: function (res) {
  //   console.log(res)
  //   if (res.from === 'menu') {
  //     // 来自右上角的转发菜单
  //   }else if (res.from === 'button') {
  //     // 来自按钮转发
  //   }
  //   return {
  //     title: '小霸王其乐无穷',
  //     path: '/pages/index/index?id=123',
  //     imageUrl: '/images/produce.png',
  //   }
  // },
  noPrise: function () {
    this.setData({
      current: this.data.current + 1
    })
  },
  prise: function (e) {
    const item = e.currentTarget.dataset;
    const that = this;
    this.setData({
      loading: true
    })
    givePraise(item.id /*token*/).then( data => {
      if (data.statusCode === 200) {
        this.data.cells[item.index].num_votes = this.data.cells[item.index].num_votes + 1
        this.animation.scale(2,2).opacity(.5).step();
        this.animation.scale(1,1).opacity(1).step();
        this.setData({
          cells: this.data.cells, 
          animationData: this.animation.export()
        })
        setTimeout(function () {
          that.setData({
            loading: false
          })
        }, 1600)
      }else{
        wx.showModal({
          title: `${data.data.message}`,
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
    })
    
  },
  getGlobal: function () {
    const that = this;
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
  },





  bindscrolltolower: function () {
    let index = this.data.index; //
    const offset = index * 10; // < this.data.total ? index * 10;
    if (offset < this.data.total) {
      this.setData({
        index: this.data.index + 1
      })
      const search = `?limit=10&offset=${offset}&order=hot`;
      this.getDatas(search)
    } else{
      this.setData({
        loading: false,
        line: true
      })
    }
  }










})
