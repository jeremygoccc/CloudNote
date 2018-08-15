// pages/modal/modal.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    modalShow: {
      type: Boolean,
      value: false
    },
    height: {
      type: String,
      value: '50%'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    clickMask () {
      this.setData({
        modalShow: false
      })
    },
    cancelModal () {
      this.setData({
        modalShow: false
      })
      this.triggerEvent('cancel')
    },
    confirmModal () {
      this.setData({
        modalShow: true
      })
      this.triggerEvent('confirm')
    }
  }
})
