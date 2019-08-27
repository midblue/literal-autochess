import gameManager from './gameManager'
import generatePieces from './generatePieces'

export default function(_pieces, _dimensions) {
  const pieces =
    _pieces ||
    generatePieces([
      { type: 'rook', x: 0, y: 0 },
      { type: 'rook', x: 7, y: 0 },
      { type: 'bishop', x: 1, y: 0 },
      { type: 'bishop', x: 6, y: 0 },
      { type: 'knight', x: 2, y: 0 },
      { type: 'knight', x: 5, y: 0 },
      { type: 'queen', x: 3, y: 0 },
      { type: 'king', x: 4, y: 0 },
      { type: 'pawn', x: 0, y: 1 },
      { type: 'pawn', x: 1, y: 1 },
      { type: 'pawn', x: 2, y: 1 },
      { type: 'pawn', x: 3, y: 1 },
      { type: 'pawn', x: 4, y: 1 },
      { type: 'pawn', x: 5, y: 1 },
      { type: 'pawn', x: 6, y: 1 },
      { type: 'pawn', x: 7, y: 1 },

      { type: 'rook', color: 'black', x: 0, y: 7 },
      { type: 'rook', color: 'black', x: 7, y: 7 },
      { type: 'bishop', color: 'black', x: 1, y: 7 },
      { type: 'bishop', color: 'black', x: 6, y: 7 },
      { type: 'knight', color: 'black', x: 2, y: 7 },
      { type: 'knight', color: 'black', x: 5, y: 7 },
      { type: 'king', color: 'black', x: 3, y: 7 },
      { type: 'queen', color: 'black', x: 4, y: 7 },
      { type: 'pawn', color: 'black', x: 0, y: 6 },
      { type: 'pawn', color: 'black', x: 1, y: 6 },
      { type: 'pawn', color: 'black', x: 2, y: 6 },
      { type: 'pawn', color: 'black', x: 3, y: 6 },
      { type: 'pawn', color: 'black', x: 4, y: 6 },
      { type: 'pawn', color: 'black', x: 5, y: 6 },
      { type: 'pawn', color: 'black', x: 6, y: 6 },
      { type: 'pawn', color: 'black', x: 7, y: 6 },
    ])
  const board = gameManager({
    dimensions: _dimensions || { x: 8, y: 8 },
    pieces,
  })
  return board.runGame()
}
