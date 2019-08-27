import collision from './collision'
const validMoves = collision.validMoves

let piecesToMove = []
let lastMoveId = ''
// let turn = Math.random() > 0.5 ? 'white' : 'black'

export default function(board, isNewGame) {
  if (isNewGame) {
    piecesToMove = []
    lastMoveId = ''
  }
  let turnAction = null
  while (!turnAction) {
    if (!piecesToMove.length) getPiecesToMove(board)
    if (piecesToMove.length === 1 && piecesToMove[0].id === lastMoveId) {
      getPiecesToMove(board)
      console.log('resetting list')
    }
    if (!piecesToMove.length) continue
    const piece = piecesToMove.pop()
    if (!piece || piece.hp < 1) continue
    if (piece.id === lastMoveId) {
      piecesToMove.unshift(piece)
      console.log(
        'shifting list',
        piecesToMove.map(p => p.color + ' ' + p.type)
      )
      continue
    }
    // todo still sometimes double moving
    lastMoveId = piece.id
    console.log(piece.color + ' ' + piece.type)
    turnAction = takeAction(piece, board)
  }
  return turnAction

  //   let turnAction = null
  //   while (!turnAction) turnAction = takeAction(getRandomPiece(turn, board), board)
  //   turn = turn === 'white' ? 'black' : 'white'
  //   return turnAction
  // }

  // function getRandomPiece(color, board) {
  //   const colorPieces = board.pieces.filter(p => !color || p.color === color)
  //   return colorPieces[Math.floor(Math.random() * colorPieces.length)]
}

function getPiecesToMove(board) {
  piecesToMove = shuffleArray([...board.pieces.filter(p => p.hp > 0)])
  console.log(piecesToMove.map(p => p.color + ' ' + p.type))

  // piecesToMove = piecesToMove.concat(
  //   shuffleArray([...board.pieces.filter(p => p.hp > 0)])
  // )
  // return
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
  if (!piece || board.gameOver || piece.hp < 1) return
  const { moves, attacks } = validMoves(piece, board)
  let selected
  let event
  if (attacks.length) {
    selected = attacks[Math.floor(Math.random() * attacks.length)]

    event = {
      type: selected.pieceToAttack.hp - piece.damage <= 0 ? 'kill' : 'damage',
      amount: piece.damage,
      piece: piece.toEssentials(),
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
      if (piece.x === selected.fromX && piece.y === selected.fromY)
        return (event.attackInPlace = true)
      piece.x = selected.fromX
      piece.y = selected.fromY
    }

    // check for game over
    if (
      selected.pieceToAttack.type &&
      selected.pieceToAttack.type === 'king' &&
      selected.pieceToAttack.hp <= 0 &&
      !board.pieces.find(
        p => p.type === 'king' && p.color === selected.pieceToAttack.color
      )
    ) {
      event.type = 'end'
      event.winner = piece.color
      board.endGame(piece.color)
    }
  } else if (moves.length) {
    selected = moves[Math.floor(Math.random() * moves.length)]
    // todo pick "good" move or at least close to enemy units

    event = {
      type: 'move',
      fromX: piece.x,
      fromY: piece.y,
      toX: selected.x,
      toY: selected.y,
      piece: piece.toEssentials(),
    }

    piece.x = selected.x
    piece.y = selected.y
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
