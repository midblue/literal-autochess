import pieces from './pieces'

function elementAt(x, y, board) {
  if (x >= board.dimensions.x || x < 0 || y >= board.dimensions.y || y < 0) {
    return { x, y, type: null }
  }
  let foundPiece = board.pieces.find(p => p.x === x && p.y === y)
  if (foundPiece) return foundPiece
  return { x, y, type: 'empty' }
}

function ray(fromX, fromY, distance, vector, board, piece) {
  // vector is 0-7 counting from up, clockwise
  let targetX, targetY
  let traveledDistance = 0
  const advance = () => {
    traveledDistance++
    targetX = [1, 2, 3].includes(vector)
      ? fromX + traveledDistance
      : [5, 6, 7].includes(vector)
      ? fromX - traveledDistance
      : fromX
    targetY = [7, 0, 1].includes(vector)
      ? fromY - traveledDistance
      : [3, 4, 5].includes(vector)
      ? fromY + traveledDistance
      : fromY
  }

  advance()

  let targetElement = elementAt(targetX, targetY, board)
  let encountered = []
  while (traveledDistance <= distance && targetElement.type) {
    const encounteredSpace = {
      x: targetX,
      y: targetY,
      rating: piece
        ? getSpaceRating(
            piece.color,
            piece.type,
            targetX,
            targetY,
            board,
            fromX,
            fromY
          )
        : null,
    }
    if (!targetElement.type) {
      encounteredSpace.type = 'wall'
      encountered.push(encounteredSpace)
      break
    } else if (targetElement.color) {
      encounteredSpace.type = 'piece'
      encountered.push(encounteredSpace)
      break
    } else {
      encounteredSpace.type = 'empty'
      encountered.push(encounteredSpace)
      advance()
    }
    targetElement = elementAt(targetX, targetY, board)
  }
  return encountered
}

function getSpaceRating(color, type, x, y, board, fromX, fromY) {
  let baseRating = 0.3

  // console.log('getting rating', color, type, x, y)
  let willHitBonus = 0,
    dangerMinus = 0,
    nextTurnBonus = 0

  // will hit enemy
  const elementAtSpace = elementAt(x, y, board)
  if (
    elementAtSpace.color &&
    elementAtSpace.color === (color === 'black' ? 'white' : 'black')
  ) {
    if (['pawn'].includes(elementAtSpace.type)) willHitBonus = 0.4
    else if (['rook', 'knight', 'bishop'].includes(elementAtSpace.type))
      willHitBonus = 0.5
    else if (['queen'].includes(elementAtSpace.type)) willHitBonus = 0.6
    else if (['king'].includes(elementAtSpace.type)) willHitBonus = 100
    // console.log('willHitBonus')
  }

  // can be hit
  const danger = isInDangerFrom(color, x, y, board, fromX, fromY)
  if (danger.length) {
    dangerMinus = danger.length
    if (type === 'king') dangerMinus *= 2
    // console.log('dangerMinus')
  }

  // can hit next turn
  const canHitNext = canHitPiecesFrom(color, type, x, y, board)
  if (canHitNext.length) {
    nextTurnBonus = 0.2 * canHitNext.length
    // console.log('nextTurnBonus')
  }

  return {
    value: baseRating + willHitBonus - dangerMinus + nextTurnBonus,
    rationale: {
      baseRating,
      willHitBonus,
      dangerMinus,
      nextTurnBonus,
    },
  }
}

function isInDangerFrom(color, x, y, board, fromX, fromY) {
  const boardWithTemporaryFriendlyPieceInThatLocation = {
    ...board,
    pieces: [
      ...board.pieces.filter(
        p => !(p.x === x && p.y === y) && !(p.x === fromX && p.y === fromY)
      ),
      pieces.pawn({ color, x, y }),
    ],
  }

  return boardWithTemporaryFriendlyPieceInThatLocation.pieces.filter(p => {
    if (p.color === color) return false
    const actions = validActions(
      p,
      boardWithTemporaryFriendlyPieceInThatLocation,
      false
    )
    // console.log('if i go to', x, y, p.name(), 'has', actions.attacks)
    const attacks = actions.attacks.filter(a => a.toX === x && a.toY === y)
    if (attacks.length) return true
  })
}

function canHitPiecesFrom(color, type, x, y, board) {
  return validActions(pieces[type]({ color, x, y }), board, false).attacks
}

// todo make isInDanger check for king

function validActions(piece, board, getRatings = false) {
  if (piece.type === 'knight') return knightMoves(piece, board, getRatings)
  const moves = []
  const attacks = []

  // moves
  piece.movement.direction.forEach(vector => {
    let rayMoves = ray(
      piece.x,
      piece.y,
      piece.movement.distance,
      vector,
      board,
      getRatings ? piece : false
    )
    if (rayMoves.length) {
      while (rayMoves.length) {
        const rayMove = rayMoves.pop()
        if (rayMove.type === 'empty')
          moves.push({
            x: rayMove.x,
            y: rayMove.y,
            type: 'move',
            rating: rayMove.rating,
          })
      }
    }
  })

  // attacks
  piece.attack.direction.forEach(vector => {
    let rayAttacks = ray(
      piece.x,
      piece.y,
      piece.attack.distance,
      vector,
      board,
      getRatings ? piece : false
    )
    if (rayAttacks.length) {
      const rayHit = rayAttacks[rayAttacks.length - 1]
      const elementHit = elementAt(rayHit.x, rayHit.y, board)
      if (!elementHit.color) return
      if (elementHit.color !== piece.color) {
        const attackFromPosition = rayAttacks[rayAttacks.length - 2]
          ? rayAttacks[rayAttacks.length - 2]
          : piece
        attacks.push({
          fromX: attackFromPosition.x,
          fromY: attackFromPosition.y,
          toX: elementHit.x,
          toY: elementHit.y,
          pieceToAttack: elementHit,
          type: 'attack',
          rating: rayHit.rating,
        })
      }
    }
  })
  return { moves, attacks }
}

function knightMoves(piece, board, getRatings) {
  const x = piece.x
  const y = piece.y

  const moves = [
    elementAt(x + 2, y + 1, board),
    elementAt(x + 2, y - 1, board),
    elementAt(x + 1, y + 2, board),
    elementAt(x + 1, y - 2, board),
    elementAt(x - 2, y + 1, board),
    elementAt(x - 2, y - 1, board),
    elementAt(x - 1, y + 2, board),
    elementAt(x - 1, y - 2, board),
  ]
    .filter(target => target.type === 'empty')
    .map(target => ({
      x: target.x,
      y: target.y,
      type: 'move',
      rating: getRatings
        ? getSpaceRating(
            piece.color,
            piece.type,
            target.x,
            target.y,
            board,
            x,
            y
          )
        : null,
    }))
  const attacks = [
    elementAt(x + 2, y + 1, board),
    elementAt(x + 2, y - 1, board),
    elementAt(x + 1, y + 2, board),
    elementAt(x + 1, y - 2, board),
    elementAt(x - 2, y + 1, board),
    elementAt(x - 2, y - 1, board),
    elementAt(x - 1, y + 2, board),
    elementAt(x - 1, y - 2, board),
  ]
    .filter(target => target.color && piece.color !== target.color)
    .map(target => ({
      fromX: x,
      fromY: y,
      toX: target.x,
      toY: target.y,
      pieceToAttack: target,
      type: 'attack',
      rating: getRatings
        ? getSpaceRating(
            piece.color,
            piece.type,
            target.x,
            target.y,
            board,
            x,
            y
          )
        : null,
    }))
  // console.log(moves, attacks)
  return { moves, attacks }
}

export default {
  ray,
  elementAt,
  validActions,
}
