

// TODO: avoid global variables
// let field, tds, fieldLen, mineNum;

function game() {
  
}

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

class Field {
  constructor(fieldLen, parrotNum) {
    this.fieldLen = fieldLen
    this.parrotNum = parrotNum
    this.field = undefined
  };

  // generate map(array of array filled with "W" and with padding)
  // padding is to avoid edge case(corner, edge) when count mines
  generateMap (num) {
    return [...Array(num).keys()].map(i => Array(num).fill("W"))
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
    const fieldLen = this.fieldLen
    const parrotNum = this.parrotNum
    const field = fieldWithParrotCount(plantParrot(generateMap(fieldLen + 2), fieldLen, parrotNum), fieldLen)
    this.field = field
  }
}

// helper to check certain cell(x, y) has how many boms
// [x-1, y-1],[x, y-1],[x+1, y-1]
// [x-1,   y],[x,   y],[x+1,   y]
// [x-1, y+1],[x, y+1],[x+1, y+1]
const countParrotAround = (f, x, y) => {
  return [f[x-1][y-1],f[x][y-1],f[x+1][y-1],f[x-1][y],f[x+1][y],
   f[x-1][y+1],f[x][y+1],f[x+1][y+1]].filter((cell) => cell === 9).length
}

const tileRender = (num) => {
  for (let i = 1; i <= num; i++) {
    const row = `<tr></tr>`
    board.insertAdjacentHTML("beforeend", row)
  }
  const rows = document.querySelectorAll("#parrot_sweeper>tbody>tr")
  rows.forEach((row, i) => {
    for (let j = 1; j <= num; j++) {
      const td = `<td class=${"unopened"} data-row=${i+1} data-col=${j}></td>`
      row.insertAdjacentHTML("beforeend", td)
    }
  })
}

// when clicked cell with mine, remove event listener from all cells(freeze)
const freezeField = (tds) => { 
  tds.forEach((td) => td.removeEventListener("click", leftClickHandler))
}

const noContext = (e) => e.preventDefault()

const leftClickHandler = (field, e) => {
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

const checkWinningCondition = (tds, fieldLen, parrotNum) => {
  let openedCell = 0
  tds.forEach((td) => {
    if (td.classList.contains("opened")) { openedCell++ }
  })
  console.log("number of opened cell is:", openedCell)
  console.log(fieldLen)
  console.log(parrotNum)
  console.log("winning condition is", fieldLen * fieldLen - parrotNum)
  return openedCell === (fieldLen * fieldLen - parrotNum)
}

const openCell = (field, cell, x, y) => {
  console.log(field)
  cell.classList.remove("unopened")
  switch (field.field[x][y]) {
    case 0:
      cell.classList.add("opened")
      // check cells around, if there are no boms, open cells around as well
      if (countParrotAround(field.field, x, y) === 0) {
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
      cell.classList.add("parrot-neighbour-1")
      break
    case 2:
      cell.classList.add("opened")
      cell.classList.add("parrot-neighbour-2")
      break
    case 3:
      cell.classList.add("opened")
      cell.classList.add("parrot-neighbour-3")
      break
    case 4:
      cell.classList.add("opened")
      cell.classList.add("parrot-neighbour-4")
      break
    case 5:
      cell.classList.add("opened")
      cell.classList.add("parrot-neighbour-5")
      break
    case 6:
      cell.classList.add("opened")
      cell.classList.add("parrot-neighbour-6")
      break
    case 7:
      cell.classList.add("opened")
      cell.classList.add("parrot-neighbour-7")
      break
    case 8:
      cell.classList.add("opened")
      cell.classList.add("parrot-neighbour-8")
      break
    case 9:
      cell.classList.add("parrot")
      freezeField(tds)
      setTimeout(() => alert("you lose."), 300)
    default:
      break
  }
  if (checkWinningCondition(tds, field.fieldLen, field.parrotNum)) {
    freezeField(tds)
    setTimeout(() => alert("you win."), 300)
  }
}

const clearBoard = () => document.querySelector("#parrot_sweeper>tbody").innerHTML = ""

const initGame = (fieldLen, parrotNum) => {
  clearBoard()
  tileRender(fieldLen)
  const field = new Field(fieldLen, parrotNum)
  field.initField()
  const tds = document.querySelectorAll("#parrot_sweeper>tbody>tr>td")
  tds.forEach(td => td.addEventListener("contextmenu", noContext))
  tds.forEach(td => td.addEventListener("contextmenu", rightClickHandler))
  tds.forEach(td => td.addEventListener("click", leftClickHandler.bind(null, field)))
  return tds
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
  let [fieldLen, parrotNum] = [9, 10]
  tds = initGame(fieldLen, parrotNum)
});

const intermediateButton = document.querySelector("#intermediate")
intermediateButton.addEventListener("click", (e) => {
  e.preventDefault()
  field = new Field(16, 40)
  field.initField()
  let [fieldLen, parrotNum] = [16, 40]
  tds = initGame(fieldLen, parrotNum)
});

const hardButton = document.querySelector("#hard")
hardButton.addEventListener("click", (e) => {
  e.preventDefault()
  field = new Field(25, 99)
  field.initField()
  let [fieldLen, parrotNum] = [25, 99]
  tds = initGame(fieldLen, parrotNum)
});


// generate map(array of array filled with "W" and with padding)
// padding is to avoid edge case(corner, edge) when count mines
const generateMap = (num) => [...Array(num).keys()].map(i => Array(num).fill("W"))

const plantParrot = (field, fieldLen, parrotNum) => {
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

// count number of boms around each cell and set the number to cell
const fieldWithParrotCount = (field, fieldLen) => {
  for (let i = 1; i <= fieldLen; i++) {
    for (let j = 1; j <= fieldLen; j++) {
      if (field[i][j] !== 9) { 
        field[i][j] = countParrotAround(field, i, j)
      }
    }
  }
  return field
}

const initField = (fieldLen, parrotNum) => {
  const field = fieldWithParrotCount(plantParrot(generateMap(fieldLen + 2), fieldLen, parrotNum), fieldLen)
  return field
}


