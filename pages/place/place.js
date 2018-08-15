// pages/place/place.js
var util = require("../../utils/util");
var app = getApp();
var place = {};
var noteId = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    locating: false,
    placeItems: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
        var that = this;
        noteId = e.id;
        // 获取定位，并把位置标示出来
        app.getLocationInfo(function (locationInfo) {
          console.log('map', locationInfo);
          that.setData({
            longitude: locationInfo.longitude,
            latitude: locationInfo.latitude,
            markers: [
              {
                id: 0,
                // title: '移动红点到你想要接受提醒的位置',
                iconPath: "../../img/bposition.png",
                longitude: locationInfo.longitude,
                latitude: locationInfo.latitude,
                width: 30,
                height: 30
              }
            ]
          })
        })
        wx.getSystemInfo({
          success: function (res) {
            console.log('getSystemInfo');
            console.log(res.windowWidth);
            that.setData({
              controls:
                [{
                  id: 1,
                  iconPath: '../../img/alocation.png',
                  position: {
                    left: res.windowWidth / 2 - 15,
                    top: res.windowWidth / 2 - 65,
                    width: 30,
                    height: 30
                  },
                  clickable: true
                }]
            })
          }
        })
  },
  place: function() {
    var that = this;
    this.mapCtx = wx.createMapContext("myMap");
    this.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res.longitude);
        console.log(res.latitude);
        var longitude = res.longitude;
        var latitude = res.latitude;
        var dizhi = {longitude,latitude};
        wx.navigateTo({
        url: "../addnote/addnote?dizhi="+dizhi
        })
      }
    })
  }
  ,
  placeSearch: function(e) {
    var _this = this;
    console.log(e.detail.value);
    util.demo.getSuggestion({
        keyword: e.detail.value,
        region: "南昌",
        policy: 1,
        success: function(res) {
            console.log(res);
            _this.setData({
                locating: true,
                placeItems: res.data
            });
        },
        fail: function(res) {
            console.log(res);
        }
    });
  },
  bindChange: function(e) {
    var that = this;
    console.log(that.data.placeItems[e.detail.value]);
    var latitude = that.data.placeItems[e.detail.value].location.lat;
    var longitude = that.data.placeItems[e.detail.value].location.lng;
    place = that.data.placeItems[e.detail.value];
    console.log(place)
    that.setData({
      longitude: longitude,
      latitude: latitude,
      markers: [
        {
          id: 0,
          // title: '移动红点到你想要接受提醒的位置',
          iconPath: "../../img/bposition.png",
          longitude: longitude,
          latitude: latitude,
          width: 30,
          height: 30
        }
      ]
    })
  },
  confirmPlace: function(e) {
    console.log("noteId: " + noteId);
    // console.log(e);
    var fid = e.detail.formId;
    if(this.data.placeItems.length == 0) {
      util.showBusy("请输入地点");
      return;
    }
    var arr = wx.getStorageSync("txt");
    if(arr.length) {
        arr.forEach(function(item) {
            if(item.id == noteId) {
                item.place = place
            }
        })
        console.log('存储地理信息！')
    }
    arr['formid'] = fid;
    util.didianmoban(arr);
    wx.setStorageSync("txt", arr)
    wx.redirectTo({
        url: "../addnote/addnote?id="+noteId
    });
  },
  back: function() {
    wx.navigateBack({
        delta: 1
    })
  }

})