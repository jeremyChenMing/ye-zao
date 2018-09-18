
const { getProductsOfDetail, getPersonMes, givePraise, HOST, getCommentsList, addFirComments } = require('../../utils/fetch')
const { formatTimeCH } = require('../../utils/util');
const app = getApp();
const l = `${HOST}/api/v1/file/thumbnail?size=335x200&origin=`
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
    host: l,

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

    firValue: '',
    dis: true,
    srcs: null
  },
  onShow: function (e) {
    // console.log(e, 'onShow')
  },
  onLoad: function (e) {
    // console.log(e, 'onLoad')

    // const startTime = new Date("2018-09-07 16:33:27")
    // const endTime = new Date("2018-09-07 16:33:26")
    // console.log(startTime > endTime, '-----')
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
        if (data.data.avatar && data.data.avatar.indexOf('http') === -1) {
          data.data.avatar = HOST + data.data.avatar
        }
        this.setData({
          person: data.data
        })
      }else{

      }
    })

    this.commentsList()

  },

  commentsList: function () {
    getCommentsList(this.data.params.id).then( data => {
      if (data.statusCode === 200) {
        console.log(data.data)
        let arr = [];
        data.data.map( item => {
          if (item.author.avatar.indexOf('http') === -1) {
            item.author.avatar = HOST + item.author.avatar
          }
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
    if (!app.globalData.again) {
      wx.getStorage({
        key: 'keys',
        success: function (res) {
          console.log(res.data, '$%$%$') // setData: userInfo
          const token = res.data.access_token;
          that.setData({ loading: true})
          givePraise(that.data.params.id, {}, token).then( data => {
            if (data.statusCode === 200) {
              that.data.message.num_votes = that.data.message.num_votes + 1;
              that.animation.scale(2,2).opacity(.5).step();
              that.animation.scale(1,1).opacity(1).step();
              that.setData({
                message: that.data.message, 
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
    const that = this;
    if (!app.globalData.again) {
      wx.getStorage({
        key: 'keys',
        success: function (res) {
          console.log(res.data, '$%$%$') // setData: userInfo
          const token = res.data.access_token;
          that.setData({dis: false})
          addFirComments(that.data.params.id, {content: that.data.firValue}, token).then( data => {
            that.setData({dis: true})
            console.log(data,'-----')
            if (data.statusCode < 300) {
              that.setData({firValue:  ''})
              that.commentsList()
            }else{
              wx.showToast({
                image: '../../images/error.png',
                title: '评论失败！'
              })
            }
          })
        },
        fail: function () {
          
        }
      })
    } else {
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


})