
// TODO: refactor code to be more maintanable

// global variables you can access from anywhere
let field, tds, fieldLen, mineNum;
const board = document.querySelector("#minesweeper>tbody")
const aroundPos = [[-1,-1],[0,-1],[+1,-1],[-1,0],[+1,0],[-1,+1],[0,+1],[+1,+1]];

// helper to check certain cell(x, y) has how many boms
// [x-1, y-1],[x, y-1],[x+1, y-1]
// [x-1,   y],[x,   y],[x+1,   y]
// [x-1, y+1],[x, y+1],[x+1, y+1]
const countMineAround = (f, x, y) => {
  return [f[x-1][y-1],f[x][y-1],f[x+1][y-1],f[x-1][y],f[x+1][y],
   f[x-1][y+1],f[x][y+1],f[x+1][y+1]].filter(cell => cell === 9).length
}

// # easy：9×9 board with 10 parrots
// # normal：16×16 board with 40 parrots
// # advanced：30×16 board with 99 parrots

// initialize game with click of button
// TODO: add timer
const easyButton = document.querySelector("#easy")
easyButton.addEventListener("click", (e) => {
  e.preventDefault()
  field = initializeMineSweeperField(9, 10)
  let [fieldLen, mineNum] = [9, 10]
  tds = initializeBoard(fieldLen, mineNum)
});

const intermediateButton = document.querySelector("#intermediate")
intermediateButton.addEventListener("click", (e) => {
  e.preventDefault()
  field = initializeMineSweeperField(16, 40)
  let [fieldLen, mineNum] = [16, 40]
  tds = initializeBoard(fieldLen, mineNum)
});

const hardButton = document.querySelector("#hard")
hardButton.addEventListener("click", (e) => {
  e.preventDefault()
  field = initializeMineSweeperField(25, 99)
  let [fieldLen, mineNum] = [25, 99]
  tds = initializeBoard(fieldLen, mineNum)
});

const initializeBoard = (fieldLen, mineNum) => {
  document.querySelector("#minesweeper>tbody").innerHTML = ""
  tileRender(fieldLen)

  const tds = document.querySelectorAll("#minesweeper>tbody>tr>td")
  tds.forEach(td => td.addEventListener("contextmenu", noContext))
  tds.forEach(td => td.addEventListener("contextmenu", rightClickHandler))
  tds.forEach(td => td.addEventListener("click", leftClickHandler))
  return tds

  function tileRender(num) {
    for (let i = 1; i <= num; i++) {
      const row = `<tr></tr>`
      board.insertAdjacentHTML("beforeend", row)
    }
    const rows = document.querySelectorAll("#minesweeper>tbody>tr")
    rows.forEach((row, i) => {
      for (let j = 1; j <= num; j++) {
        const td = `<td class=${"unopened"} data-row=${i+1} data-col=${j}></td>`
        row.insertAdjacentHTML("beforeend", td)
      }
    })
  }

  function leftClickHandler(e) {
    const cell = e.target
    const cellRow = +cell.dataset.row
    const cellCol = +cell.dataset.col
    openCell(field, cell, cellRow, cellCol)
  }

  function rightClickHandler(e) {
    const cell = e.target
    // if cell is already opened, do nothing
    if (cell.classList.contains("opened")) { return }
    // toggle class -> flag, question, none
    if (cell.classList.contains("flagged")) {
      cell.classList.toggle("flagged")
      cell.classList.toggle("question")
    } else if (cell.classList.contains("question")) {
      cell.classList.toggle("question")
    } else {
      cell.classList.toggle("flagged")
    }
  }

  function noContext(e) { 
    e.preventDefault() 
  }

  function openCell (f, cell, x, y) {
    cell.classList.remove("unopened")
    switch (field[x][y]) {
      case 0:
        cell.classList.add("opened")
        // check cells around, if there are no boms, open cells around as well
        if (countMineAround(f, x, y) === 0) {
          aroundPos.forEach((pos, i) => {
            // fetch HTML element with aroundCell
            const aroundCell = board.querySelector(`tr:nth-child(${x+pos[0]})>td:nth-child(${y+pos[1]})`)
            // when aroundCell is not null and not opened, open that cell too
            if(aroundCell !== null && aroundCell.classList.contains("unopened")) {openCell(field, aroundCell, +x+pos[0], +y+pos[1])}
          })
        } 
        break      
      case 1:
        cell.classList.add("opened")
        cell.classList.add("mine-neighbour-1")
        break
      case 2:
        cell.classList.add("opened")
        cell.classList.add("mine-neighbour-2")
        break
      case 3:
        cell.classList.add("opened")
        cell.classList.add("mine-neighbour-3")
        break
      case 4:
        cell.classList.add("opened")
        cell.classList.add("mine-neighbour-4")
        break
      case 5:
        cell.classList.add("opened")
        cell.classList.add("mine-neighbour-5")
        break
      case 6:
        cell.classList.add("opened")
        cell.classList.add("mine-neighbour-6")
        break
      case 7:
        cell.classList.add("opened")
        cell.classList.add("mine-neighbour-7")
        break
      case 8:
        cell.classList.add("opened")
        cell.classList.add("mine-neighbour-8")
        break
      case 9:
        cell.classList.add("mine")
        freezeField(tds)
        setTimeout(() => alert("you lose."), 300)
      default:
        break
    }
    if (checkWinningCondition(tds, fieldLen, mineNum)) {
      freezeField(tds)
      setTimeout(() => alert("you win."), 300)
    }
  }
  // when clicked cell with mine, remove event listener from all cells(freeze)
  function freezeField(tds) { 
    tds.forEach((td) => td.removeEventListener("click", leftClickHandler))
  }

  function checkWinningCondition(tds, fieldLen, mineNum) {
    let openedCell = 0
    tds.forEach((td) => {
      if (td.classList.contains("opened")) {openedCell++}
    })
    console.log("number of opened cell is:", openedCell)
    console.log(fieldLen)
    console.log(mineNum)
    console.log("winning condition is", fieldLen * fieldLen - mineNum)
    return openedCell === (fieldLen * fieldLen - mineNum)
  }
}

// generate map(array of array filled with "W" and with padding)
// padding is to avoid edge case(corner, edge) when count mines
const generateMap = (num) => [...Array(num).keys()].map(i => Array(num).fill("W"))

const plantMine = (field, fieldLen, mineNum) => {
  for (let mines = 0; mines < mineNum; mines++) {
    // row 1 -> 9, col 1 -> 9
    let flag = true
    while (flag) {
      const randRow = Math.floor(Math.random() * fieldLen) + 1
      const randCol = Math.floor(Math.random() * fieldLen) + 1
      if (field[randRow][randCol] !== 9) {
        field[randRow][randCol] = 9
        flag = false
      }
    }
  }
  return field
}

// count number of boms around each cell and set the number to cell
const fieldWithMineCount = (field, fieldLen) => {
  for (let i = 1; i <= fieldLen; i++) {
    for (let j = 1; j <= fieldLen; j++) {
      if (field[i][j] !== 9) { 
        field[i][j] = countMineAround(field, i, j)
      }
    }
  }
  return field
}

const initializeMineSweeperField = (fieldLen, mineNum) => {
  const field = fieldWithMineCount(plantMine(generateMap(fieldLen + 2), fieldLen, mineNum), fieldLen)
  console.log(field)
  console.log(field, fieldLen, mineNum)
  return field
}
