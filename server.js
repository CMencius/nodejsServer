
var app = require("express")();          // 引入express模块
var http =  require("http").Server(app); // 引入http模块
var io = require("socket.io")(http);     // 引socket.io模块
var mongoose = require("mongoose");
var count = 0;
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
}
//RB
var players = ["blue","red"];
var rbCountRoom = 1;
var rbCountPlayer = 0;


/////////////////////////
var copyPlayers = function(){
    var newArr = new Array();
    for(var i = 0 ;  i < players.length ; i++){
        newArr[i] = players[i];
    }
    return newArr;
};
//var myRoom = ["myRoom01","myRoom02"];

io.on("connect", function (socket) {
    console.log("链接成功" +":"+ count);
    //////游戏正式内容，先不考虑房间//////
    socket.emit("login",count + "");
    //把自己的状态广播给除了自己的所有人
    socket.on("changeState",function(msg){
        console.log(msg);
        socket.broadcast.emit("msgforeveryone",msg); 
    });
    
    ////////////////////////////////
    
    //////////////RedBlue///////////
    var myPlayerArr = copyPlayers();
    var roomId = "Room" + rbCountRoom;
    joinRoom(roomId);
    function joinRoom(roomId) {
        socket.join(roomId);
        socket.myRoomId = roomId;
        socket.emit("brLogin",players[rbCountPlayer]);
        rbCountPlayer++;
        if(rbCountPlayer > 1){
            rbCountPlayer = 0;
            rbCountRoom++;
        }
        console.log(roomId);
    };
    socket.on("rbGuangbo",function(msg){
        socket.broadcast.to(socket.myRoomId).emit("rbJieshou",msg);
    });
    ////////////////////////////////////////////////////
    var roomName = "myRoom";
    count++;
    roomName = roomName + Math.floor(count/4);
    socket.join(roomName);
    // console.log(socket);
    // console.log("这是io的连接log");
    // console.log(io);
    
    socket.emit("connected",'加入了房间' + roomName);
    socket.on("login",function(msg){
                var Data = JSON.parse(msg);
                var tipString = getTime() + "用户:" + Data.name + "登录";
        console.log(tipString);

        io.emit("refresh", tipString);
    });
    socket.on("zhunbei",function(msg){
        socket.zhunbei = msg;
        //console.log(socket.zhunbei,msg);
        
        //console.log(typeof socket.rooms);
        // console.log(io.sockets);
        //获得myRoom1房间里的id
        var roomsocket = io.sockets.adapter.rooms['myRoom1'];
        for(key in roomsocket.sockets){
            // console.log(roomsocket.sockets);
            
            console.log(socket.nsp.sockets[key]);
            // console.log(io.sockets.adapter.sids[key]);
        }
    });
    socket.on("guangbo",function(msg){
        //io.sockets.emit("msgforeveryone","hello,everyone"); //向全体广播
        //socket.broadcast.emit("msgforeveryone","hello,everyone"); //向除了自己以为的连接广播
        //io.sockets.in('myRoom1').emit("msgforeveryone","hello,everyone");//像房间****发送信息
        //io.sockets.socket(socketid).emit('msgforeveryone', "hello,everyone");//给指定的客户端发送消息
        //socket.broadcast.to('myRoom1').emit('msgforeveryone', "hello,everyone");//给房间1发送除了自己
        //io.sockets.in(roomName).emit("shouting",msg + roomName + icount);
        //socket.nsp.sockets[socket.io].emit("msgforeveryone","room1");//根据sockeio来获取socket实例可以直接发送
        console.log("myRoom1");
    });
    socket.on("mypos", function(msg){
        socket.broadcast.to('myRoom1').emit('refpos', msg);
    });
    socket.on("chat",function(msg){
        var data = JSON.parse(msg);
        var chatstring = data.name + " " + getTime() + ":" +  data.chatContent;
        console.log(chatstring);
        io.emit("addmsg",chatstring);
    });

    socket.on("reconnect",function(){
        cc.log("断线重连" + socket.id);
    });

    socket.on("disconnect",function(){
        console.log("断开连接" + socket.id);
        count--;
    });


});


http.listen(3000, function(){
    console.log("listening on : 3000");
});
