import collision from './collision'
const validActions = collision.validActions

// let piecesToMove = []
// let lastMoveId = ''
let turn = 'white'

export default function(board, isNewGame) {
  // if (isNewGame) {
  //   piecesToMove = []
  //   lastMoveId = ''
  // }
  // let turnAction = null
  // while (!turnAction) {
  //   if (!piecesToMove.length) getPiecesToMove(board)
  //   if (piecesToMove.length === 1 && piecesToMove[0].id === lastMoveId) {
  //     getPiecesToMove(board)
  //     // console.log('resetting list')
  //   }
  //   if (!piecesToMove.length) continue
  //   const piece = piecesToMove.pop()
  //   if (!piece || piece.hp < 1) continue
  //   if (piece.id === lastMoveId) {
  //     piecesToMove.unshift(piece)
  //     // console.log(
  //     //   'shifting list',
  //     //   piecesToMove.map(p => p.color + ' ' + p.type)
  //     // )
  //     continue
  //   }
  //   // todo still sometimes double moving
  //   lastMoveId = piece.id
  //   // console.log(piece.color + ' ' + piece.type)
  //   turnAction = takeAction(piece, board)
  // }
  // return turnAction

  const { action, piece } = getPieceAndAction(turn, board)
  turn = turn === 'white' ? 'black' : 'white'
  return takeAction(piece, board, action)
}

function getPiecesToMove(board) {
  const movablePieces = board.pieces.filter(p => p.hp > 0)

  // * every piece moves in order before restarting
  // piecesToMove = [...movablePieces]

  // * every piece moves in a random order before restarting
  // piecesToMove = shuffleArray([...movablePieces])
  // console.log('list to move', piecesToMove.map(p => p.color + ' ' + p.type))

  // * a random piece moves
  // piecesToMove = [
  //   movablePieces[Math.floor(Math.random() * movablePieces.length)],
  // ]

  // * the piece with the best reason to move moves

  // * moves pieces by order of priority, randomly
  // const piecesByPriority = {}
  // movablePieces.forEach(piece => {
  //   if (!Array.isArray(piecesByPriority[piece.movePriority]))
  //     piecesByPriority[piece.movePriority] = []
  //   piecesByPriority[piece.movePriority].push(piece)
  // })

  // Object.keys(piecesByPriority)
  //   .sort((a, b) => b - a)
  //   .forEach(movePriority => {
  //     piecesToMove = piecesToMove.concat(
  //       shuffleArray(piecesByPriority[movePriority])
  //     )
  //   })
}

function getPieceAndAction(turn, board) {
  const colorPieces = shuffleArray(board.pieces.filter(p => p.color === turn))
  let piece,
    bestAction = { rating: { value: -999 } }
  for (let p of colorPieces) {
    const { moves, attacks } = validActions(p, board, {
      moves: true,
      attacks: true,
      ratings: true,
    })
    // console.log(
    //   p.name(),
    //   [...moves, ...attacks].map(a => ({ r: a.rating.value, ...a }))
    // )
    for (let a of shuffleArray([...moves, ...attacks])) {
      if (a.rating.value > bestAction.rating.value) {
        bestAction = a
        piece = p
      }
    }
  }
  return { piece, action: bestAction }
}

function selectAction(actions) {
  if (!actions || !actions.length) return
  let selected = null,
    keepTrying,
    selectCutoff
  // * pure best option
  // selected = actions.sort((a, b) => b.rating.value - a.rating.value)[0]

  // * pure worst option
  // selected = actions.sort((a, b) => a.rating.value - b.rating.value)[0]

  // * pure random option
  // selected = null

  // * give some degree of randomness, but prioritize good moves
  selected = actions.find(a => a.rating.value > 1) // always take great attack
  if (!selected) {
    selectCutoff = Math.random() * 2
    // console.log(selectCutoff)
    const shuffledActions = shuffleArray(actions)
    while (!selected) {
      selected = shuffledActions.find(a => a.rating.value > selectCutoff)
      selectCutoff -= 0.2
    }
  }

  // ---

  if (!selected) selected = actions[Math.floor(Math.random() * actions.length)]
  console.log(
    'went with',
    selected.rating.value,
    selected,
    // actions.map(a => ({ ...a, ratingNum: a.rating.value })),
    keepTrying ? keepTrying : 0,
    selectCutoff ? selectCutoff : 0
  )
  return selected
}

function takeAction(piece, board, action) {
  if (!piece || board.gameOver || piece.hp < 1) return
  let event,
    selected = action

  if (!action) {
    const { moves, attacks } = validActions(piece, board, {
      moves: true,
      attacks: true,
      ratings: true,
    })

    const actionsPool = [...attacks, ...moves]

    selected = selectAction(actionsPool)
    if (!selected) {
      // console.log(piece.name(), board.stepCount, moves, attacks)
      return false
      // no moves available
    }
  }
  console.log(piece.name(), 'went with', selected)

  if (selected.type === 'attack') {
    event = {
      type: selected.pieceToAttack.hp - piece.damage <= 0 ? 'kill' : 'damage',
      amount: piece.damage,
      piece: piece.toEssentials(),
      from: piece.toEssentials(),
      to: selected.pieceToAttack.toEssentials(),
      rating: selected.rating,
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
        event.attackInPlace = true
      else {
        piece.x = selected.fromX
        piece.y = selected.fromY
      }
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
  } else if (selected.type === 'move') {
    event = {
      type: 'move',
      fromX: piece.x,
      fromY: piece.y,
      toX: selected.x,
      toY: selected.y,
      piece: piece.toEssentials(),
      rating: selected.rating,
    }

    piece.x = selected.x
    piece.y = selected.y
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

  // console.log(event)
  return event
}

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
