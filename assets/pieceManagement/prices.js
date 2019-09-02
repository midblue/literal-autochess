const pieces = {
  rook: 8,
  bishop: 7,
  knight: 6,
  queen: 14,
  king: 15,
  pawn: 3,
}

const sellMod = 2
const sell = {
  rook: pieces.rook - sellMod,
  bishop: pieces.bishop - sellMod,
  knight: pieces.knight - sellMod,
  queen: pieces.queen - sellMod,
  king: pieces.king - sellMod,
  pawn: pieces.pawn - sellMod,
}

const upgrades = {
  hp: 5,
}

// todo have passive upgrades too

export default {
  pieces,
  upgrades,
  sell,
}
