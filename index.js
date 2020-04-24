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
    storePlayerObjects(playerOneObject, playerTwoObject);
  }
}

function storePlayerObjects(obj1, obj2) {
  localStorage.setItem("playerOne", JSON.stringify(obj1));
  localStorage.setItem("playerTwo", JSON.stringify(obj2));
}

function modifyObject(house, player, pieceNmuber) {
  //assigns objects to array of player objects returned by objectRetriever
  let objects = objectRetriever();
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
  storePlayerObjects(...objects);
  seedDisplay(objectRetriever());
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
          `<div class="square ${piece} ${item.house}" onclick="select()"></div>`
        );
      }
    }
  }
}

/// Selector
function select() {
  //gets all squares
  let arr;
  let squares = Array.from($(".square"));
  let cells = Array.from($(".cells"));
  for (let square of squares) {
    //removes selected class from squares with selected class
    if ($(square).hasClass("selected")) {
      $(square).removeClass("selected");
      $(square).unbind()
    }
    
  }
  for (let cell of cells) {
    //removes selected class from squares with selected class
    if ($(cell).hasClass("selected")) {
      $(cell).unbind()
      $(cell).removeClass("selected");
    }
    
  }
  let element = $(event.target);
  let res;
  // add selected class to the clicked square
  $(event.target).addClass("selected");
  arr = Array.from(event.target.classList);
  if(arr.includes('shadow')){
    res = event.target.dataset.occupier;
  }else{
      res = arr[1]+"-"+arr[2];
  }
  localStorage.setItem('selected',res);
  return res;
}
$("#count").click(function (e) {
  let selected = localStorage.getItem('selected');
   increasePieceCount(6, selected);
  select()
  localStorage.setItem('selected','');
});
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
}

function increasePieceCount(num, code) {
  //increases the piece count base on the number passed as argument
  // let code = pieceNmuber + "-" + house;
  let seedDetails = JSON.parse(localStorage.getItem(code));
  if(seedDetails.count + num <= 62){
seedDetails.count += num;
  }
  
  localStorage.setItem(code, JSON.stringify(seedDetails));
  displayOntheMove(collateCount());
}


function getClassList(element) {
  var prevOccupier;
 //check if the piece count as is enough to remove the piece from the game
  if(element.count == 62){
    return modifyObject(element.house,element.player,element.pieceNmuber)
  }
// handles the house going part of the game
  goHouse(element);
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
    filtered.forEach(data=>{
      if($(data).hasClass(element.house) && $(data).hasClass('shadow')){
        $(data).removeClass(element.house);
        $(data).removeClass('shadow');
      }
    
    })
  
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
    if (res[0].dataset.occupier) {
      prevOccupier = res[0].dataset.occupier;
      //check if the previous occupier player is the same as the current piece
      if (res[0].dataset.player == element.player) {
        res[0].innerHTML = 2;
        // res[0].dataset.occupier =  prevOccupier+  " " + element.pieceNmuber   
      } else {
        //return the piece back home if its another house 
        modifyObject(element.house, element.player, element.pieceNmuber);
        resetPieceCount(element);
        addPieceBackToHouse(getOccupiedDetails(prevOccupier));
        return resetPieceCount(getOccupiedDetails(prevOccupier));
      }
    }
    //adds the appropriate class to piece
      $(res[0]).addClass(element.house,'shadow');
      $(res[0]).addClass("shadow");
   
 
   
    res[0].setAttribute('onclick','select()');
    res[0].dataset.occupier = element.pieceNmuber + "-" + element.house;
    res[0].dataset.player = element.player;
    //removes piece from inside house
    modifyObject(element.house, element.player, element.pieceNmuber);
  }
}

function collateCount() {
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
}

function displayOntheMove(arr) {
//display all piece that are on the move
  arr.forEach((element) => {
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
  let objects = objectRetriever();
  for (let object of objects) {
    if (element.player == object.player) {
      for (let item of object.pieceDetails) {
        if (item.house == element.house) {
          item.pieceNmuber.push(element.pieceNmuber);
        }
      }
    }
  }
  storePlayerObjects(...objects);
  seedDisplay(objectRetriever());
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
    res[0].setAttribute('onclick','select()');
  
  }
}


function resetAll(){
  //resets all counts and sets all seeds to default
  objectSetter()
  storePiece()
  seedDisplay(objectRetriever());
  displayOntheMove(collateCount());
  location.reload()
}

function takePieceOut(element){
  
}