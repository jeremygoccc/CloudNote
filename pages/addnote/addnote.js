var util = require("../../utils/util.js");
const recorderManager = wx.getRecorderManager();
const recordOptions = {
    duration: 60000,
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 48000,
    format: 'mp3',
    frameSize: 50
};

const innerAudioContext = wx.createInnerAudioContext();
const saveFilePromised = util.wxPromisify(wx.saveFile);

// const API_URL = 'https://voice.jeremygo.cn';

const API_URL = "https://api.happycxz.com/wxapp/mp32asr";
const app_key = "a6ec7ac74ff64c658666dda192e4a17f";
const app_secret = "3d969f5472fc4bc8a915f86ff044e2bf";

var id;
var timer;
var startTime = 0;
var endTime = 0;

Page({
    data: {
        item: {
            id: '',
            voicing: false,
            content: '',
            frame: 1,
            place: '',
            alarmTime: '',
            classifies: [],
            pin: 0,
            savedFilePath: '',
            duration: 0,
            voiceFlag: false,
            saveFlag: false,
        },
        now: util.formatTime(new Date(Number(Date.now()))),
        showMenu: false,
        showTime: false,
        showClass: false,
        classifies: [
            '未分类',
            '操作系统',
            '数据结构',
            '组成原理',
            '自定义'
        ],
        classIndex: 0,
        currentClass: '未分类',
        modalShow: false,
        unloadFlag: false
    },
    onLoad: function(e) {
        this.classifiesInit();
        id = e.id;
        const _this = this;
        if(id) { // id存在则为修改记事本
            typeof this.getData == "function" && this.getData(id, this);
            _this.setData({
                saveFlag: true,
                unloadFlag: true
            });
        } else { // id不存在则为新增记事本
            var item = this.data.item;
            item.id = Date.now();
            this.setData({
                item: item  // id为当前时间,并绑定到页面实例
            })
        }
        recorderManager.onStart(() => {
            console.log("record start");
        })
        recorderManager.onStop((res) => {
            console.log('recorder stop', res);
            wx.showLoading({
                title: '识别中'
            });
            // const { tempFilePaths } = res;
            var duration = Math.ceil((this.endTime - this.startTime)/1000);
            console.log(duration);
            saveFilePromised({
                tempFilePath: res.tempFilePath,
            }).then(function(res) {
                var savedFilePath = res.savedFilePath;
                console.log('savedFilePath: ' + savedFilePath);
                var item = _this.data.item;
                item.voiceFlag = true;
                item.duration = duration;
                item.savedFilePath = savedFilePath;
                _this.setData({
                    item: item
                });
                console.log(_this.data.item);
                wx.uploadFile({
                    url: API_URL,
                    filePath: _this.data.item.savedFilePath,
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
                        wx.hideLoading();
                        console.log("res.data: " + res.data);
                        let data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
                        if(data.msg == "olami asr success!") {
                            var nliRes = _this.getNliFromRes(res.data);
                            console.log('nliRes: ' + nliRes);
                            var stt = _this.getSttFromRes(res.data);
                            console.log('stt: ' + stt);
                            var item = _this.data.item;
                            var content = _this.data.item.content ? _this.data.item.content + ',' + stt : stt;
                            item.content = content;
                            console.log(item);
                            _this.setData({
                                item: item
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
            })
            console.log("录音文件保存成功");
        });
    },
    onUnload: function() {
        console.log("onUnload");
        console.log("unloadFlag: ");
        console.log(this.data.unloadFlag);
        // if (!this.data.unloadFlag) return;
        wx.redirectTo({
            url: '../index/index'
        });
    },
    getData: function(id, page) {
        const _this = this;
        this.setData({
            saveFlag: true
        });
        var arr = wx.getStorageSync("txt");
        arr.forEach(function(item) {
            if(!arr.length) return;
            if(item.id == id) {
                console.log(item);
                _this.setData({
                    item: item
                })
            }
        });
        console.log("getdata: ");
        console.log(this.data.item.place);
        if (_this.data.item.duration) {
            _this.setData({
                voiceFlag: true
            });
        }
        if (_this.data.item.alarmTime) {
            _this.setData({
                showTime: true
            });
        }
        if (_this.data.item.classifies && _this.data.item.classifies !== '未分类') {
            _this.setData({
                showClass: true,
                currentClass: _this.data.item.classifies
            })
        }
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
        var item = this.data.item;
        item.content = e.detail.value;
        this.setData({
            item: item
        })
        this.save();
    },  
    save: function() {
        // 判断内容是否为空或者为空格
        console.log("before save");
        console.log(this.data.item.place);
        var re = /^\s*$/g;
        var content = this.data.item.content;
        if(!content || re.test(content)) return;
        var item = this.data.item;
        item.time = Date.now();
        console.log(item);
        this.setData({
            item: item
        })
        typeof this.saveContent == "function" && this.saveContent(this);
        // wx.redirectTo({
        //     url: "../index/index"
        // })
    },
    saveContent: function(page) {
        const _this = this;
        var arr = wx.getStorageSync("txt");
        var data = [];
        var editFlag = false;
        if(arr.length) {
            arr.forEach(function(item) {
                console.log(item);
                console.log(_this.data.item);
                if(item.id == _this.data.item.id) {
                    item = _this.data.item;
                    item.time = Date.now();
                    editFlag = true;
                }
                data.push(item);
            })
        }
        if(!editFlag) data.unshift(this.data.item);
        var pinData = [];
        var unPin = [];
        data.forEach(item => {
            item.pin === 1 ? pinData.push(item) : unPin.push(item);
        });
        unPin.sort(function(pre, next) {
            return next.time - pre.time;
        });
        var newData = pinData.concat(unPin);
        console.log(newData);
        wx.setStorageSync("txt", newData);
        console.log("save success");
    },
    record: function() {
        console.log(recorderManager);
        this.startTime = Date.now();
        this.setData({
            voicing: true
        });
        this.speaking();
        recorderManager.start(recordOptions);
    },
    end: function() {
        console.log("录音结束");
        this.endTime = Date.now();
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
    voicePlay: function(e) {
        var voicePath = e.target.dataset.voice;
        console.log(voicePath);
        innerAudioContext.src = voicePath;
        innerAudioContext.play();
        innerAudioContext.onError((res) => {
            console.log(res);
        });
        innerAudioContext.onPlay(() => {
            console.log("开始播放");
        });
    },
    voiceEnd: function(e) {
        console.log("voiceEnd");
        innerAudioContext.stop();
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
                console.log('分享成功')
            },
            fail: function(res) {
                console.log('分享失败，请重试')
            }
        }
    },
    showMenu: function() {
        this.setData({
            showMenu: !this.data.showMenu
        });
    },
    showClass: function () {
        this.setData({
            showClass: !this.data.showClass
        })
        console.log(this.data.showClass)
    },
    cancelClass: function () {
        const _this = this
        let arr = wx.getStorageSync("txt")
        arr.some(function (item) {
            if (item.id === _this.data.item.id) {
                item.classifies = '未分类'
            }
            return true
        })
        wx.setStorageSync("txt", arr)
        this.setData({
            showClass: false
        })
    },
    showTime: function() {
        if (!this.data.saveFlag) {
            util.showBusy("请先保存当前笔记");
            return;
        }
        this.setData({
            showTime: !this.data.showTime
        });
    },
    cancelTime: function() {
        if (this.data.item.alarmTime) {
            const context = this;
            wx.showModal({
                content: "确认取消闹钟？",
                confirmText: "确认",
                cancelText: "取消",
                success: res => {
                    if(res.confirm) {
                      typeof context.canTime == "function" && context.canTime(context, id);
                    } else {
                        console.log("用户点击取消");
                    }
                }
            });
        }
    },
    canTime: function(context, id) {
        var item = this.data.item;
        item.alarmTime = '';
        var arr = wx.getStorageSync("txt");
        if(arr.length) {
            arr.forEach(function(item) {
                if(item.id == id) {
                    item.alarmTime = ''
                }
            })
        }
        wx.setStorageSync("txt", arr);
        wx.redirectTo({
            url: "../addnote/addnote?id="+this.data.item.id
        });
        console.log("取消闹钟成功");
    },
    showPlace: function(e) {
        console.log(e);
        if (!this.data.saveFlag) {
            util.showBusy("请先保存当前笔记");
            return;
        }
        wx.navigateTo({
            url: "../place/place?id="+this.data.item.id
        })
    },
    cancelPlace: function() {
        if (this.data.item.place) {
            const context = this;
            wx.showModal({
                content: "确认取消地点？",
                confirmText: "确认",
                cancelText: "取消",
                success: res => {
                    if(res.confirm) {
                      typeof context.canPlace == "function" && context.canPlace(context, id);
                    } else {
                        console.log("用户点击取消");
                    }
                }
            });
        }
    },
    canPlace: function(context, id) {
        var item = this.data.item;
        item.place = '';
        var arr = wx.getStorageSync("txt");
        if(arr.length) {
            arr.forEach(function(item) {
                if(item.id == id) {
                    item.place = ''
                }
            })
        }
        wx.setStorageSync("txt", arr);
        wx.redirectTo({
            url: "../addnote/addnote?id="+this.data.item.id
        });
    },
    bindTimeChange: function(e) {
        const _this = this;
        var item = this.data.item;
        item.alarmTime = e.detail.value;
        this.setData({
            item: item
        });
        var arr = wx.getStorageSync("txt");
        if(arr.length) {
            arr.forEach(function(item) {
                if(item.id == _this.data.item.id) {
                    item.alarmTime = e.detail.value
                }
            })
        }
        wx.setStorageSync("txt", arr);
        console.log(arr);
        clearInterval(util.setInter);
        util.setInter(1000);
        this.save();
    },
    bindClassChange: function (e) {
        if (this.data.classifies[e.detail.value] === '自定义') {
            this.setData({
                modalShow: true
            })
            return
        }
        this.setData({
            currentClass: this.data.classifies[e.detail.value]
        })
        this.classSave()
    },
    classSave: function () {
        const _this = this
        let arr = wx.getStorageSync("txt")
        if (arr.length) {
            arr.forEach(function (item) {
                if (item.id === _this.data.item.id) {
                    // if (item.classifies && item.classifies.length > 0) {
                    //     _this.data.item.classifies = item.classifies.push(_this.data.currentClass)
                    //     item.classifies = _this.data.item.classifies
                    // } else {
                    //     _this.data.item.classifies = []
                    //     _this.data.item.classifies.push(_this.data.currentClass)
                    //     item.classsifies = _this.data.item.classifies
                    // }
                    _this.data.item.classifies = _this.data.currentClass
                    item.classifies = _this.data.item.classifies
                }
            })
        }
        wx.setStorageSync("txt", arr)
        console.log(arr)
        this.save()
    },
    modalConfirm: function () {
        let index = wx.getStorageSync("classActiveIndex")
        let newClass = wx.getStorageSync("classActiveName")
        let classIndex = wx.getStorageSync("classIndex")
        let classifies = wx.getStorageSync("classifies")
        switch (index) {
            case 0:
                this.addClass(classifies, newClass);
                break;
            case "1":
                this.modifyClass(classifies, classIndex, newClass);
                break;
            case "2":
                this.deleteClass(classifies, classIndex);
                break;
        }
        this.setData({
            modalShow: false
        })
        console.log('confirm complete')
        wx.setStorageSync("classActiveIndex", 0)
        wx.setStorageSync("classIndex", 0)
        this.classifiesInit()
        // console.log(id)
        // wx.redirectTo({
        //     url: "../addnote/addnote?id="+id
        // });
    },
    addClass: function (classifies, newClass) {
        console.log('新增分类')
        if (!classifies.includes(newClass)) {
            classifies.push(newClass)
        } else {
            util.showBusy('该分类已存在');
            return
        }
        wx.setStorageSync("classifies", classifies)
        console.log(classifies)
        this.setData({
            currentClass: newClass
        })
        this.classSave()
    },
    modifyClass: function (classifies, classIndex, newClass) {
        console.log('修改分类')
        let oldClass = classifies[classIndex]
        classifies[classIndex] = newClass
        wx.setStorageSync("classifies", classifies)
        if (oldClass === this.data.currentClass) {
            this.setData({
                currentClass: newClass
            })
        }
        let arr = wx.getStorageSync("txt")
        arr.forEach(function (item) {
            if (item.classifies === oldClass) {
                item.classifies = newClass
            }
        })
        wx.setStorageSync("txt", arr)
        this.classSave()
    },
    deleteClass: function (classifies, classIndex) {
        console.log('删除分类')
        let oldClass = classifies[classIndex]
        wx.setStorageSync("classifies", classifies.slice(classIndex, classIndex + 1))
        if (oldClass === this.data.currentClass) {
            this.setData({
                currentClass: '未分类'
            })
        }
        let arr = wx.getStorageSync("txt")
        arr.forEach(function (item) {
            if (item.classifies === oldClass) {
                item.classifies = '未分类'
            }
        })
        wx.setStorageSync("txt", arr)
        this.classSave()
    },
    classifiesInit: function () {
        let classifies = wx.getStorageSync('classifies')
        console.log(classifies)
        if (classifies) {
            classifies.unshift('未分类')
            classifies.push('自定义')
            this.setData({
                classifies: classifies
            })
        } else {
            classifies = this.data.classifies
            classifies.pop()
            classifies.shift()
            wx.setStorageSync("classifies", classifies)
            console.log(wx.getStorageSync("classifies"))
        }
    }
})