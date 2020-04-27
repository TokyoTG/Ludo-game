
const $ = require('jquery');
const lib = require('./libs')
const app = require("express")();
const express = require('express')
const http = require("http").createServer(app);
const io = require("socket.io")(http);
let clientPath=`../public`
app.use(express.static(clientPath));

const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  console.log("user connected");
  // io.emit('message',lib.generateRandom())
//  socket.join('play')
//  console.log(socket.rooms);
console.log(io.sockets.clients().connected);

  socket.on('roll', function(data){
    // socket.join('game');
    
  let v =   setInterval(function(){
    io.emit("dice", lib.generateRandom())
  },500)
  setTimeout(function () {
    clearInterval(v);

}, 2500)
   
  })
  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

http.listen(PORT, () => {
  console.log("listening on *:3000");
});

function generateRandom() {
  let arr = []
  let num1, num2;
  num1 = Math.floor(Math.random() * 6) + 1;
  num2 = Math.floor(Math.random() * 6) + 1;
  arr = [num1, num2];
  return arr;
}