// pages/components/navbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    tabs: ["新增分类", "修改分类", "删除分类"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    countries: ["数据结构", "操作系统", "组成原理"],
    countryIndex: 0
  },
  ready: function () {
        let classifies = wx.getStorageSync("classifies")
        console.log(classifies)
        this.setData({
            countries: classifies
        })
  },
  methods: {
    tabClick: function (e) {
        console.log(e.currentTarget.id)
        this.setData({
          sliderOffset: e.currentTarget.offsetLeft,
          activeIndex: e.currentTarget.id
        });
        wx.setStorageSync("classActiveIndex", this.data.activeIndex)
        console.log(wx.getStorageSync("classActiveIndex"))
    },
    bindCountryChange: function (e) {
        this.setData({
            countryIndex: e.detail.value
        })
        wx.setStorageSync("classIndex", this.data.countryIndex)
    },
    inputConfirm: function (e) {
        console.log(e.detail.value)
        wx.setStorageSync("classActiveName", e.detail.value)
    }
  }
})
