const Promise = require('es6-promise.min.js');
const QQMapWX = require('qqmap-wx-jssdk.js');
const demo = new QQMapWX({
    key: '3D6BZ-P2T3Q-NNZ5P-GD6C2-4T6PJ-RRFDQ' // 必填
});

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  // return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 30000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}

var showTips = tips => wx.showToast({
    title: tips,
    image: '/utils/warning.png',
    duration: 2000
})

var getUnique = () => 15970706944 * Math.ceil(Math.random());

// 将小程序API封装成支持Promise的API
var wxPromisify = fn => {
    return function(obj = {}) {
      return new Promise((resolve, reject) => {
        obj.success = res => { resolve(res); }
        obj.fail = res => { reject(res); }
        fn(obj)
      })
    }
}

module.exports = { formatTime, showBusy, showSuccess, showModel, showTips, getUnique, wxPromisify, demo }
