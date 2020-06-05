module.exports = {
  generateRandom() {
    let arr = [];
    let num1, num2;
    num1 = Math.floor(Math.random() * 6) + 1;
    num2 = Math.floor(Math.random() * 6) + 1;
    arr = [num1, num2];
    return arr;
  },

  objectSetter(num) {
    //declare variable
    let houseNum, playerOneObject, playerTwoObject;
    //check if the number of players are more than 2
    if (num > 2) {
      houseNum = 4;
    } else {
      // create two player objects
      playerOneObject = {
        player: "one",
        pieceDetails: [
          {
            house: "green",
            pieceNmuber: [
              "square-one",
              "square-two",
              "square-three",
              "square-four",
            ],
          },
          {
            house: "yellow",
            pieceNmuber: [
              "square-one",
              "square-two",
              "square-three",
              "square-four",
            ],
          },
        ],
      };

      playerTwoObject = {
        player: "two",
        pieceDetails: [
          {
            house: "red",
            pieceNmuber: [
              "square-one",
              "square-two",
              "square-three",
              "square-four",
            ],
          },
          {
            house: "blue",
            pieceNmuber: [
              "square-one",
              "square-two",
              "square-three",
              "square-four",
            ],
          },
        ],
      };

      //Stores the object in localstorage
      this.storePlayerObjects(playerOneObject, playerTwoObject);
    }
  },

  storePlayerObjects(obj1, obj2) {
    localStorage.setItem("playerOne", JSON.stringify(obj1));
    localStorage.setItem("playerTwo", JSON.stringify(obj2));
  },

  modifyObject(house, player, pieceNmuber) {
    //assigns objects to array of player objects returned by objectRetriever
    let objects = this.objectRetriever();
    let index;
    //loop through objects to check the player and house to modify
    for (let object of objects) {
      if (player == object.player) {
        for (let item of object.pieceDetails) {
          if (item.house == house && item.pieceNmuber.includes(pieceNmuber)) {
            index = item.pieceNmuber.indexOf(pieceNmuber);
            item.pieceNmuber.splice(index, 1);
          }
        }
      }
    }
    this.storePlayerObjects(...objects);
    this.seedDisplay(this.objectRetriever());
  },

  objectRetriever() {
    // retrieves player objects
    let p1NumOfSeeds = JSON.parse(localStorage.getItem("playerOne"));
    let p2NumOfSeeds = JSON.parse(localStorage.getItem("playerTwo"));
    return [p1NumOfSeeds, p2NumOfSeeds];
  },

  seedDisplay(obj) {
    //loop through the passed array of player objects
    for (let element of obj) {
      for (let item of element.pieceDetails) {
        $(`#${item.house}`).html("");
        for (let piece of item.pieceNmuber) {
          $(`#${item.house}`).append(
            `<div class="square ${piece} ${item.house}" onclick="select()"></div>`
          );
        }
      }
    }
  },

  lookUpRandomNumber(num1, num2) {
    let arr = [];
    let diceObject = {
      six: 6,
      five: 5,
      four: 4,
      three: 3,
      two: 2,
      one: 1,
    };
    for (let key in diceObject) {
      if (diceObject[key] === num1) {
        arr.push(key);
      }
      if (diceObject[key] == num2) {
        arr.push(key);
      }
    }

    return arr;
  },
  /// Selector
  select() {
    //gets all squares
    let arr;
    let squares = Array.from($(".square"));
    let cells = Array.from($(".cells"));
    for (let square of squares) {
      //removes selected class from squares with selected class
      if ($(square).hasClass("selected")) {
        $(square).removeClass("selected");
        $(square).unbind();
      }
    }
    for (let cell of cells) {
      //removes selected class from squares with selected class
      if ($(cell).hasClass("selected")) {
        $(cell).unbind();
        $(cell).removeClass("selected");
      }
    }
    let element = $(event.target);
    let res;
    // add selected class to the clicked square
    $(event.target).addClass("selected");
    arr = Array.from(event.target.classList);
    if (arr.includes("shadow")) {
      res = event.target.dataset.occupier;
    } else {
      res = arr[1] + "-" + arr[2];
    }
    localStorage.setItem("selected", res);
    return res;
  },

  //Store Moving Seed Properties
  storePiece() {
    //stores an array of piece details in the localstorage
    let gameObject = this.objectRetriever();
    let obj;
    for (let item of gameObject) {
      j = 0;
      for (let element of item.pieceDetails) {
        for (let piece of element.pieceNmuber) {
          obj = {
            pieceNmuber: piece,
            count: 0,
            house: element.house,
            player: item.player,
          };
          localStorage.setItem(piece + "-" + obj.house, JSON.stringify(obj));
        }
      }
    }
  },

  getClassList(element) {
    var prevOccupier;
    //check if the piece count as is enough to remove the piece from the game
    if (element.count == 62) {
      return this.modifyObject(
        element.house,
        element.player,
        element.pieceNmuber
      );
    }
    // handles the house going part of the game
    this.goHouse(element);
    if (element.count >= 6) {
      //removes the traditional six from the piece count
      element.count -= 6;
      let houseCode;
      // gets the starting cell of the piece
      switch (element.house) {
        case "green":
          houseCode = "g-starts";
          break;
        case "red":
          houseCode = "r-starts";
          break;
        case "blue":
          houseCode = "b-starts";
          break;
        case "yellow":
          houseCode = "y-starts";
          break;
      }

      let arr = ["green", "blue", "red", "yellow"];
      let cells = Array.from($(".cells"));
      //filters the house going cells
      let filtered = cells.filter((element) => {
        if (element.dataset.index) {
          return element;
        }
      });

      //returns the starting  element of the house
      let indexCount = cells.filter((element, index) => {
        if (Array.from(element.classList).includes(houseCode)) {
          return element;
        }
      });
      filtered.forEach((data) => {
        if ($(data).hasClass(element.house) && $(data).hasClass("shadow")) {
          $(data).removeClass(element.house);
          $(data).removeClass("shadow");
        }
      });

      // calculates the index the seed is going to be.
      indexCount = element.count + +indexCount[0].dataset.index;
      let res = filtered.filter((cell) => {
        //clears all seed classes
        //maintains the indexCount oof the seed from exceeding the available index
        if (indexCount >= filtered.length) {
          indexCount -= filtered.length;
        }
        //returns the element at the piece index

        return +cell.dataset.index == indexCount;
      });
      //check if the cell is occupied and stores the occupier details in variable
      if (
        res[0].dataset.occupier &&
        res[0].dataset.occupier != element.pieceNmuber + "-" + element.house
      ) {
        // if(res[0].hasClass(element.house)){
        //   $(res[0]).addClass(element.house);
        //   $(res[0]).addClass("shadow");
        // }
        prevOccupier = res[0].dataset.occupier;
        //check if the previous occupier player is the same as the current piece
        if (res[0].dataset.player == element.player) {
          res[0].innerHTML = 2;
          // res[0].dataset.occupier =  prevOccupier+  " " + element.pieceNmuber
        } else {
          //return the piece back home if its another house
          this.modifyObject(element.house, element.player, element.pieceNmuber);
          this.resetPieceCount(element);
          this.addPieceBackToHouse(this.getOccupiedDetails(prevOccupier));
          return this.resetPieceCount(this.getOccupiedDetails(prevOccupier));
        }
      }
      //adds the appropriate class to piece
      $(res[0]).addClass(element.house, "shadow");
      $(res[0]).addClass("shadow");

      res[0].setAttribute("onclick", "select()");
      res[0].dataset.occupier = element.pieceNmuber + "-" + element.house;
      res[0].dataset.player = element.player;
      //removes piece from inside house
      this.modifyObject(element.house, element.player, element.pieceNmuber);
    }
  },

  collateCount() {
    //returns an array of the seeds objects
    let arr = ["square-one", "square-two", "square-three", "square-four"];
    let colorArr = ["green", "red", "blue", "yellow"];
    let res = [];
    let obj;
    for (let j = 0; j < colorArr.length; j++) {
      for (let i = 0; i < arr.length; i++) {
        obj = JSON.parse(localStorage.getItem(arr[i] + "-" + colorArr[j]));
        res.push(obj);
      }
    }
    return res;
  },

  displayOntheMove(arr) {
    //display all piece that are on the move
    arr.forEach((element) => {
      this.getClassList(element);
    });
  },

  increasePieceCount(num, code) {
    //increases the piece count base on the number passed as argument
    // let code = pieceNmuber + "-" + house;
    let seedDetails = JSON.parse(localStorage.getItem(code));
    if (seedDetails.count + num <= 62) {
      seedDetails.count += num;
    }

    localStorage.setItem(code, JSON.stringify(seedDetails));
    this.displayOntheMove(this.collateCount());
  },

  getOccupiedDetails(str) {
    //To be converted to return an array of objects
    //gets the details of the piece that currently occupies a cell
    return JSON.parse(localStorage.getItem(str));
  },

  resetPieceCount(element) {
    //resets the count of a piece to zero when the occupied piece player is different
    let code = element.pieceNmuber + "-" + element.house;
    let seedDetails = JSON.parse(localStorage.getItem(code));
    seedDetails.count = 0;
    localStorage.setItem(code, JSON.stringify(seedDetails));
    // addPieceBackToHouse(element);
  },

  addPieceBackToHouse(element) {
    // adds the piece back to house when the occupied piece player is different
    let objects = this.objectRetriever();
    for (let object of objects) {
      if (element.player == object.player) {
        for (let item of object.pieceDetails) {
          if (item.house == element.house) {
            item.pieceNmuber.push(element.pieceNmuber);
          }
        }
      }
    }
    this.storePlayerObjects(...objects);
    this.seedDisplay(this.objectRetriever());
  },

  goHouse(element) {
    //handles the house going count;
    if (element.count >= 57) {
      element.count -= 57;

      let houseCode;
      switch (element.house) {
        case "green":
          houseCode = "gindex";
          break;
        case "red":
          houseCode = "rindex";
          break;
        case "blue":
          houseCode = "bindex";
          break;
        case "yellow":
          houseCode = "yindex";
          break;
      }
      let cells = Array.from($(".cells"));
      let filtered = cells.filter((element) => {
        if (element.dataset[houseCode]) {
          return element;
        }
      });
      let res = filtered.filter((cell) => {
        if ($(cell).hasClass(element.house)) {
          $(cell).removeClass("shadow");
        }
        return +cell.dataset[houseCode] == element.count;
      });
      if (res[0].dataset.occupiedHouse) {
        if (res[0].dataset.occupiedHouse == element.house) {
          res[0].innerHTML = 2;
        }
      }
      if ($(res[0]).hasClass(element.house)) {
        $(res[0]).removeClass("shadow");
        $(res[0]).removeClass(element.house);
      }
      $(res[0]).addClass("shadow");
      $(res[0]).addClass(element.house);
      res[0].dataset.occupier = element.pieceNmuber + "-" + element.house;
      res[0].dataset.occupiedHouse = element.house;
      res[0].setAttribute("onclick", "select()");
    }
  },

  resetAll() {
    //resets all counts and sets all seeds to default
    this.objectSetter();
    this.storePiece();
    this.seedDisplay(this.objectRetriever());
    this.displayOntheMove(this.collateCount());
    location.reload();
  },

  removeSpinnerClass() {
    setTimeout(function () {
      $(".cube1").removeClass("cube1");
      $(".cube2").removeClass("cube2");
    }, 2000);
  },

  displayNumbers(key1, key2) {
    $("#cont").text("");
    $("#cont").append(` <i class="fas fa-dice-${key1} cube1"></i>
        <i class="fas fa-dice-${key2} cube2"></i>`);
  },
  rollDice() {
    let display = this.displayNumbers(
      ...this.lookUpRandomNumber(...this.generateRandom())
    );
    var v = setInterval(function () {
      display();
    }, 500);
    setTimeout(function () {
      clearInterval(v);
    }, 2000);

    this.removeSpinnerClass();
    console.log("rolled");
  },
  getRandomNumber(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let ran1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let ran2 = Math.floor(Math.random() * (max - min + 1)) + min;
    return [ran1, ran2];
  },
  roomData: function () {
    let playerOneObject = {
      player: "one",
      outPiece: {},
      pieceDetails: [
        {
          house: "green",
          pieceNmuber: [
            "square-one",
            "square-two",
            "square-three",
            "square-four",
          ],
        },
        {
          house: "yellow",
          pieceNmuber: [
            "square-one",
            "square-two",
            "square-three",
            "square-four",
          ],
        },
      ],
    };

    let playerTwoObject = {
      player: "two",
      outPiece: {},
      pieceDetails: [
        {
          house: "red",
          pieceNmuber: [
            "square-one",
            "square-two",
            "square-three",
            "square-four",
          ],
        },
        {
          house: "blue",
          pieceNmuber: [
            "square-one",
            "square-two",
            "square-three",
            "square-four",
          ],
        },
      ],
    };
    let obj = {
      playerOne: playerOneObject,
      playerTwo: playerTwoObject,
    };
    return obj;
  },
  getallrooms(connection) {
    var res;
    query = `SELECT name,playerOne,playerTwo,room_ID FROM rooms`;
    connection.query(query, function (err, result) {
      if (err) {
        console.log(err);
        //throw err;
      }
      if (result.length) {
        dbrooms = result;
        return res;
      }
    });

    // io.emit("all_rooms", dbrooms);
  },
  renderHTML(path, response, fs) {
    fs.readFile(path, null, function (error, data) {
      if (error) {
        response.writeHead(404);
        response.write("File not found!");
      } else {
        response.write(data);
      }
      response.end();
    });
  },
  handleRequest(request, response, url, fs) {
    response.writeHead(200, { "Content-Type": "text/html" });

    var path = url.parse(request.url).pathname;
    switch (path) {
      case "/":
        this.renderHTML("../public/index.html", response, fs);
        break;
      case "/join-game":
        this.renderHTML("../public/html/join-game.html", response, fs);
        break;
      case "/game":
        this.renderHTML("../public/html/game.html", response, fs);
        break;
      case "/create-game":
        this.renderHTML("../public/html/create-game.html", response, fs);
        break;
      default:
        response.writeHead(404);
        response.write("Route not defined");
        response.end();
    }
  },
};
