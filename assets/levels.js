const autoLevels = []

export default function(levelNum) {
  if (autoLevels[levelNum]) return autoLevels[levelNum]
  const pool = [
    'pawn',
    'pawn',
    'pawn',
    'pawn',
    'pawn',
    'pawn',
    'pawn',
    'pawn',
    'pawn',
    'pawn',
    'bishop',
    'bishop',
    'bishop',
    'knight',
    'knight',
    'knight',
    'rook',
    'rook',
    'rook',
    'queen',
    'king',
  ]
  const pieces = [{ type: 'king', x: 4, y: 0 }]
  for (let i = 1; i < levelNum; i++) {
    let type = pool[Math.floor(Math.random() * pool.length)]
    let x = Math.floor(Math.random() * 8)
    let y = Math.floor(Math.random() * 4)
    while (pieces.find(p => p.x === x && p.y === y) && pieces.length < 32) {
      x = Math.floor(Math.random() * 8)
      y = Math.floor(Math.random() * 4)
    }
    pieces.push({ type, x, y })
  }
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
