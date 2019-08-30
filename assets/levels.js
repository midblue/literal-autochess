import pool from './pieceManagement/buyPool'
import prices from './pieceManagement/prices'
const autoLevels = []

export default function(levelNum, dimensions) {
  if (autoLevels[levelNum]) return autoLevels[levelNum]
  const halfway = Math.ceil(dimensions.x / 2)
  const pieces = [{ type: 'king', x: halfway, y: 0 }]
  if (levelNum > 3) pieces.push({ type: 'pawn', x: halfway, y: 1 })
  if (levelNum > 5) pieces.push({ type: 'pawn', x: halfway - 1, y: 1 })

  // * buy system
  let gold = levelNum * 4
  while (gold >= prices.pieces.pawn) {
    const type =
      pool.flatPieces[Math.floor(Math.random() * pool.flatPieces.length)]
    if (gold < prices.pieces[type]) continue
    gold -= prices.pieces[type]
    let x = Math.floor(Math.random() * dimensions.x)
    let y = Math.floor(Math.random() * Math.floor(dimensions.y / 2))
    while (pieces.find(p => p.x === x && p.y === y) && pieces.length < 32) {
      x = Math.floor(Math.random() * dimensions.x)
      y = Math.floor(Math.random() * Math.floor(dimensions.y / 2))
    }
    pieces.push({ type, x, y })
  }

  // * levelNum of random pieces
  // for (let i = 1; i < levelNum; i++) {
  //   let type = pool.flatPieces[Math.floor(Math.random() * pool.flatPieces.length)]
  //   let x = Math.floor(Math.random() * dimensions.x)
  //   let y = Math.floor(Math.random() * Math.floor(dimensions.y / 2))
  //   while (pieces.find(p => p.x === x && p.y === y) && pieces.length < 32) {
  //     x = Math.floor(Math.random() * dimensions.x)
  //     y = Math.floor(Math.random() * Math.floor(dimensions.y / 2))
  //   }
  //   pieces.push({ type, x, y })
  // }
  autoLevels[levelNum] = pieces
  return pieces
  // return manualLevels[levelNum]
}

const manualLevels = [
  [],
  [{ type: 'king', x: 4, y: 0 }],
  [{ type: 'pawn', x: 6, y: 1 }, { type: 'king', x: 0, y: 0 }],
  [
    { type: 'pawn', x: 1, y: 1 },
    { type: 'pawn', x: 4, y: 1 },
    { type: 'king', x: 3, y: 0 },
  ],
  [
    { type: 'pawn', x: 6, y: 3 },
    { type: 'bishop', x: 0, y: 0 },
    { type: 'king', x: 6, y: 0 },
  ],
  [
    { type: 'pawn', x: 5, y: 1 },
    { type: 'rook', x: 4, y: 0 },
    { type: 'king', x: 0, y: 0 },
    { type: 'pawn', x: 0, y: 1 },
    { type: 'pawn', x: 2, y: 2 },
  ],
  [
    { type: 'knight', x: 3, y: 2 },
    { type: 'rook', x: 3, y: 1 },
    { type: 'king', x: 4, y: 1 },
    { type: 'pawn', x: 4, y: 2 },
    { type: 'pawn', x: 6, y: 2 },
    { type: 'pawn', x: 5, y: 2 },
  ],
  [
    { type: 'knight', x: 7, y: 1 },
    { type: 'rook', x: 6, y: 1 },
    { type: 'king', x: 5, y: 1 },
    { type: 'bishop', x: 4, y: 1 },
    { type: 'pawn', x: 6, y: 2 },
    { type: 'pawn', x: 5, y: 2 },
    { type: 'pawn', x: 4, y: 2 },
  ],
  [
    { type: 'knight', x: 1, y: 1 },
    { type: 'knight', x: 2, y: 1 },
    { type: 'knight', x: 3, y: 1 },
    { type: 'knight', x: 4, y: 1 },
    { type: 'knight', x: 5, y: 1 },
    { type: 'knight', x: 6, y: 1 },
    { type: 'king', x: 5, y: 0 },
  ],
  [
    { type: 'pawn', x: 0, y: 1 },
    { type: 'pawn', x: 1, y: 1 },
    { type: 'pawn', x: 2, y: 1 },
    { type: 'pawn', x: 3, y: 1 },
    { type: 'pawn', x: 4, y: 1 },
    { type: 'pawn', x: 5, y: 1 },
    { type: 'pawn', x: 6, y: 1 },
    { type: 'pawn', x: 7, y: 1 },
    { type: 'king', x: 5, y: 0 },
  ],
  [
    { type: 'rook', x: 0, y: 0 },
    { type: 'rook', x: 7, y: 0 },
    { type: 'bishop', x: 1, y: 0 },
    { type: 'bishop', x: 6, y: 0 },
    { type: 'knight', x: 2, y: 0 },
    { type: 'knight', x: 5, y: 0 },
    { type: 'queen', x: 3, y: 0 },
    { type: 'pawn', x: 0, y: 1 },
    { type: 'pawn', x: 1, y: 1 },
    { type: 'pawn', x: 2, y: 1 },
    { type: 'pawn', x: 3, y: 1 },
    { type: 'pawn', x: 4, y: 1 },
    { type: 'pawn', x: 5, y: 1 },
    { type: 'pawn', x: 6, y: 1 },
    { type: 'pawn', x: 7, y: 1 },
    { type: 'king', x: 4, y: 0 },
  ],
]
