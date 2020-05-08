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
  socket.emit("user_is_connected", "play on");
  socket.on("create_room", function (data) {
    roomList.push(data); //stores the room info in an array on the server
  });

  //updates the number of player in a room
  socket.on("updateRoom", (data) => {
    // if (data.numberOfplayers > 0) {
    roomList.splice(roomList.indexOf(data), 1);
    roomList.push(data); //edits the room info when a user joins
    // }
    // else {
    //   roomList.splice(roomList.indexOf(data), 1);
    // }
    io.to(data.name).emit("a_user_joined", "stop spinner"); //stops the waiting spinner
    // console.log(roomList);
  });
  //sends out the room object
  io.emit("rooms", roomList);

  //send the user to room name
  socket.on("game", function (data) {
    socket.rooms["roomName"] = data.name;
    socket.join(data.name, function () {
      io.to(data.name).emit("user", data); //notifies that a user joins
    });
    console.log(socket.rooms);
  });

  //handles user left
  socket.on("a_user_left", function (data) {
    if (!data.numberOfPlayers) {
      roomList.splice(roomList.indexOf(data), 1);
    }
    io.to(data.name).emit("add_spinner", "spinner in action"); //notifies the user when the other user left
  });

  //handles counting emission
  socket.on("piece_counted", function (data) {
    io.to(data.name).emit("counting", "counting in action"); //shows the count to user
  });

  //handles dice rolling
  socket.on("rolldice", function (data) {
    setTimeout(function () {
      socket.emit("i_just_roll", "check my result");
    }, 500);
    // socket.emit("disableRoll", "disable"); //disables the roll dice to the user that just roll the dice
    // socket.to(data.name).emit("your_turn", "roll"); //enables the other user to roll
    socket.emit("enable_roll_select", "enable"); //enables the user to be able to select roll result
    io.to(data.name).emit("roll", lib.getRandomNumber(1, 6));
  });

  socket.on("you_are_nexts", function (data) {
    socket.to(data.name).emit("your_turn", "roll");
  });

  socket.on("ok_disable_rolls", function () {
    socket.emit("disableRoll", "disable");
  });

  //handles selection emission
  socket.on("piece_selected", function (data) {
    socket.emit("select_the_piece", data);
    // io.to(data[1].name).emit("select_the_piece", data); //shows what a user selects
  });
  socket.on("roll_selected", function (data) {
    io.to(data[1].name).emit("select_the_roll", data); //shows the roll result a user selected
  });
  socket.on("disable_selected_roll", function (data) {
    socket.emit("you_can_disable", data); //disables a roll result after counting the roll
  });

  socket.on("selection_made", function (data) {
    io.to(data[1].name).emit("emit_select", data);
  });

  //handles spinner removal
  socket.on("a_user_connected", function (data) {
    io.to(data.name).emit("on_connection", "remove spinner");
  });
  socket.on("a_user_disconnected", function (data) {
    io.to(data.name).emit("user_disconnects", "add spinner");
  });
  socket.on("disconnect", function () {
    socket.emit("connection_lost", "try refreshing");
    console.log("user disconnected");
  });
});

http.listen(PORT, () => {
  console.log("listening on *:3000");
});
