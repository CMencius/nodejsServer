
var app = require("express")();          // 引入express模块
var http =  require("http").Server(app); // 引入http模块
var io = require("socket.io")(http);     // 引socket.io模块
var mongoose = require("mongoose");

var onlineplayers = {};     // 在线玩家信息
var onlineCount = 0;        // 当前在线人数
var getTime = function(){
        var time = new Date();
        var H = time.getHours();
        var M = time.getMinutes();
        if(M < 10){
                M = "0" + M;
        }
        return H + ":" + M;
};

io.on("connect", function (socket) {
    console.log("链接成功");
    console.log(socket);
    console.log("这是io的连接log");
    console.log(io);
    socket.emit("connected",'我从服务端过来的');
    socket.on("login",function(msg){
                var Data = JSON.parse(msg);
                var tipString = getTime() + "用户:" + Data.name + "登录";
        console.log(tipString);

        io.emit("refresh", tipString);
    });
    socket.on("chat",function(msg){
        var data = JSON.parse(msg);
        var chatstring = data.name + " " + getTime() + ":" +  data.chatContent;
        console.log(chatstring);
        io.emit("addmsg",chatstring);
    });
});

http.listen(3000, function(){
    console.log("listening on : 3000");
});
