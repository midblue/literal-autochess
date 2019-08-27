const { validMoves, elementAt } = require('./collision')

// let piecesToMove = []
let turn = 'white'

module.exports = function(board) {
  // if (!piecesToMove.length) getPiecesToMove(board)
  // return takeAction(piecesToMove.pop(), board)
  let moveEvent = null
  while (!moveEvent) moveEvent = takeAction(getRandomPiece(turn, board), board)
  turn = turn === 'white' ? 'black' : 'white'
  return moveEvent
}

function getRandomPiece(color, board) {
  const colorPieces = board.pieces.filter(p => !color || p.color === color)
  return colorPieces[Math.floor(Math.random() * colorPieces.length)]
}

function getPiecesToMove(board) {
  piecesToMove = piecesToMove.concat(shuffleArray(board.pieces))
  return
  // const piecesByPriority = {}
  // board.pieces.forEach(piece => {
  //   if (!Array.isArray(piecesByPriority[piece.movePriority]))
  //     piecesByPriority[piece.movePriority] = []
  //   piecesByPriority[piece.movePriority].push(piece)
  // })

  // Object.keys(piecesByPriority)
  //   .sort((a, b) => a - b)
  //   .forEach(movePriority => {
  //     piecesToMove = piecesToMove.concat(
  //       shuffleArray(piecesByPriority[movePriority])
  //     )
  //   })
}

function takeAction(piece, board) {
  if (!piece || board.gameOver) return
  const { moves, attacks } = validMoves(piece, board)
  let selected
  let event
  if (attacks.length) {
    selected = attacks[Math.floor(Math.random() * attacks.length)]

    event = {
      type: selected.pieceToAttack.hp - piece.damage <= 0 ? 'kill' : 'damage',
      amount: piece.damage,
      from: piece.toEssentials(),
      to: selected.pieceToAttack.toEssentials(),
    }

    // deal damage and call callback
    selected.pieceToAttack.dealDamage(piece.damage)
    selected.pieceToAttack.onDamage
      ? selected.pieceToAttack.onDamage({
          damage: piece.damage,
          attacker: piece,
        })
      : null

    // check for kill
    if (selected.pieceToAttack.hp <= 0) {
      const x = selected.pieceToAttack.x
      const y = selected.pieceToAttack.y
      board.deletePiece(selected.pieceToAttack.x, selected.pieceToAttack.y)
      piece.x = x
      piece.y = y
    }
    // otherwise stay at attack range
    else {
      piece.x = selected.fromX
      piece.y = selected.fromY
    }

    // check for game over
    if (
      selected.pieceToAttack.type &&
      selected.pieceToAttack.type === 'king' &&
      selected.pieceToAttack.hp <= 0
    ) {
      event.type = 'win'
      board.endGame(piece.color)
    }
  } else if (moves.length) {
    selected = moves[Math.floor(Math.random() * moves.length)]
    // todo pick "good" move or at least close to enemy units
    piece.x = selected.x
    piece.y = selected.y

    event = {}
  } else {
    return false
    // no move
  }
  piece.onMove
    ? piece.onMove({
        position: {
          ...selected,
          isTop: piece.y === 0,
          isBottom: piece.y === board.dimensions.y - 1,
        },
      })
    : {}
  return event
}

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
