var timeFormat = require("../../utils/util.js");

Page({
  data: {
    mylists: [
        {
            id: "",
            title: "示例",
            content: "欢迎使用云笔记~",
            time: "18:32"
        }
    ]
  },
  onLoad: function() {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1500
    });
    typeof this.initData == "function" && this.initData(this);
  },
  initData: function(page) {
    var txt = wx.getStorageSync("txt");
    console.log(txt);
    if(txt.length) {
        txt.forEach(function(item, i) {
            var t = new Date(Number(item.time));
            item.time = timeFormat.formatTime(t);
        })
    }
    page.setData({
        mylists: txt
    });
    wx.hideToast();
  },
  edit: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.navigateTo({
        url: "../addnote/addnote?id="+id
    })
  },
  add: function() {
    console.log("Add");
    wx.navigateTo({
        url: "../addnote/addnote"
    })
  }
})
