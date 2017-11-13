

// TODO: avoid global variables
function game() {
  
}

let lose = false
let win = false

const board = document.querySelector("#parrot_sweeper>tbody")
const aroundPos = [[-1,-1],[0,-1],[+1,-1],[-1,0],[+1,0],[-1,+1],[0,+1],[+1,+1]]

const difficulty = {
  easy: {
    fieldLen: 9,
    parrotNum: 10,
  },
  intermediate: {
    fieldLen: 16,
    parrotNum: 40,
  },
  hard: {
    fieldLen: 25,
    parrotNum: 99,
  },
}

class Game {
  constructor() {
    this.status = {
      win: false,
      lose: false,
    }
  }

  clearBoard() {
    board.innerHTML = ""
  }

  tileRender (num, size = "large") {
    const tdSize = `td-${size}`
    const tdClass = `unopened ${tdSize}`
    for (let i = 1; i <= num; i++) {
      const row = `<tr></tr>`
      board.insertAdjacentHTML("beforeend", row)
    }
    const rows = document.querySelectorAll("#parrot_sweeper>tbody>tr")
    rows.forEach((row, i) => {
      for (let j = 1; j <= num; j++) {
        const td = `<td class="${tdClass}" data-row=${i+1} data-col=${j}></td>`
        row.insertAdjacentHTML("beforeend", td)
      }
    })
  }

  initGame ({ fieldLen, parrotNum }) {
    this.status = { win: false, lose: false}
    this.clearBoard()
    this.tileRender(fieldLen)
    const field = new Field(fieldLen, parrotNum)
    field.initField()
    // const tds = document.querySelectorAll("#parrot_sweeper>tbody>tr>td")
    field.tds.forEach(td => td.addEventListener("contextmenu", noContext))
    field.tds.forEach(td => td.addEventListener("contextmenu", rightClickHandler))
    field.tds.forEach(td => td.addEventListener("click", leftClickHandler.bind(null, field)))
  }
}

class Field {
  constructor(fieldLen, parrotNum) {
    this.fieldLen = fieldLen
    this.parrotNum = parrotNum
    this.field = undefined
    this.tds = undefined
  };

  // generate map(array of array filled with "W" and with padding)
  // padding is to avoid edge case(corner, edge) when count mines
  generateMap (num) {
    return [...Array(num + 2).keys()].map(i => Array(num + 2).fill("W"))
  }

  plantParrot (field, fieldLen, parrotNum) {
    for (let parrots = 0; parrots < parrotNum; parrots++) {
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

  fieldWithParrotCount (field, fieldLen) {
    for (let i = 1; i <= fieldLen; i++) {
      for (let j = 1; j <= fieldLen; j++) {
        if (field[i][j] !== 9) { 
          field[i][j] = countParrotAround(field, i, j)
        }
      }
    }
    return field
  }

  initField () {
    const tds = document.querySelectorAll("#parrot_sweeper>tbody>tr>td")
    const fieldLen = this.fieldLen
    const parrotNum = this.parrotNum
    const map = this.generateMap(fieldLen)
    let field = this.plantParrot(map, fieldLen, parrotNum)
    field = this.fieldWithParrotCount(field, fieldLen)
    this.field = field
    this.tds = tds
  }
}

// helper to check certain cell(x, y) has how many parrots
// [x-1, y-1],[x, y-1],[x+1, y-1]
// [x-1,   y],[x,   y],[x+1,   y]
// [x-1, y+1],[x, y+1],[x+1, y+1]
const countParrotAround = (f, x, y) => {
  return [f[x-1][y-1],f[x][y-1],f[x+1][y-1],f[x-1][y],f[x+1][y],
   f[x-1][y+1],f[x][y+1],f[x+1][y+1]].filter((cell) => cell === 9).length
}

const tileRender = (num, size = "large") => {
  const tdSize = `td-${size}`
  const tdClass = `unopened ${tdSize}`
  for (let i = 1; i <= num; i++) {
    const row = `<tr></tr>`
    board.insertAdjacentHTML("beforeend", row)
  }
  const rows = document.querySelectorAll("#parrot_sweeper>tbody>tr")
  rows.forEach((row, i) => {
    for (let j = 1; j <= num; j++) {
      const td = `<td class="${tdClass}" data-row=${i+1} data-col=${j}></td>`
      row.insertAdjacentHTML("beforeend", td)
    }
  })
}

// when clicked cell with parrots, remove left click event listener from all cells(freeze)
// const freezeField = (tds) => { 
//   tds.forEach((td) => td.removeEventListener("click", leftClickHandler))
// }

const noContext = (e) => e.preventDefault()

const leftClickHandler = (field, e) => {
  if (win === true || lose === true) { return }
  const cell = e.target
  const cellRow = +cell.dataset.row
  const cellCol = +cell.dataset.col
  openCell(field, cell, cellRow, cellCol)
}

const rightClickHandler = (e) => {
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

const checkWinningCondition = (field) => {
  let openedCell = 0
  const winningCellNum = (field.fieldLen ** 2) - field.parrotNum
  field.tds.forEach((td) => {
    if (td.classList.contains("opened")) { openedCell++ }
  })
  console.log("number of opened cell is:", openedCell)
  console.log("winning condition is", winningCellNum)
  return openedCell === (winningCellNum)
}

const openCell = (field, cell, x, y) => {
  const cellValue = field.field[x][y]
  console.log(cellValue)
  cell.classList.remove("unopened")
  if (cellValue === 0) {
    cell.classList.add("opened")
    // check cells around, if there are no parrots, open cells around as well
    if (countParrotAround(field.field, x, y) === 0) {
      aroundPos.forEach((pos, i) => {
      // fetch HTML element with aroundCell
      const aroundCell = board.querySelector(`tr:nth-child(${x+pos[0]})>td:nth-child(${y+pos[1]})`)
      // when aroundCell is not null and not opened, open that cell too
      if(aroundCell !== null && aroundCell.classList.contains("unopened")) {openCell(field, aroundCell, +x+pos[0], +y+pos[1])}
      })
    }
  } else if (cellValue <= 8) {
    cell.classList.add("opened")
    cell.classList.add(`parrot-neighbour-${cellValue}`)
  } else {
    cell.classList.add("parrot")
    lose = true
    setTimeout(() => alert("you lose."), 300)
  }
  if (checkWinningCondition(field)) {
    win = true
    setTimeout(() => alert("you win."), 300)
  }
}

const clearBoard = () => board.innerHTML = ""

const initGame = ({ fieldLen, parrotNum }) => {
  win = false
  lose = false
  clearBoard()
  tileRender(fieldLen)
  const field = new Field(fieldLen, parrotNum)
  field.initField()
  // const tds = document.querySelectorAll("#parrot_sweeper>tbody>tr>td")
  field.tds.forEach(td => td.addEventListener("contextmenu", noContext))
  field.tds.forEach(td => td.addEventListener("contextmenu", rightClickHandler))
  field.tds.forEach(td => td.addEventListener("click", leftClickHandler.bind(null, field)))
}

// # easy：9×9 board with 10 parrots
// # normal：16×16 board with 40 parrots
// # advanced：30×16 board with 99 parrots

// initialize game with click of button
// TODO: add timer
const easyButton = document.querySelector("#easy")
easyButton.addEventListener("click", (e) => {
  e.preventDefault()
  field = new Field(9, 10)
  field.initField()
  initGame(difficulty.easy)
});

const intermediateButton = document.querySelector("#intermediate")
intermediateButton.addEventListener("click", (e) => {
  e.preventDefault()
  field = new Field(16, 40)
  field.initField()
  initGame(difficulty.intermediate)
});

const hardButton = document.querySelector("#hard")
hardButton.addEventListener("click", (e) => {
  e.preventDefault()
  field = new Field(25, 99)
  field.initField()
  initGame(difficulty.hard)
});
