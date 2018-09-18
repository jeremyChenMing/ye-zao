//index.js
//获取应用实例

// http://bricks.upvi.com/api/v1/file/thumbnail?origin=/public/uploads/9/2018-08/shenhui1.jpg&size=100x100


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
    loadings: true,
    dots: false,
    auto: false,
    current: 1,
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

    this.getDatas('?limit=10&offset=0&order=recommend')
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
          image: '../../images/error.png',
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
      console.log(data)
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
      console.log(json)
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
    if (!app.globalData.again) {
      // 说明这个人已经登录了，并且有了token在本地了，所以可以直接点赞
      wx.getStorage({
        key: 'keys',
        success: function (res) {
          console.log(res.data, '$%$%$') // setData: userInfo
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
    console.log('触发了', this.data.index, offset, this.data.total)
    if (offset < this.data.total) {
      this.setData({
        index: this.data.index + 1
      })
      const search = `?limit=10&offset=${offset}&order=recommend`;
      this.getDatas(search)
    } else{
      this.setData({
        loading: false,
        line: true
      })
    }
  }










})
