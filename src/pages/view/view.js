
    // srcs: 'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzIyNzI0NDEzNg==#wechat_redirect'
Page({
  data:{
    local: false,
    srcs: 'https://www.51bricks.com/h3.html',
    images: '/images/er.jpg',
    image: 'https://www.51bricks.com/static/gong.d3922cc9.jpg',
    urls: ['https://www.51bricks.com/img/my.jpg', 'https://www.51bricks.com/img/myxcx.jpg', 'https://www.51bricks.com/img/yzxcx.jpg', 'https://www.51bricks.com/static/gong.d3922cc9.jpg']

  },
  onLoad: function () {
    
  },

  previewImage: function (e) {
    // 
    wx.previewImage({
     current: 'https://www.51bricks.com/static/gong.d3922cc9.jpg', // 当前显示图片的http链接 
     urls: this.data.urls
    })
  }
})