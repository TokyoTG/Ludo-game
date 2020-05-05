const $ = require("jquery");
const lib = require("./libs");
const app = require("express")();
const express = require("express");
const http = require("http").createServer(app);
const io = require("socket.io")(http);
let clientPath = __dirname + `/../public`;
app.use(express.static(clientPath));

const PORT = process.env.PORT || 3000;

let roomList = [];

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("create_room", function (data) {
    roomList.push(data);
    // console.log(roomList);
  });

  //updates the number of player in a room
  socket.on("updateRoom", (data) => {
    // if (data.numberOfplayers > 0) {
    roomList.splice(roomList.indexOf(data), 1);
    roomList.push(data);
    // }
    // else {
    //   roomList.splice(roomList.indexOf(data), 1);
    // }
    io.to(data.name).emit("a_user_joined", "stop spinner");
    console.log(roomList);
  });
  //sends out the room object
  io.emit("rooms", roomList);

  socket.on("game", function (data) {
    socket.rooms["roomName"] = data.name;
    socket.join(data.name, function () {
      io.to(data.name).emit(
        "user",
        ` ${data.playerName} Joined ${data.name} room`
      );
    });
    console.log(socket.rooms);
  });

  //handles user left
  socket.on("a_user_left", function (data) {
    io.to(data.name).emit("add_spinner", "spinner in action");
  });

  //handles dice rolling
  socket.on("rolldice", function (data) {
    socket.emit("disableRoll", "disable");
    socket.to(data.name).emit("your_turn", "roll");
    io.to(data.name).emit("roll", lib.getRandomNumber(1, 6));
  });
  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

http.listen(PORT, () => {
  console.log("listening on *:3000");
});
