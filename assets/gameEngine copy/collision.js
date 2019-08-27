function elementAt(x, y, board) {
  if (x >= board.dimensions.x || x < 0 || y >= board.dimensions.y || y < 0) {
    return { x, y, type: null }
  }
  let foundPiece = board.pieces.find(p => p.x === x && p.y === y)
  if (foundPiece) return foundPiece
  return { x, y, type: 'empty' }
}

function ray(fromX, fromY, distance, vector, board) {
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
    if (!targetElement.type) {
      encountered.push({
        x: targetX,
        y: targetY,
        type: 'wall',
      })
      break
    } else if (targetElement.color) {
      encountered.push({
        x: targetX,
        y: targetY,
        type: 'piece',
      })
      break
    } else
      encountered.push({
        x: targetX,
        y: targetY,
        type: 'empty',
      })
    advance()
    targetElement = elementAt(targetX, targetY, board)
  }
  return encountered
}

function validMoves(piece, board) {
  if (piece.type === 'knight') return knightMoves(piece, board)
  const moves = []
  const attacks = []
  piece.movement.direction.forEach(vector => {
    let rayMoves = ray(piece.x, piece.y, piece.movement.distance, vector, board)
    if (rayMoves.length) {
      const lastRayMove =
        rayMoves[rayMoves.length - 1].type === 'empty'
          ? rayMoves[rayMoves.length - 1]
          : rayMoves[rayMoves.length - 2]
      if (!lastRayMove) return
      moves.push({ x: lastRayMove.x, y: lastRayMove.y, type: 'move' })
    }
  })
  piece.attack.direction.forEach(vector => {
    let rayAttacks = ray(piece.x, piece.y, piece.attack.distance, vector, board)
    if (rayAttacks.length) {
      const rayHit = rayAttacks[rayAttacks.length - 1]
      const elementHit = elementAt(rayHit.x, rayHit.y, board)
      if (!elementHit.color) return
      if (elementHit.color !== piece.color) {
        attackFromPosition = rayAttacks[rayAttacks.length - 2]
          ? rayAttacks[rayAttacks.length - 2]
          : piece
        attacks.push({
          fromX: attackFromPosition.x,
          fromY: attackFromPosition.y,
          toX: elementHit.x,
          toY: elementHit.y,
          pieceToAttack: elementHit,
          type: 'attack',
        })
      }
    }
  })
  return { moves, attacks }
}

function knightMoves(piece, board) {
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
    .map(target => ({ x: target.x, y: target.y, type: 'move' }))
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
    }))
  // console.log(moves, attacks)
  return { moves, attacks }
}

// function canMoveTo(x, y, piece, board) {
//   if (x >= board.dimensions.x || x < 0 || y >= board.dimensions.y || y < 0) {
//     return 'edge'
// 	}
// 	const currentX = piece.x
// 	const currentY = piece.y
// 	const movement = piece.movement
// 	if (movement.direction === 'forward'){
// 		if (Math.abs(currentY - y) > piece.distance)
// 			return 'distance'
// 		const forward = piece.color === 'black' ? -1 : 1
// 		for (let i = 1; i < Math.abs(currentY - y); y++){
// 			if (board.pieces.find(p => p.x === currentX && p.y === currentY + (forward * i)))
// 				return 'enemy'
// 		}
// 		return 'ok'
// 	}
// 	// if (['diagonal', 'any'].includes(movement.direction)) {
// 	// 	if (movement.direction === 'diagonal' && Math.abs(currentX - x) !== Math.abs(currentY - y))
// 	// 		return false
// 	// 	for (let c = 0; c < Math.abs(currentX - x); c++){
// 	// 		if (currentX)
// 	// 	}
// 	// }

// 	return 'unknown'
// }

// canAttackTo(x, y, piece, board.dimensions) {

// }

module.exports = {
  ray,
  elementAt,
  validMoves,
}
