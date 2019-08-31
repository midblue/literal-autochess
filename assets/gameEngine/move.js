import collision from './collision'
const validActions = collision.validActions

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
      // console.log('resetting list')
    }
    if (!piecesToMove.length) continue
    const piece = piecesToMove.pop()
    if (!piece || piece.hp < 1) continue
    if (piece.id === lastMoveId) {
      piecesToMove.unshift(piece)
      // console.log(
      //   'shifting list',
      //   piecesToMove.map(p => p.color + ' ' + p.type)
      // )
      continue
    }
    // todo still sometimes double moving
    lastMoveId = piece.id
    // console.log(piece.color + ' ' + piece.type)
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
  const movablePieces = board.pieces.filter(p => p.hp > 0)
  // * every piece moves in order before restarting
  // piecesToMove = [...movablePieces]

  // * every piece moves in a random order before restarting
  piecesToMove = shuffleArray([...movablePieces])
  // console.log('list to move', piecesToMove.map(p => p.color + ' ' + p.type))

  // * a random piece moves
  // piecesToMove = [
  //   movablePieces[Math.floor(Math.random() * movablePieces.length)],
  // ]

  // piecesToMove = piecesToMove.concat(
  //   shuffleArray([...movablePieces])
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
  // let selectCutoff = Math.random() + .2
  // keepTrying = actions.length * 3
  // while (!selected && keepTrying) {
  //   selected = actions[Math.floor(Math.random() * actions.length)]
  //   // console.log(selected.rating, selectCutoff, actions.length)
  //   if (!selected.rating) {
  //     console.log('no rating!', selected)
  //     break
  //   }
  //   if (selected.rating.value < selectCutoff) selected = null
  //   selectCutoff -= 0.1
  //   keepTrying--
  // }
  // * v2
  selected = actions.find(a => a.rating.value > 80) // always take king killer
  if (!selected) {
    selectCutoff = Math.random() * 2.5
    // console.log(selectCutoff)
    const shuffledActions = shuffleArray(actions)
    while (!selected) {
      selected = shuffledActions.find(a => a.rating.value > selectCutoff)
      selectCutoff -= 0.2
    }
  }

  if (!selected) selected = actions[Math.floor(Math.random() * actions.length)]
  // console.log(
  //   'went with',
  //   selected.rating.value,
  //   selected,
  //   // actions.map(a => ({ ...a, ratingNum: a.rating.value })),
  //   'tries left:',
  //   keepTrying ? keepTrying : 0,
  //   selectCutoff ? selectCutoff : 0
  // )
  return selected
}

function takeAction(piece, board) {
  if (!piece || board.gameOver || piece.hp < 1) return
  const { moves, attacks } = validActions(piece, board, true)
  // console.log(piece.name(), attacks, moves)

  const actionsPool = [...attacks, ...moves]

  let selected = selectAction(actionsPool)
  let event

  if (!selected) {
    // console.log(piece.name(), board.stepCount, moves, attacks)
    return false
    // no moves available
  } else if (selected.type === 'attack') {
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
