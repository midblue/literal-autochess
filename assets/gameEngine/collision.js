import pieces from './pieces'
import prices from './../pieceManagement/prices'

function elementAt(x, y, board) {
  if (x >= board.dimensions.x || x < 0 || y >= board.dimensions.y || y < 0) {
    return { x, y, type: null }
  }
  let foundPiece = board.pieces.find(p => p.x === x && p.y === y)
  if (foundPiece) return foundPiece
  return { x, y, type: 'empty' }
}

function enemiesInGeneralDirection(color, fromX, fromY, vector, board) {
  return board.pieces
    .filter(p => p.color !== color && p.hp > 0)
    .filter(enemy => {
      let verticallyInRange = true,
        horizontallyInRange = true,
        diagonallyAcceptable = true
      if ([7, 0, 1].includes(vector)) {
        if (enemy.y >= fromY) verticallyInRange = false
      } else if ([3, 4, 5].includes(vector)) {
        if (enemy.y <= fromY) verticallyInRange = false
      }
      if ([1, 2, 3].includes(vector)) {
        if (enemy.x <= fromX) horizontallyInRange = false
      } else if ([5, 6, 7].includes(vector)) {
        if (enemy.x >= fromX) horizontallyInRange = false
      }
      if ([0, 4].includes(vector)) {
        if (Math.abs(enemy.x - fromX) > Math.abs(enemy.y - fromY))
          diagonallyAcceptable = false
      } else if ([2, 6].includes(vector)) {
        if (Math.abs(enemy.x - fromX) < Math.abs(enemy.y - fromY))
          diagonallyAcceptable = false
      }
      return verticallyInRange && horizontallyInRange && diagonallyAcceptable
    })
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
      distance: traveledDistance,
      rating: piece
        ? getSpaceRating(
            piece.color,
            piece.type,
            targetX,
            targetY,
            board,
            fromX,
            fromY,
            vector
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

function getSpaceRating(color, type, toX, toY, board, fromX, fromY, vector) {
  let baseRating = 0

  // console.log('getting rating', color, type, toX, toY)
  let willHitBonus = 0,
    dangerMinus = 0,
    nextTurnBonus = 0,
    protectAllyBonus = 0,
    isProtectedBonus = 0,
    distanceMinus = 0,
    atEnemiesBonus = 0,
    vectorBonus = 0,
    randomBonus = (Math.random() - 0.5) * 0.1 + (Math.random() - 0.5) * 0.1,
    hitType

  // will hit enemy
  if (toX !== undefined && toY !== undefined) {
    const elementAtSpace = elementAt(toX, toY, board)
    if (
      elementAtSpace.color &&
      elementAtSpace.color === (color === 'black' ? 'white' : 'black')
    ) {
      willHitBonus = 2
      hitType = elementAtSpace.type
      if (hitType === 'king') willHitBonus = 100
    }
  }

  // can be hit
  const danger = isInDangerFrom(
    color,
    toX === undefined ? fromX : toX,
    toY === undefined ? fromY : toY,
    board,
    fromX,
    fromY
  )
  if (danger.length) {
    dangerMinus = 0.3
    if (!hitType || prices.pieces[type] > prices.pieces[hitType])
      dangerMinus = 2
    if (type === 'king') dangerMinus = 100
  }

  // puts an enemy piece in danger
  const endangersEnemy = canHitPiecesFrom(
    color,
    type,
    toX === undefined ? fromX : toX,
    toY === undefined ? fromY : toY,
    board
  )
  if (endangersEnemy.length) {
    nextTurnBonus = 0.2 * endangersEnemy.length
  }

  // protects an ally piece
  const protectsAlly = willProtect(
    color,
    type,
    toX === undefined ? fromX : toX,
    toY === undefined ? fromY : toY,
    board,
    fromX,
    fromY
  )
  if (protectsAlly.length) {
    protectAllyBonus = 0.03 * protectsAlly.length
  }

  // is covered by an ally piece
  const isProtected = isProtectedBy(
    color,
    toX === undefined ? fromX : toX,
    toY === undefined ? fromY : toY,
    board,
    fromX,
    fromY
  )
  if (isProtected.length) {
    isProtectedBonus = 0.05 * isProtected.length
  }

  // distance from origin (keeps pieces visually trackable)
  if (
    toX !== undefined &&
    toY !== undefined &&
    ['queen', 'rook', 'bishop'].includes(type)
  ) {
    const xDiff = toX - fromX,
      yDiff = toY - fromY,
      distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff)
    distanceMinus = Math.max(0, (distance - 2) * 0.15) // -0.15 for each tile away past 2
  }

  // towards enemy pieces (really just baaarely tip the scales)
  if (vector !== undefined) {
    const enemies = enemiesInGeneralDirection(
      color,
      fromX,
      fromY,
      vector,
      board
    )
    atEnemiesBonus = enemies.length * 0.03
  }

  // pieces that want to go a specific way, i.e. pawns -> end
  if (vector !== undefined) {
    const testPiece = pieces[type]({ color })
    if (testPiece.vectorBonus)
      vectorBonus = testPiece.vectorBonus(vector) ? 0.1 : 0
  }

  return {
    value:
      Math.round(
        (baseRating +
          willHitBonus -
          dangerMinus +
          nextTurnBonus +
          protectAllyBonus +
          isProtectedBonus -
          distanceMinus +
          atEnemiesBonus +
          vectorBonus +
          randomBonus) *
          1000
      ) / 1000,
    rationale: {
      willHitBonus,
      dangerMinus,
      nextTurnBonus,
      protectAllyBonus,
      isProtectedBonus,
      distanceMinus,
      atEnemiesBonus,
      vectorBonus,
      randomBonus,
    },
  }
}

function isInDangerFrom(color, toX, toY, board, fromX, fromY) {
  const boardWithTemporaryFriendlyPieceInThatLocation = {
    ...board,
    pieces: [
      ...board.pieces.filter(
        p => !(p.x === toX && p.y === toY) && !(p.x === fromX && p.y === fromY)
      ),
      pieces.pawn({ color, x: toX, y: toY }),
    ],
  }
  return boardWithTemporaryFriendlyPieceInThatLocation.pieces.filter(p => {
    if (p.color === color) return false
    const actions = validActions(
      p,
      boardWithTemporaryFriendlyPieceInThatLocation,
      { moves: false, attacks: true, ratings: false }
    )
    // if (actions.attacks.length)
    //   console.log('if i go to', toX, toY, p.name(), 'has', actions.attacks)
    const attacks = actions.attacks.filter(a => a.toX === toX && a.toY === toY)
    if (attacks.length) return true
  })
}

function isProtectedBy(color, toX, toY, board, fromX, fromY) {
  const boardWithTemporaryEnemyPieceInThatLocation = {
    ...board,
    pieces: [
      ...board.pieces.filter(
        p => !(p.x === toX && p.y === toY) && !(p.x === fromX && p.y === fromY)
      ),
      pieces.pawn({
        color: color === 'white' ? 'black' : 'white',
        x: toX,
        y: toY,
      }),
    ],
  }
  return boardWithTemporaryEnemyPieceInThatLocation.pieces.filter(p => {
    if (p.color !== color) return false
    const actions = validActions(
      p,
      boardWithTemporaryEnemyPieceInThatLocation,
      { moves: false, attacks: true, ratings: false }
    )
    const attacks = actions.attacks.filter(a => a.toX === toX && a.toY === toY)
    if (attacks.length) return true
  })
}

function willProtect(color, type, toX, toY, board, fromX, fromY) {
  const enemyPiece = pieces[type]({
    color: color === 'white' ? 'black' : 'white',
    x: toX,
    y: toY,
  })
  const boardWithTemporaryEnemyPieceInThatLocation = {
    ...board,
    pieces: [
      ...board.pieces.filter(
        p => !(p.x === toX && p.y === toY) && !(p.x === fromX && p.y === fromY)
      ),
      enemyPiece,
    ],
  }
  const canProtect = validActions(
    enemyPiece,
    boardWithTemporaryEnemyPieceInThatLocation,
    {
      moves: false,
      attacks: true,
      ratings: false,
    }
  ).attacks
  return canProtect
}

function canHitPiecesFrom(color, type, x, y, board) {
  return validActions(pieces[type]({ color, x, y }), board, {
    moves: false,
    attacks: true,
    ratings: false,
  }).attacks
}

function validActions(
  piece,
  board,
  get = { moves: true, attacks: true, ratings: true }
) {
  if (piece.type === 'knight') return knightMoves(piece, board, get)
  const moves = []
  const attacks = []
  let currentLocationRating = get.ratings
    ? getSpaceRating(
        piece.color,
        piece.type,
        undefined,
        undefined,
        board,
        piece.x,
        piece.y
      )
    : null

  const rays = piece.movement.direction.map(vector =>
    ray(
      piece.x,
      piece.y,
      piece.movement.distance,
      vector,
      board,
      get.ratings ? piece : false
    )
  )

  // moves
  if (get.moves) {
    rays.forEach(singleRay => {
      if (singleRay.length) {
        const tempRay = [...singleRay]
        while (tempRay.length) {
          const possibleMove = tempRay.pop()
          if (possibleMove.type === 'empty')
            moves.push({
              x: possibleMove.x,
              y: possibleMove.y,
              type: 'move',
              rating: get.ratings
                ? subtractCurrentSpaceRating(
                    currentLocationRating,
                    possibleMove.rating
                  )
                : undefined,
            })
        }
      }
    })
  }

  // attacks
  if (get.attacks) {
    let raysToUse = rays
    if (piece.attack !== true)
      // use attack rays instead of movement ones
      raysToUse = piece.attack.direction.map(vector =>
        ray(
          piece.x,
          piece.y,
          piece.attack.distance,
          vector,
          board,
          get.ratings ? piece : false
        )
      )

    raysToUse.forEach(singleRay => {
      if (singleRay.length) {
        const rayHit = singleRay[singleRay.length - 1]
        const elementHit = elementAt(rayHit.x, rayHit.y, board)
        if (!elementHit.color || elementHit.color === piece.color) return

        const attackFromPosition = singleRay[singleRay.length - 2]
          ? singleRay[singleRay.length - 2]
          : piece
        attacks.push({
          fromX: attackFromPosition.x,
          fromY: attackFromPosition.y,
          toX: elementHit.x,
          toY: elementHit.y,
          pieceToAttack: elementHit,
          type: 'attack',
          rating: get.ratings
            ? subtractCurrentSpaceRating(currentLocationRating, rayHit.rating)
            : undefined,
        })
      }
    })
  }

  return { moves, attacks }
}

function knightMoves(
  piece,
  board,
  get = { moves: true, attacks: true, ratings: true }
) {
  const x = piece.x
  const y = piece.y
  let moves, attacks
  let currentLocationRating = get.ratings
    ? getSpaceRating(
        piece.color,
        piece.type,
        undefined,
        undefined,
        board,
        piece.x,
        piece.y
      )
    : null

  if (get.moves)
    moves = [
      { element: elementAt(x + 2, y + 1, board), vector: 3 },
      { element: elementAt(x + 2, y - 1, board), vector: 1 },
      { element: elementAt(x + 1, y + 2, board), vector: 3 },
      { element: elementAt(x + 1, y - 2, board), vector: 1 },
      { element: elementAt(x - 2, y + 1, board), vector: 5 },
      { element: elementAt(x - 2, y - 1, board), vector: 7 },
      { element: elementAt(x - 1, y + 2, board), vector: 5 },
      { element: elementAt(x - 1, y - 2, board), vector: 7 },
    ]
      .filter(target => target.element.type === 'empty')
      .map(target => ({
        x: target.element.x,
        y: target.element.y,
        type: 'move',
        rating: get.ratings
          ? subtractCurrentSpaceRating(
              currentLocationRating,
              getSpaceRating(
                piece.color,
                piece.type,
                target.element.x,
                target.element.y,
                board,
                x,
                y,
                target.vector
              )
            )
          : null,
      }))
  if (get.attacks)
    attacks = [
      { element: elementAt(x + 2, y + 1, board), vector: 3 },
      { element: elementAt(x + 2, y - 1, board), vector: 1 },
      { element: elementAt(x + 1, y + 2, board), vector: 3 },
      { element: elementAt(x + 1, y - 2, board), vector: 1 },
      { element: elementAt(x - 2, y + 1, board), vector: 5 },
      { element: elementAt(x - 2, y - 1, board), vector: 7 },
      { element: elementAt(x - 1, y + 2, board), vector: 5 },
      { element: elementAt(x - 1, y - 2, board), vector: 7 },
    ]
      .filter(
        target => target.element.color && piece.color !== target.element.color
      )
      .map(target => ({
        fromX: x,
        fromY: y,
        toX: target.element.x,
        toY: target.element.y,
        pieceToAttack: target.element,
        type: 'attack',
        rating: get.ratings
          ? subtractCurrentSpaceRating(
              currentLocationRating,
              getSpaceRating(
                piece.color,
                piece.type,
                target.element.x,
                target.element.y,
                board,
                x,
                y,
                target.vector
              )
            )
          : null,
      }))
  // console.log(moves, attacks)
  return { moves, attacks }
}

function subtractCurrentSpaceRating(current, other) {
  return {
    value: other.value - current.value,
    rationale: {
      currentSpaceMinus: current.value,
      currentSpaceRationale: current.rationale,
      ...other.rationale,
    },
  }
}

export default {
  ray,
  elementAt,
  validActions,
}
