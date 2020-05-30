//////PIECE MANAGER

function objectSetter(num) {
  //declare variable
  let houseNum, playerOneObject, playerTwoObject;
  //check if the number of players are more than 2
  if (num > 2) {
    houseNum = 4;
  } else {
    // create two player objects
    playerOneObject = {
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

    playerTwoObject = {
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
    //Stores the object in localstorage
    storePlayerObjects(playerOneObject, playerTwoObject);
  }
}

function storePlayerObjects(obj1, obj2) {
  // localStorage.setItem("playerOne", JSON.stringify(obj1));
  // localStorage.setItem("playerTwo", JSON.stringify(obj2));
}

function modifyObject(house, player, pieceNmuber) {
  //assigns objects to array of player objects returned by objectRetriever
  // let objects = objectRetriever();
  let updateObj = {
    id: playerRoom.id,
  };
  let arrr = [roomData.playerOne, roomData.playerTwo];
  let index;
  //loop through objects to check the player and house to modify
  for (let object of arrr) {
    if (player == object.player) {
      for (let item of object.pieceDetails) {
        if (item.house == house && item.pieceNmuber.includes(pieceNmuber)) {
          index = item.pieceNmuber.indexOf(pieceNmuber);
          item.pieceNmuber.splice(index, 1);
        }
      }
    }
  }
  // storePlayerObjects(...arr);
  updateObj.roomData = roomData;
  console.log(roomData);
  socket.emit("update_room_data", updateObj);
  // socket.emit("get_room_data", playerRoom.id);
  seedDisplay(arrr);
  // storePlayerObjects(...objects);
  // seedDisplay(objectRetriever());
}

function objectRetriever() {
  // retrieves player objects
  let p1NumOfSeeds = JSON.parse(localStorage.getItem("playerOne"));
  let p2NumOfSeeds = JSON.parse(localStorage.getItem("playerTwo"));
  return [p1NumOfSeeds, p2NumOfSeeds];
}

function seedDisplay(obj) {
  //loop through the passed array of player objects
  for (let element of obj) {
    for (let item of element.pieceDetails) {
      $(`#${item.house}`).html("");
      for (let piece of item.pieceNmuber) {
        $(`#${item.house}`).append(
          `<div class="square ${piece} ${item.house}" onclick="emitSelect(this)"></div>`
        );
      }
    }
  }
}

/// Selector
function select() {
  //gets all squares
  let arr;
  clearAllSelected();
  let res;
  // add selected class to the clicked square
  $(selectedPiece).addClass("selected");

  arr = selectedPiece.attr("class").split(" ");
  if (arr.includes("shadow")) {
    // res = selectedPiece.dataset.occupier;
    res = selectedPiece.attr("data-occupier");
  } else if (arr.includes("celldrop")) {
    res = arr[1];
  } else {
    res = arr[1] + "-" + arr[2];
  }

  // console.log(res);
  localStorage.setItem("selected", res);
  return res;
}

//Store Moving Seed Properties
function storePiece() {
  //stores an array of piece details in the localstorage
  let gameObject = objectRetriever();
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
  let arr = [];
  localStorage.setItem("outsidePiece", JSON.stringify(arr));
}

function increasePieceCount(num, code) {
  //increases the piece count base on the number passed as argument
  // let code = pieceNmuber + "-" + house;
  let seedDetails = JSON.parse(localStorage.getItem(code));
  if (seedDetails.count == 0 && num != 6) {
    return false;
  }
  if (seedDetails.count + num <= 62) {
    seedDetails.count += num;
  }

  localStorage.setItem(code, JSON.stringify(seedDetails));
  let currentCollatedCounts = collateCount(seedDetails.house);
  let countObj = {
    id: playerRoom.id,
    count: JSON.stringify(currentCollatedCounts),
  };
  console.log(countObj.count);
  socket.emit("store_piece_array", countObj);
  displayOntheMove(collateCount(seedDetails.house));
  displayOntheMove(collateCount(seedDetails.house));
  return true;
}

function getClassList(element) {
  var prevOccupier, removealIndex, occupiers;
  var dropdownArray = {};
  let arr = [];
  //check if the piece count as is enough to remove the piece from the game
  if (element.count == 62) {
    addToOutside(element);
    return modifyObject(element.house, element.player, element.pieceNmuber);
  }
  // handles the house going part of the game
  if (element.count >= 57) {
    return goHouse(element);
  }
  if (element.count >= 6) {
    //removes the traditional six from the piece count
    element.count -= 6;
    // gets the starting cell of the piece
    let houseCode = getHouseCode(element);
    let cells = Array.from($(".cells"));
    //filters the house going cells
    let filtered = cells.filter((data) => {
      if (data.dataset.index) {
        return data;
      }
    });

    //returns the starting  element of the house
    let indexCount = cells.filter((element, index) => {
      if (Array.from(element.classList).includes(houseCode)) {
        return element;
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

    if (res.length) {
      //check if the cell is occupied and stores the occupier details in variable
      let currentOccupier = element.pieceNmuber + "-" + element.house;
      if (
        res[0].dataset.occupier &&
        res[0].dataset.occupier != currentOccupier
      ) {
        prevOccupier = res[0].dataset.occupier;
        dropdownArray = storeOcuppiers(
          prevOccupier,
          currentOccupier,
          indexCount
        );

        //check if the previous occupier player is the same as the current piece
        if (res[0].dataset.player == element.player) {
          res[0].textContent = Object.keys(dropdownArray).length;
        } else {
          //return the piece back home if its another house
          let prev = getOccupiedDetails(prevOccupier);
          $(res[0]).removeClass(prev.house);
          $(res[0]).removeClass("shadow");
          modifyObject(element.house, element.player, element.pieceNmuber);
          resetPieceCount(element);
          addPieceBackToHouse(prev);
          addToOutside(element);

          return resetPieceCount(prev);
        }

        var text = prepareDropdown(dropdownArray, element, indexCount);
        let frame = `<div class="dropdown-content">
      
      ${text}
     
       </div>`;
        res[0].innerHTML = frame;
        $(res[0]).addClass("dropdown");
        //  console.log(arr)
        localStorage.setItem("occupiers", JSON.stringify(dropdownArray));
      }
      //adds the appropriate class to piece
      $(res[0]).addClass(element.house, "shadow");
      $(res[0]).addClass("shadow");

      res[0].setAttribute("onclick", "emitSelect(this)");
      res[0].dataset.occupier = element.pieceNmuber + "-" + element.house;
      res[0].dataset.player = element.player;
      //removes piece from inside house
      modifyObject(element.house, element.player, element.pieceNmuber);
    }
  }
}

function collateCount(house) {
  //returns an array of the seeds objects
  let arr = ["square-one", "square-two", "square-three", "square-four"];
  let colorArr = ["yellow", "red", "blue", "green"];
  if (house) {
    colorArr.splice(colorArr.indexOf(house), 1);
    colorArr.push(house);
  }

  let res = [];
  let obj;
  for (let j = 0; j < colorArr.length; j++) {
    for (let i = 0; i < arr.length; i++) {
      obj = JSON.parse(localStorage.getItem(arr[i] + "-" + colorArr[j]));
      res.push(obj);
    }
  }
  return res;
}

//removes all class house and shadow from cells
function cellSanitizer() {
  let arrHouse = ["green", "blue", "red", "yellow"];
  let cells = Array.from($(".cells"));
  let obj = {};
  localStorage.removeItem("occupiers");
  cells.forEach((data, index) => {
    for (let i = 0; i < arrHouse.length; i++) {
      if ($(data).hasClass(arrHouse[i]) && $(data).hasClass("shadow")) {
        $(data).removeClass("shadow");
        if (!$(data).hasClass("houses")) {
          $(data).removeClass(arrHouse[i]);
        }
      }
      if ($(data).hasClass(arrHouse[i]) && $(data).hasClass("dropdown")) {
        $(data).removeClass(arrHouse[i]);
        $(data).removeClass("dropdown");
      }
    }
    data.innerHTML = "";
    data.dataset.player = "";
    data.dataset.occupier = "";
    data.setAttribute("onclick", "");
  });
}

function displayOntheMove(arr) {
  //display all piece that are on the move
  cellSanitizer();
  let filtered = arr.filter((piece) => piece.count >= 6);
  filtered.forEach((element) => {
    getClassList(element);
  });
}

function getOccupiedDetails(str) {
  //To be converted to return an array of objects
  //gets the details of the piece that currently occupies a cell
  return JSON.parse(localStorage.getItem(str));
}

function resetPieceCount(element) {
  //resets the count of a piece to zero when the occupied piece player is different
  let code = element.pieceNmuber + "-" + element.house;
  let seedDetails = JSON.parse(localStorage.getItem(code));
  seedDetails.count = 0;
  localStorage.setItem(code, JSON.stringify(seedDetails));
  // addPieceBackToHouse(element);
}

function addPieceBackToHouse(element) {
  // adds the piece back to house when the occupied piece player is different
  // let objects = objectRetriever();
  let updateObj = {
    id: playerRoom.id,
  };
  let arrr = [roomData.playerOne, roomData.playerTwo];
  for (let object of arrr) {
    if (element.player == object.player) {
      for (let item of object.pieceDetails) {
        if (item.house == element.house) {
          item.pieceNmuber.push(element.pieceNmuber);
        }
      }
    }
  }
  updateObj.roomData = roomData;
  console.log(roomData);
  socket.emit("update_room_data", updateObj);
  // storePlayerObjects(...objects);
  seedDisplay(arrr);
}

function goHouse(element) {
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
    let currentOccupier = element.pieceNmuber + "-" + element.house;
    if (res[0].dataset.occupier && res[0].dataset.occupier != currentOccupier) {
      prevOccupier = res[0].dataset.occupier;
      dropdownArray = storeOcuppiers(
        prevOccupier,
        currentOccupier,
        element.count
      );
      var text = prepareDropdown(dropdownArray, element, element.count);
      let frame = `<div class="dropdown-content">
      
      ${text}
     
       </div>`;
      res[0].innerHTML = frame;
      $(res[0]).addClass("dropdown");
      //  console.log(arr)
      localStorage.setItem("occupiers", JSON.stringify(dropdownArray));
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
}

function resetAll() {
  //resets all counts and sets all seeds to default
  localStorage.clear();
  objectSetter();
  storePiece();
  seedDisplay(objectRetriever());
  displayOntheMove(collateCount());
  location.reload();
}

function prepareDropdown(obj, element, indexCount) {
  var text = ``;
  for (let key in obj) {
    if (obj[key].index == indexCount && obj[key].player == element.player) {
      text += `<a class="${obj[key].house} ${key} celldrop"  onclick="select()"></a>`;
    }
    if (obj[key].player == element.player) {
      // console.log(dropdownArray[key])
    }
  }
  return text;
}

function storeOcuppiers(prevOccupier, currentOccupier, indexCount) {
  let dropdownObj = {};
  let obj;
  if (localStorage.getItem("occupiers")) {
    obj = getOccupiedDetails(currentOccupier);
    dropdownObj = JSON.parse(localStorage.getItem("occupiers"));
    obj.index = indexCount;
    dropdownObj[currentOccupier] = obj;
  }
  obj = getOccupiedDetails(prevOccupier);
  obj.index = indexCount;
  dropdownObj[prevOccupier] = obj;

  // dropdownObj.index = indexCount;
  obj = getOccupiedDetails(currentOccupier);
  obj.index = indexCount;
  dropdownObj[currentOccupier] = obj;

  return dropdownObj;
}

function getHouseCode(element) {
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
  return houseCode;
}

function clearAllSelected() {
  // $("*").removeClass("selected");
  let squares = Array.from($(".square"));
  let cells = Array.from($(".cells"));
  let dropCells = Array.from($(".celldrop"));
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

  for (let cells of dropCells) {
    //removes selected class from dropdoown items with selected class
    if ($(cells).hasClass("selected")) {
      $(cells).unbind();
      $(cells).removeClass("selected");
    }
  }
}

function storeOutsidePiece(element) {
  let arr = JSON.parse(localStorage.getItem("outsidePiece"));
}

function getPieceHouse(element) {
  arr = element.attr("class").split(" ");
  if (arr.includes("celldrop")) {
    return arr[0];
  }
  if (arr.includes("shadow") && arr.length == 3) {
    return arr[1];
  }
  return arr[2];
}
function checkPlayer(house, player) {
  let p1 = ["green", "yellow"];
  let p2 = ["red", "blue"];
  if (p1.includes(house) && player === "one") {
    return true;
  }
  if (p2.includes(house) && player == "two") {
    return true;
  }
  return false;
}

function copyRoomId() {
  /* Get the text field */
  var copyText = document.getElementById("copy");
  let copyAlert = document.getElementById("toast");
  copyAlert.style.display = "block";
  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /*For mobile devices*/

  /* Copy the text inside the text field */
  document.execCommand("copy");
  setTimeout(function () {
    copyAlert.style.display = "none";
  }, 1000);
}

function forfietCount() {}

///DICE

function rollDice(arr) {
  // let arr = [];
  // ran = getRandomNumber(1, 6);
  // let ran;
  const dice = [...document.querySelectorAll(".die-list")];
  dice.forEach((die, index) => {
    toggleClasses(die);
    // ran = getRandomNumber(1, 6);
    die.dataset.roll = arr[index];
    // arr.push(ran);
  });
  return arr;
}

function toggleClasses(die) {
  die.classList.toggle("odd-roll");
  die.classList.toggle("even-roll");
}

function getRandomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  let ran1 = Math.floor(Math.random() * (max - min + 1)) + min;
  let ran2 = Math.floor(Math.random() * (max - min + 1)) + min;
  return [ran1, ran2];
}

function displayDiceResult(arr) {
  if (arr) {
    const rolls = [...document.querySelectorAll(".rolls")];
    rolls.forEach((roll, index) => {
      roll.textContent = arr[index];
    });
  }
}
function clearSelectedRoll() {
  let cells = Array.from($(".rolls"));
  cells.forEach((cell) => {
    $(cell).removeClass("selected");
  });
}

function selectRoll() {
  clearSelectedRoll();
  let selected = selectedRoll;
  let selectedCount;
  $(selected).addClass("selected");
  selectedCount = +selected.text();
  // console.log(selected);
  if (selectedCount) {
    return selectedCount;
  }
}

function addToOutside(element) {
  let num = element.pieceNmuber + "-" + element.house;
  let updateObj = {
    id: playerRoom.id,
  };
  let arrr = [roomData.playerOne, roomData.playerTwo];
  // let objects = objectRetriever();
  for (let object of arrr) {
    if (element.player == object.player) {
      object.outPiece[num] = element.house;
    }
  }
  updateObj.roomData = roomData;
  console.log(roomData);
  socket.emit("update_room_data", updateObj);
  storePlayerObjects(...arrr);
  displayDbOutsidePiece(arrr);
  // displayOutsidePiece();
}

function displayOutsidePiece() {
  let arr = objectRetriever();
  let playerOne = document.getElementById("playerOne");
  let playerOneText = "";
  let playerTwoText = "";
  let playerTwo = document.getElementById("playerTwo");
  for (let item of arr) {
    if ("one" == item.player) {
      for (let key in item.outPiece) {
        playerOneText += `<p class=" out ${item.outPiece[key]}"></p>`;
      }
    }
    if ("two" == item.player) {
      for (let key in item.outPiece) {
        playerTwoText += `<p class=" out ${item.outPiece[key]}"></p>`;
      }
    }
  }
  playerOne.innerHTML = playerOneText;
  playerTwo.innerHTML = playerTwoText;
}

function countPiece() {
  event.preventDefault();
  let selected = localStorage.getItem("selected");
  console.log(selected);
  if (selected && selectedCount) {
    console.log("counting happened here");
    let pieceCount = increasePieceCount(selectedCount, selected);
    clearSelectedRoll();
    clearAllSelected();
    if (pieceCount) {
      selectedCount = 0;
      selectedRoll.text("0");
      emitDisableRollSelect();
      // selectedRoll.attr("onclick", "");
    }
    localStorage.setItem("selected", "");
  }
}

function rolls() {
  // selectedRoll = event.target;
  selectedCount = selectRoll();
}

//multi-player

//strips the roll button of event
function disableRoll() {
  let rollBtn = document.getElementById("roll-button");
  rollBtn.setAttribute("onclick", "");
}

//handles enabling user turn
function is_your_turn() {
  let rollBtn = document.getElementById("roll-button");
  // let forfietBtn = document.getElementById("reset-count");
  let countBtn = document.getElementById("count");
  // forfietBtn.setAttribute("onclick", "forfietCount()");
  countBtn.setAttribute("onclick", "emitCount()");
  rollBtn.setAttribute("onclick", "rollsDice()");
  let rolls = [...document.getElementsByClassName("rolls")];
  rolls.forEach((item) => {
    item.setAttribute("onclick", "");
  });
  let forfietBtn = document.getElementById("reset-count");
  forfietBtn.setAttribute("onclick", "");
  displayPlayerTurn();
}

function emitCount() {
  socket.emit("piece_counted", playerRoom);
}

function emitSelect(obj) {
  selectedPiece = [...event.target.classList].join(".");
  socket.emit("piece_selected", getSelectedPiece(selectedPiece));
  // console.log(obj);
  // console.log(selectedPiece);
}
// function disableCount() {
//   let countBtn = document.getElementById("count");
//   countBtn.setAttribute("onclick", "");
// }

function getSelectedPiece(obj) {
  return [obj, playerRoom];
}

function emitSelectedRoll() {
  let selectedRoll = [...event.target.classList].join(".");
  socket.emit("roll_selected", getSelectedPiece(selectedRoll));
}

function emitDisableRollSelect() {
  socket.emit("disable_selected_roll", selectedRoll);
}

function rollAgain(num1, num2) {
  return num1 == 6 && num2 == 6;
}

function forfietCount() {
  socket.emit("reset_roll_results", playerRoom);
  // console.log("forfiet");
}

// function verify_forfiet() {
//    let rolls = [...document.getElementsByClassName("rolls")];
//    rolls.forEach((item) => {
//      item.setAttribute("onclick", "");
//    });
// }

function displayPlayerTurn() {
  let copyAlert = document.getElementById("toast2");
  copyAlert.style.display = "block";
  setTimeout(function () {
    copyAlert.style.display = "none";
  }, 1000);
}
