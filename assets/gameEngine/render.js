export default function(board) {
  const boardToPrint = blankBoard(board.dimensions)
  board.pieces.forEach(piece => {
    boardToPrint[piece.y][piece.x] =
      piece.color === 'black'
        ? '\x1b[7m' + piece.indicator + '\x1b[0m'
        : piece.indicator
  })
  console.log(stringify(boardToPrint))
}

const blankBoard = dimensions => {
  const blankBoard = []
  for (let r = 0; r < dimensions.y; r++) {
    const currentRow = []
    for (let c = 0; c < dimensions.x; c++) {
      currentRow.push('-')
    }
    blankBoard.push(currentRow)
  }
  return blankBoard
}

const stringify = board => {
  return board.map(row => row.join(' ')).join('\n') + '\n\n'
}
