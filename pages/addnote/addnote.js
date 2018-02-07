var timeFormat = require("../../utils/util.js");

Page({
    data: {
        now: timeFormat.formatTime(new Date(Number(Date.now())))
    },
    onLoad: function(e) {
        console.log(e);
        var id = e.id;
        if(id) { // id存在则为修改记事本
            typeof this.getData == "function" && this.getData(id, this);
        } else { // id不存在则为新增记事本
            this.setData({
                id: Date.now()  // id为当前时间,并绑定到页面实例
            })
        }
    },
    change: function(e) {
        console.log(e);
        this.setData({
            content: e.detail.value
        })
    },
    save: function() {
        // 判断内容是否为空或者为空格
        console.log("save");
        var re = /^\s*$/g,
            content = this.data.content;
        if(!content || re.test(content)) return;
        this.setData({
            title: content.slice(0, 4),
            time: Date.now()
        })
        typeof this.saveContent == "function" && this.saveContent(this);
        wx.redirectTo({
            url: "../index/index"
        })
    },
    getData: function(id, page) {
        var arr = wx.getStorageSync("txt");
        arr.forEach(function(item) {
            if(!arr.length) return;
            if(item.id == id) {
                page.setData({
                    id: item.id,
                    title: item.title,
                    content: item.content
                })
            }
        })
    },
    saveContent: function(page) {
        var arr = wx.getStorageSync("txt");
        var data = [],
            editFlag = false;
        if(arr.length) {
            arr.forEach(function(item) {
                if(item.id == page.data.id) {
                    item.time = Date.now();
                    item.title = page.data.content.slice(0, 4);
                    item.content = page.data.content;
                    editFlag = true;
                }
                data.unshift(item);
            })
        }
        if(!editFlag) data.unshift(page.data);  // 新增记事本内容
        wx.setStorageSync("txt", data);
        console.log("save success");
    }
})