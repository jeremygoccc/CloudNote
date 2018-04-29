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
const showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 3000
})

// 显示成功提示
const showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
const showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}

const showTips = tips => wx.showToast({
    title: tips,
    image: '../img/warning.png',
    duration: 2000
})

const getUnique = () => 15970706944 * Math.ceil(Math.random());

// 将小程序API封装成支持Promise的API
const wxPromisify = fn => {
    return function(obj = {}) {
      return new Promise((resolve, reject) => {
        obj.success = res => { resolve(res); }
        obj.fail = res => { reject(res); }
        fn(obj)
      })
    }
}

// 时间差判断
const setInter = time => {
    setInterval(function(){
        console.log("checking");
        var txt = wx.getStorageSync("txt");
        if (txt) {
            txt.forEach(function(item) {
                // console.log(padAlarm(item.alarmTime));
                // console.log(formatTime(new Date(Date.now())));
                // console.log(Math.abs(Date.now() - new Date(padAlarm(item.alarmTime)).valueOf()));
                if (Math.abs(Date.now() - new Date(padAlarm(item.alarmTime)).valueOf()) <= time) {
                    wx.vibrateLong({
                        success: function(res) {
                            console.log(res);
                        },
                        fail: function(res) {
                            console.log(res);
                        }
                    });
                }
            });
        }
    }, time);
}

// 扩展闹钟时间加上年月日
const padAlarm = time => {
    const now = new Date(Number(Date.now()));
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return [year, month, day].map(formatNumber).join('/') + ' ' + time;
}

module.exports = { formatTime, formatNumber, showBusy, showSuccess, showModel, showTips, getUnique, wxPromisify, demo, setInter }
