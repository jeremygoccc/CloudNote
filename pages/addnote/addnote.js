var util = require("../../utils/util.js");
const recorderManager = wx.getRecorderManager();
const recordOptions = {
    duration: 60000,
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 48000,
    format: 'mp3'
    //frameSize: 50
};
// const API_URL = 'https://voice.jeremygo.cn';

const API_URL = "https://api.happycxz.com/wxapp/mp32asr";
const app_key = "a6ec7ac74ff64c658666dda192e4a17f";
const app_secret = "3d969f5472fc4bc8a915f86ff044e2bf";

var id;
var timer;

Page({
    data: {
        now: util.formatTime(new Date(Number(Date.now()))),
        voicing: false,
        content: '',
        frame: 1,
        place: ''
    },
    onLoad: function(e) {
        console.log(e);
        id = e.id;
        const _this = this;
        if(id) { // id存在则为修改记事本
            typeof this.getData == "function" && this.getData(id, this);
        } else { // id不存在则为新增记事本
            this.setData({
                id: Date.now()  // id为当前时间,并绑定到页面实例
            })
        }
        recorderManager.onStart(() => {
            console.log("record start");
        })
        recorderManager.onStop((res) => {
            console.log('recorder stop', res);
            // const { tempFilePaths } = res;
            // wx.saveFile({
            //     tempFilePath: res.tempFilePath,
            //     success: function(res) {
            //         var savedFilePath = res.savedFilePath;
            //         console.log('savedFilePath: ' + savedFilePath);
            //     }
            // });
            wx.uploadFile({
                url: API_URL,
                filePath: res.tempFilePath,
                name: 'file',
                header: {
                  'Content-Type': 'multipart/form-data'
                },
                formData: {
                    "appKey": app_key,
                    "appSecret": app_secret,
                    "userId": util.getUnique()
                },
                success: function(res) {
                    console.log("res.data: " + res.data);
                    let data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                    if(data.msg == "olami asr success!") {
                        var nliRes = _this.getNliFromRes(res.data);
                        console.log('nliRes: ' + nliRes);
                        var stt = _this.getSttFromRes(res.data);
                        console.log('stt: ' + stt);
                        var content = _this.setData.content + ',' + stt;
                        _this.setData({
                            content: content
                        });
                    } else {
                        util.showBusy("识别失败，请重试");
                    }
                },
                fail: function(res) {
                    console.log(res);
                    util.showModel('提示', '网络请求失败…');
                }
            });
            console.log("录音文件保存成功");
        });
    },
    getNliFromRes: function(res_data) {
        var res_data_json = JSON.parse(res_data);
        var res_data_res_json = JSON.parse(res_data_json.result);
        return res_data_res_json.nli;
    },
    getSttFromRes: function(res_data) {
        var res_data_json = JSON.parse(res_data);
        var res_data_res_json = JSON.parse(res_data_json.result);
        return res_data_res_json.asr.result;
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
        wx.reLaunch({
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
                    content: item.content,
                    place: item.place
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
                    item.place = page.data.place;
                    editFlag = true;
                }
                console.log(item);
                data.push(item);
            })
        }
        data.sort(function(pre, next) {
            return next.time - pre.time;
        });
        if(!editFlag) data.unshift(page.data);  // 新增记事本内容
        wx.setStorageSync("txt", data);
        console.log("save success");
    },
    record: function() {
        console.log(recorderManager);
        this.setData({
            voicing: true
        });
        this.speaking();
        recorderManager.start(recordOptions);
    },
    end: function() {
        console.log("录音结束");
        this.setData({
            voicing: false
        });
        clearInterval(this.timer);
        recorderManager.stop();
    },
    speaking: function() {
        const _this = this;
        var i = 1;
        this.timer = setInterval(function() {
            i++;
            i = i % 5;
            _this.setData({
                frame: i
            });
        }, 200);
    },
    share: function() {
        console.log("share");
        wx.canvasToTempFilePath({
            x: 100,
            y: 200,
            width: 50,
            height: 50,
            destWidth: 100,
            destHeight: 100,
            canvasId: 'shareCanvas',
            success: function(res) {
                console.log(res.tempFilePath);
            },
            fail: function(res) {
                console.log(res);
            }
        })
    },
    onShareAppMessgae: function(res) {
        if (res.from === 'button') {
            console.log(res.target);
        }
        return {
            title: '标题',
            path: '',
            imageUrl: '',
            success: function(res) {

            },
            fail: function(res) {

            }
        }
    },
    showPlace: function(e) {
        console.log(e);
        wx.navigateTo({
            url: "../place/place?id="+id
        })
    }
})