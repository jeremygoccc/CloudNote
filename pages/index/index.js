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
    ],
    pressFlag: true
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
    } else return;
    page.setData({
        mylists: txt
    });
    wx.hideToast();
  },
  press: function(e) {
    console.log(e);
    this.setData({
      pressFlag: false
    })
  },
  edit: function(e) {
    console.log(e);
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
  },
  delete: function(e) {
    const id = e.currentTarget.dataset.id;
    const context = this;
    wx.showModal({
        content: "确认删除？",
        confirmText: "确认",
        cancelText: "取消",
        success: res => {
            if(res.confirm) {
              typeof context.delNote == "function" && context.delNote(context, id);
            } else {
                console.log("用户点击取消");
            }
        }
    });
  },
  delNote: function(page, id) {
    var arr = wx.getStorageSync("txt");
    var data = [];
    if(arr.length) {
        arr.forEach(function(item) {
            if(item.id !== id) {
              data.push(item);
            }
        })
    }
    wx.setStorageSync("txt", data);
    console.log("delete success");
    page.setData({
        mylists: data
    });
  },
  login: function() {
    console.log("Login");
    wx.navigateTo({
        url: "../login/login"
    })
  }
})
