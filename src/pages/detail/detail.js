
const { getProductsOfDetail, getPersonMes, givePraise, HOST, getCommentsList, addFirComments } = require('../../utils/fetch')
const { formatTimeCH } = require('../../utils/util');
const app = getApp();
Page({
  data: {
    comments: [],
    imgUrls: [],
    message: {},
    person: {},
    authors: {},
    animationData: {},
    params: {},
    loading: false,
    host: HOST,

    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 1000,
    src:" /images/touxiang.png",
    proTitle: [
      {name: '投票阶段'},
      {name: '众筹阶段'},
      {name: '生产优化'},
      {name: '生产中'},
    ],

    firValue: undefined,
    dis: true,
    srcs: null
  },
  onShow: function (e) {
    // console.log(e, 'onShow')
  },
  onLoad: function (e) {
    // console.log(e, 'onLoad')
    wx.showShareMenu({
      withShareTicket: true,
    })
    let animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-in',
    })
    this.animation = animation
    this.setData({
      params: e
    })

    getProductsOfDetail(e.id).then( data => {
      if (data.statusCode === 200) {
        // console.log(data.data, '&&')
        this.setData({
          imgUrls: data.data.images,
          message: data.data
        })
      }else{
        wx.showToast({
          title: '获取信息失败'
        })
      }
    })


    getPersonMes(e.author).then( data => {
      if (data.statusCode === 200) {
        this.setData({
          person: data.data
        })
      }else{

      }
    })


    
    this.getGlobal(e.author)
    this.commentsList()

  },

  commentsList: function () {
    getCommentsList(this.data.params.id).then( data => {
      if (data.statusCode === 200) {
        console.log(data.data)
        let arr = [];
        data.data.map( item => {
          item.bool = false;
          item['CHN'] = formatTimeCH(item.create_at)
          arr.push(item)
        })
        this.setData({
          comments: arr
        })
      }
    })
  },
  links: function () {
    wx.navigateTo({
      url: `../view/view`
    })
  },
  prise: function () {
    const that = this;
    this.setData({
      loading: true
    })

    givePraise(this.data.params.id).then( data => {
      if (data.statusCode === 200) {
        this.data.message.num_votes = this.data.message.num_votes + 1;
        this.animation.scale(2,2).opacity(.5).step();
        this.animation.scale(1,1).opacity(1).step();
        this.setData({
          message: this.data.message, 
          animationData: this.animation.export()
        })
        setTimeout(function () {
          that.setData({
            loading: false
          })
        }, 600)
      }else{
        wx.showToast({
          icon: 'none',
          mask: true,
          title: data.data.message
        })
        setTimeout(function () {
          that.setData({
            loading: false
          })
        }, 600)
      }
    })
  },
  onShareAppMessage: function (res) {
    console.log(res)
    // console.log(this.data.person)
    // console.log(this.data.message)
    // console.log(this.data.params)
    if (res.from === 'menu') {
      // 来自右上角的转发菜单
    }else if (res.from === 'button') {
      // 来自按钮转发
    }
    return {
      title: `${this.data.message.title} -- ${this.data.person.nickname}`,
      path: `/pages/detail/detail?id=${this.data.params.id}&author=${this.data.params.author}`,
      imageUrl: `${HOST}${this.data.message.images[0].url}`,
      success: (res) => {
        console.log(res, '---')
      },
      fail: (res) => {
        console.log(res)
      }
    }
  },







  handlePing: function(e) {
    const index = e.currentTarget.dataset;
    this.data.comments[index.index].bool = !this.data.comments[index.index].bool
    this.setData({
      comments: this.data.comments
    })
  },


  valueChange: function (e) {
    this.setData({
      firValue: e.detail.value,
    })
  },
  takeComment: function () {
    this.setData({dis: false})

    
    addFirComments(this.data.params.id, {content: this.data.firValue}).then( data => {
      this.setData({dis: true})
      if (data.statusCode === 200) {
        this.commentsList()
      }else{
        
        if (data.data.code === 'not_authenticated') {
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
        }else{
          wx.showToast({
            icon: 'none',
            mask: true,
            title: data.data.message
          })
        }
        
      }

    })
  },
  getGlobal: function (id) {
    const that = this;
    if (app.globalData.keys) {
      console.log(app.globalData.keys[id], '---')
      this.setData({
        person: app.globalData.keys[id],
        authors: app.globalData.keys
      })
    }else{
      wx.getStorage({
        key: 'keys',
        success: function (res) {
          that.setData({
            person: res.data[id],
            authors: res.data,
          })
        },
        fail: function (res) {
          console.log(res)
        }
      })
    }
  }




})