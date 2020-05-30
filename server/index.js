const lib = require("./libs");
const app = require("express")();
const express = require("express");
const store = lib.roomData;
const http = require("http").createServer(app);
const io = require("socket.io")(http);
let clientPath = __dirname + `/../public`;
app.use(express.static(clientPath));

var mysql = require("mysql");
var connection = mysql.createConnection({
  // host: "localhost",
  // user: "Tokyo",
  // password: "1234",
  // database: "ludo_db",
  host: "us-cdbr-east-06.cleardb.net",
  user: "bbd595c0cfc9d8",
  password: "471a0423",
  database: "heroku_0ac0f4b1f9afa39",
});

connection.connect();
// let query = `CREATE TABLE rooms (
//  id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
//  room_ID VARCHAR(30) NOT NULL,
//  name varchar(30),
//  creator VARCHAR(30) NOT NULL,
//  playerOne varchar(30),
//  playerTwo varchar(30) default null,
//  counts longtext default null,
//  games longtext default null,
//  connected int(6)
//)`;
// connection.query(query, function (err, result) {
//   if (err) {
//     throw err;
//   }
//   console.log("Table created");
// });
let dbrooms = [];

const PORT = process.env.PORT || 5000;

//main game
let roomList = [];
io.on("connection", (socket) => {
  let socketRoom;
  let query = `SELECT name,playerOne,playerTwo,room_ID,connected FROM rooms`;
  connection.query(query, function (err, result) {
    if (err) {
      throw err;
    }
    if (result.length) {
      dbrooms = result;
    }
  });

  socket.on("update_room_data", (data) => {
    let query = `UPDATE rooms SET games ='${JSON.stringify(
      data.roomData
    )}' WHERE room_ID= '${data.id}'`;
    connection.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      socket.emit("get_room_data", data.id);
      // if (result.changedRows) {
      //   socket.emit("validated", true);
      // } else {
      //   socket.emit("validation_error", "incorrect room id");
      // }
    });
  });

  //gets the room data
  socket.on("get_room_data", (data) => {
    let query = `SELECT games,counts FROM rooms WHERE room_ID='${data}'`;
    connection.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      if (result.length) {
        socket.emit("send_room_data", result[0].games);
      }
    });
  });

  socket.on("first_room_data", (data) => {
    let query = `SELECT games,counts FROM rooms WHERE room_ID='${data}'`;
    connection.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      if (result) {
        console.log(result);
        if (result[0].counts != null) {
          socket.emit("send_room_data", result[0]);
        } else {
          socket.emit("sent_room_data", result[0].games);
        }
      }
    });
  });
  io.emit("all_rooms", dbrooms);
  // socket.on("connect", () => {
  //   io.emit("user_is_connected", "play on");
  // });
  socket.on("create_room", (data) => {
    let roomData = JSON.stringify(store());
    roomList.push(data); //stores the room info in an array on the server
    let query = `
    INSERT INTO rooms(room_ID, creator, playerOne,games,name,connected) 
    VALUES ('${data.id}','${data.playerName}','${data.playerName}','${roomData}','${data.name}',1)`;
    connection.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      console.log("Table created");
    });
    query = `SELECT name,playerOne,playerTwo,room_ID FROM rooms`;
    connection.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      if (result.length) {
        dbrooms = result;
      }
    });
    io.emit("all_rooms", dbrooms);
  });

  socket.on("socket_connected", (data) => {
    let query = `SELECT connected FROM rooms WHERE room_ID='${data.id}'`;
    connection.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      if (result.length) {
        let numOfConn = result[0].connected;
        if (numOfConn > 1) {
          io.to(data.name).emit("user_is_connected", "play on");
        }
      }
    });
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
    // io.to(data.name).emit("user_is_connected", "play on");
    io.to(data.name).emit("a_user_joined", "stop spinner"); //stops the waiting spinner
    // console.log(roomList);
    //sql room data update
    let query = `UPDATE rooms SET playerTwo = '${data.playerName}', connected = connected + 1 WHERE room_ID= '${data.id}'`;
    connection.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      if (result.changedRows) {
        socket.emit("validated", true);
      } else {
        socket.emit("validation_error", "incorrect room id");
      }
    });
  });
  //sends out the room object
  io.emit("rooms", roomList);

  // updates the roomobj on localstorage
  socket.on("update_local_roomObj", (data) => {
    io.to(data.name).emit("update_local", data);
  });

  //stores the roomdata on db
  socket.on("store_piece_array", (data) => {
    let query = `UPDATE rooms SET counts= '${data.count}' WHERE room_ID= '${data.id}'`;
    connection.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      // console.log(data.count);
      // if (result.changedRows) {
      //   socket.emit("validated", true);
      // } else {
      //   socket.emit("validation_error", "incorrect room id");
      // }
    });
  });

  //send the user to room name
  socket.on("game", (data) => {
    socket.rooms["roomName"] = data.name;
    socketRoom = data.name;
    socket.join(data.name, () => {
      io.to(data.name).emit("user", data); //notifies that a user joins
    });
    console.log(socket.rooms);
  });

  //handles user left
  socket.on("a_user_left", (data) => {
    if (!data.numberOfPlayers) {
      roomList.splice(roomList.indexOf(data), 1);
    }
    let query = `UPDATE rooms SET connected = connected - 1 WHERE room_ID= '${data.id}'`;
    connection.query(query, function (err, result) {
      if (err) {
        throw err;
      }
      // if (result.changedRows) {
      //   socket.emit("validated", true);
      // } else {
      //   socket.emit("validation_error", "incorrect room id");
      // }
    });
    io.to(data.name).emit("add_spinner", "spinner in action"); //notifies the user when the other user left
  });

  //handles counting emission
  socket.on("piece_counted", (data) => {
    io.to(data.name).emit("counting", "counting in action"); //shows the count to user
  });

  //handles dice rolling
  socket.on("rolldice", (data) => {
    setTimeout(function () {
      socket.emit("i_just_roll", "check my result");
    }, 500);
    // socket.emit("disableRoll", "disable"); //disables the roll dice to the user that just roll the dice
    // socket.to(data.name).emit("your_turn", "roll"); //enables the other user to roll
    socket.emit("enable_roll_select", "enable"); //enables the user to be able to select roll result
    io.to(data.name).emit("roll", lib.getRandomNumber(1, 6));
  });

  socket.on("you_are_nexts", (data) => {
    socket.emit("your_turn", "roll");
    // socket.to(data.name).emit("your_turn", "roll");
  });

  socket.on("reset_roll_results", (data) => {
    socket.to(data.name).emit("send_turn", "the other user can roll");
    io.to(data.name).emit("reset_rolls", "reset all roll results");
  });

  socket.on("ok_disable_rolls", (data) => {
    io.to(data.name).emit("disableRoll", "disable");
  });

  //handles selection emission
  socket.on("piece_selected", (data) => {
    socket.emit("select_the_piece", data);
    // io.to(data[1].name).emit("select_the_piece", data); //shows what a user selects
  });
  socket.on("roll_selected", (data) => {
    io.to(data[1].name).emit("select_the_roll", data); //shows the roll result a user selected
  });
  socket.on("disable_selected_roll", (data) => {
    socket.emit("you_can_disable", data); //disables a roll result after counting the roll
  });

  socket.on("selection_made", (data) => {
    io.to(data[1].name).emit("emit_select", data);
  });

  //handles spinner removal
  socket.on("all_user_connected", (data) => {
    io.to(data.name).emit("on_connection", "remove spinner");
  });
  socket.on("a_user_disconnected", (data) => {
    io.to(data.name).emit("user_disconnects", "add spinner");
  });
  socket.on("disconnect", () => {
    io.to(socketRoom).emit("connection_lost", "try refreshing");
    // socket.rooms;
    // console.log(socketRoom);
  });
});

http.listen(PORT, () => {
  console.log("listening on *:5000");
});
