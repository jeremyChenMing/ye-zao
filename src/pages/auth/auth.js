// pages/auth/auth.js
const { getPersonMes, HOST,getAuthOfProduce } = require('../../utils/fetch')
const { formatTimeCH } = require('../../utils/util');
const app = getApp();
const l = `${HOST}/api/v1/file/thumbnail?size=335x200&origin=`

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    cells: [],
    host: l,
    loading: true,
    line: false,
    page: 1,
    total: 0,
    id: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    this.setData({id:e.id})
    getPersonMes(e.id).then( data => {
      if (data.statusCode === 200) {
        if (data.data.avatar && data.data.avatar.indexOf('http') === -1) {
          data.data.avatar = HOST + data.data.avatar
        }
        this.setData({
          userInfo: data.data
        })
      }else{

      }
    })
    const url = `?limit=10&offset=${(this.data.page - 1) * 10}`
    this.getData(e.id, url)
  },
  getData: function (id, url) {
    getAuthOfProduce(id, url).then( data => {
      if (data.statusCode === 200) {
        let arr = [];
        data.data.results.map( item => {
          item['CHN'] = formatTimeCH(item.create_at)
          arr.push(item.author_id)
        })
        this.setData({
          cells: this.data.cells.concat(data.data.results),
          total: data.data.count,
          loading: false
        })
      }else{
        wx.showToast({
          image: '../../images/error.png',
          title: '获取信息失败'
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
  bindscrolltolower: function () {
    console.log('到底了')
    let index = this.data.page;
    const offset = index * 10;
    if (offset < this.data.total) {
      this.setData({
        page: this.data.page + 1
      })
      const search = `?limit=10&offset=${offset}`;
      this.getData(this.data.id, search)
    } else{
      this.setData({
        loading: false,
        line: true
      })
    }

  }









})