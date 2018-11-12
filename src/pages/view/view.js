
const app = getApp()

Page({
  data:{
    local: false,
    srcs: 'https://www.51bricks.com/h3.html',
    images: '/images/er.jpg',
    image: 'https://www.51bricks.com/static/gong.d3922cc9.jpg',
    urls: ['https://www.51bricks.com/img/my.jpg', 'https://www.51bricks.com/img/myxcx.jpg', 'https://www.51bricks.com/img/yzxcx.jpg', 'https://www.51bricks.com/static/gong.d3922cc9.jpg'],
    official: ''
  },
  onLoad: function () {
    const op = app.globalData.options
    console.log(op.scene, '----')
     // || op.scene === 1047 || op.scene === 1089 || op.scene === 1038
    if (op.scene === 1011) {
      this.setData({
        official: 'official'
      })
    }else{
      this.setData({
        official: 'view'
      })
    }
  },
  previewImage: function (e) {
    // 
    wx.previewImage({
     current: 'https://www.51bricks.com/static/gong.d3922cc9.jpg', // 当前显示图片的http链接 
     urls: this.data.urls
    })
  }
})