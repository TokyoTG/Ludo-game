function storePieceDb(data) {
  //stores an array of piece details in the localstorage
  let obj;
  for (let item of data) {
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
  return arr;
}

function reverseStorage(arr) {
  arr.forEach((element) => {
    localStorage.setItem(
      element.pieceNmuber + "-" + element.house,
      JSON.stringify(element)
    );
  });
}

function increaseDbPieceCount(num, code) {
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
  displayOntheMove(collateCount(seedDetails.house));
  displayOntheMove(collateCount(seedDetails.house));
  return true;
}

function displayDbOutsidePiece(arr) {
  //   let arr = objectRetriever();
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

function updatePlayerObjDb() {}
