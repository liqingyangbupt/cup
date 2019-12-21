var app = getApp();
var util = require('../../utils/util.js');


Page({
  data: {
    mhidden1: true,
    mhidden2: false, width: 0,
    height: 0,
    showMask: false,
    lastTime1:0,
    shu:false,
  }, 
   
  send: function () {
    var lastTime1 = util.formatTime(new Date());
    
    this.setData({
      mhidden1: false,
      lastTime1: lastTime1,
       shu:true
    });
    
    var db= wx.cloud.database()
    db.collection("lastTime1Send").add({
      data:{
        lastTimeSend:lastTime1
      },
      success:function(res){
        console.log(res)
      }
      
     
    })
  },
  changeMode1: function () {
    this.setData({
      mhidden1: true
    });
  },
  changeCancel: function () {
    this.setData({
      mhidden1: true
    });
  },
  changeMode2: function () {
    this.setData({
      mhidden2: true
    });
  },
  changeCancel2: function () {
    this.setData({
      mhidden2: true
    });
  },

  onLoad: function () {
    var that = this
    setInterval(function getDataFromOneNet() {//从oneNET请求我们水温的数据
      wx.request({
        url: 'http://api.heclouds.com/devices/576099049/datapoints?datastream_id=Temperature&limit=1', //设备API地址

        header: {
          'content-type': 'application/json', // http头部
          'api-key': 'BAJm0GCSLnDd8oUUpV6MO8N3328='
        },
        success: function (res) {
         // console.log(res.data.data.datastreams[0].datapoints[0].value) //可以看到返回的json格式数据
          var temper = 0
          temper = res.data.data.datastreams[0].datapoints[0].value
          that.setData({
            temper:temper
          })
        }
      })},6000 )
   
    wx.cloud.callFunction({
      name: "lastTime1Read",
      success: function (res) {
        var result = res.result.data[res.result.data.length - 1] 
        console.log(result),
        that.setData({
          lastTime1:result.lastTimeSend,
        })
        
        var lastTime1 = that.data.lastTime1
        var lastTimeTamp =  Date.parse(that.data.lastTime1);
    var newTime = util.formatTime(new Date());
    var newTimeTamp = Date.parse(newTime);
  
setInterval(function () { 
  var newTime = util.formatTime(new Date());
    var newTimeTamp = Date.parse(newTime);
  var date1 = lastTimeTamp//开始时间
  var date2 = newTimeTamp; 
  var date3 = date2 - date1; //时间差的毫秒数
  //计算出相差天
  var hours1 = Math.floor(date3/(1000*3600))
  var days = Math.floor(date3 / (24 * 3600 * 1000));
  //计舞出小时
  var leave1 = date3 % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
  var hours = Math.floor(leave1 / (3600 * 1000))
  //计算相差分钟数
  var leave2 = leave1 % (3600 * 1000)
  //计小时数后剩余的毫秒数
  var minutes = Math.floor(leave2 / (60 * 1000))
  //计相差秒教
  var leave3 = leave2 % (60 * 1000)
  //计算分钟数后剩余的毫秒数
  //setInterval (Leave3, 1000)
  var seconds = Math.round(leave3 / 1000)
   
      that.setData({
        d: days,
        h: hours,
        m: minutes,
        s: seconds,
        h1:hours1
      })
    }, 1000)

 
      }
    });
    
    //获取系统信息  
    wx.getSystemInfo({
      //获取系统信息成功，将系统窗口的宽高赋给页面的宽高  
      success: function (res) {
        that.width = res.windowWidth
        that.height = res.windowHeight
        that.setData({
          canvasWidth: res.windowWidth * 0.9 * 0.52,
          canvasHeight: res.windowWidth * 0.9 * 0.52 * 0.9819,
          rightWidth: res.windowWidth * 0.9 * 0.47
        })
      }
    })
  },
  onReady: function () {
    this.drawClock();
    // 每40ms执行一次drawClock()，
    this.interval = setInterval(this.drawClock, 40);
  },
  drawClock: function () {
    let _this = this;
    const ctx = wx.createCanvasContext('clock');
    var height = this.height;
    var width = this.width;
    // 设置文字对应的半径
    var R = this.data.canvasWidth / 5;
    ctx.save();
    // 把原点的位置移动到屏幕中间，及宽的一半，高的一半
    ctx.translate(this.data.canvasWidth / 1.83, this.data.canvasHeight / 1.83);

    // 画外框
    function drawBackground() {
      ctx.setStrokeStyle('#4BB5C3');
      // 设置线条的粗细，单位px
      ctx.setLineWidth(8);
      // 开始路径
      ctx.beginPath();
      // 运动一个圆的路径
      // arc(x,y,半径,起始位置，结束位置，false为顺时针运动)
      ctx.arc(0, 0, R * 1.7, 0, 2 * Math.PI, false);
      ctx.closePath();
      // 描出点的路径
      ctx.stroke();
    };
    // 画时钟数
    function drawHoursNum() {
      ctx.setFontSize(20);
      // 圆的起始位置是从3开始的，所以我们从3开始填充数字
      var hours = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2];
      hours.forEach(function (hour, i) {
        var rad = (2 * Math.PI / 12) * i;
        var x = R * Math.cos(rad);
        var y = R * Math.sin(rad);
        if (hour == 12) {
          ctx.fillText(hour, x - 11, y + 6);
        } else if (hour == 6) {
          ctx.fillText(hour, x - 5, y + 10);
        } else if (hour == 3) {
          ctx.fillText(hour, x, y + 8);
        } else if (hour == 9) {
          ctx.fillText(hour, x - 10, y + 8);
        }
        else {
          //ctx.fillText(hour, x - 6, y + 6);
        }
      })
    };

    // 画数字对应的点
    function drawdots() {
      for (let i = 0; i < 60; i++) {
        var rad = 2 * Math.PI / 60 * i;
        var x = (R + 15) * Math.cos(rad);
        var y = (R + 15) * Math.sin(rad);
        ctx.beginPath();
        // 每5个点一个比较大
        if (i % 5 == 0) {
          ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
        } else {
          // ctx.arc(x, y, 1, 0, 2 * Math.PI, false);
        }
        ctx.setFillStyle('black');
        ctx.fill();
      }
      ctx.closePath();
    }

    // 画时针
    function drawHour(hour, minute) {
      ctx.setStrokeStyle('#000000');
      // 保存画之前的状态
      ctx.save();
      ctx.beginPath();
      // 根据小时数确定大的偏移
      var rad = 2 * Math.PI / 12 * hour;
      // 根据分钟数确定小的偏移
      var mrad = 2 * Math.PI / 12 / 60 * minute;
      // 做旋转
      ctx.rotate(rad + mrad);
      ctx.setLineWidth(4);
      // 设置线条结束样式为圆
      ctx.setLineCap('round');
      // 时针向后延伸8个px；
      ctx.moveTo(0, 8);
      // 一开始的位置指向12点的方向，长度为R/2
      ctx.lineTo(0, -R / 2);
      ctx.stroke();
      ctx.closePath();
      // 返回画之前的状态
      ctx.restore();
    }

    // 画分针
    function drawMinute(minute, second) {
      ctx.save();
      ctx.beginPath();
      // 根据分钟数确定大的偏移
      var rad = 2 * Math.PI / 60 * minute;
      // 根据秒数确定小的偏移
      var mrad = 2 * Math.PI / 60 / 60 * second;
      ctx.rotate(rad + mrad);
      // 分针比时针细
      ctx.setLineWidth(3);
      ctx.setLineCap('round');
      ctx.moveTo(0, 10);
      // 一开始的位置指向12点的方向，长度为3 * R / 4
      ctx.lineTo(0, -3 * R / 4);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }

    // 画秒针
    function drawSecond(second, msecond) {

      ctx.save();
      ctx.beginPath();
      // 根据秒数确定大的偏移
      var rad = 2 * Math.PI / 60 * second;
      // 1000ms=1s所以这里多除个1000
      var mrad = 2 * Math.PI / 60 / 1000 * msecond;
      ctx.rotate(rad + mrad);
      ctx.setLineWidth(2);
      ctx.setStrokeStyle('#4BB5C3');
      ctx.setLineCap('round');
      ctx.moveTo(0, 12);
      ctx.lineTo(0, -R);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    }

    //画出中间那个灰色的圆
    function drawDot() {
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, 2 * Math.PI, false);
      ctx.setFillStyle('#FFF9E6');
      ctx.setLineWidth(6);
      ctx.setStrokeStyle('#000000');
      ctx.stroke();
      ctx.fill();
      ctx.closePath();
    }
    //画蒙层
    function drawMask() {
      ctx.restore();
      ctx.rect(0, 0, width * 0.5, _this.data.canvasHeight);
      ctx.setFillStyle('rgba(0,0,0,.2)')
      ctx.fill()
    }
    function Clock() {
      // 实时获取各个参数
      var now = new Date();
      var hour = now.getHours();
      var minute = now.getMinutes()
      var second = now.getSeconds();
      var msecond = now.getMilliseconds();
      if (_this.data.showMask) {
        ctx.scale(0.98, 0.98)
      }
      // 依次执行各个方法
      drawBackground();
      drawHoursNum();
      drawdots();
      drawSecond(second, msecond);
      drawHour(hour, minute);
      drawMinute(minute, second);
      drawDot();
      if (_this.data.showMask) {
        drawMask();
      }
      ctx.draw();
    }
    Clock();
  },
  goCountdown() {
    let _this = this;
    _this.setData({
      showMask: true
    })
    setTimeout(function () {
      _this.setData({
        showMask: false
      })
      wx.navigateTo({
        url: '/pages/countdown/countdown',
      })
    }, 200)

  },
  touchstart: function (e) {
    console.log(e)
    this.setData({
      showMask: true
    })
  },
  touchend: function (e) {
    this.setData({
      showMask: false
    })
  },
  
})

