import gameManager from './gameManager'
import generatePieces from './generatePieces'
import prices from '../pieceManagement/prices'

function getPieceLimit(level) {
  return Math.min(Math.ceil(level / 2) + 2, 16)
}

export default function({
  pieces = [{ type: 'king', color: 'black', x: 3, y: 7 }],
  bench = [],
  hp = 3,
  gold = 0,
  isHuman = false,
  level = 1,
  color = 'white',
  dimensions = { x: 8, y: 8 },
}) {
  return {
    color,
    isHuman,
    level,
    hp,
    gold,
    dimensions,
    pieceLimit: getPieceLimit(1),
    previousWinnings: {},
    pieces: generatePieces(pieces),
    bench: generatePieces(bench),
    addPiece(newPiece) {
      newPiece.color = this.color
      if (newPiece.bench !== false) {
        newPiece.bench = this.getOpenBenchSpot()
        this.bench = [...this.bench, ...generatePieces([newPiece])]
      } else this.pieces = [...this.pieces, ...generatePieces([newPiece])]
    },
    getOpenBenchSpot(id) {
      let foundSpot = 0
      while (
        this.bench.find(p => (id ? p.id !== id : true) && p.bench === foundSpot)
      )
        foundSpot++
      return foundSpot
    },
    toggleBench(piece) {
      if (piece.bench !== false) {
        piece.bench = false
        this.bench = this.bench.filter(p => p.id !== piece.id)
        this.pieces = [...this.pieces, piece]
      } else {
        piece.bench = this.getOpenBenchSpot(piece.id)
        this.pieces = this.pieces.filter(p => p.id !== piece.id)
        this.bench = [...this.bench, piece]
      }
    },
    sellPiece(id, type) {
      if (!this.pieces.find(p => p.id !== id && p.type === 'king'))
        return {
          error: true,
          notify: true,
          msg: `Must have at least one king in play!`,
        }
      const sellPrice = prices.sell[type] || 0
      this.gold += sellPrice
      this.pieces = this.pieces.filter(p => p.id !== id)
      this.bench = this.bench.filter(p => p.id !== id)
      return sellPrice
    },
    playFromBench({ id, x, y }) {
      if (this.pieces.length >= this.pieceLimit)
        return {
          error: true,
          msg: `Can't play more than ${this.pieceLimit} pieces at this level!`,
          context: { limit: this.pieceLimit, pieces: this.pieces.length },
          notify: true,
        }

      const pieceToUpdate = this.bench.find(p => {
        return p.id === id
      })
      if (!pieceToUpdate)
        return {
          error: true,
          msg: "Can't find piece to play from bench: ",
          context: { id, x, y },
        }

      if (y < this.dimensions.y / 2)
        return {
          error: true,
          notify: true,
          msg: `Can't move a piece that far up!`,
        }

      let pieceAtThatLocation = this.pieces.find(
        p => p.id !== id && (p.homeX === x && p.homeY === y)
      )
      if (
        pieceAtThatLocation &&
        pieceAtThatLocation.type === 'king' &&
        !this.pieces.find(
          p => p.id !== pieceAtThatLocation.id && p.type === 'king'
        )
      )
        return {
          error: true,
          notify: true,
          msg: `Must have at least one king in play!`,
        }
      if (pieceAtThatLocation) {
        // switch!
        this.toggleBench(pieceAtThatLocation)
      }

      this.toggleBench(pieceToUpdate)

      pieceToUpdate.x = x
      pieceToUpdate.homeX = x
      pieceToUpdate.y = y
      pieceToUpdate.homeY = y
      return true
    },
    moveOnBench({ id, bench, toX }) {
      // todo
    },
    sendToBench(id) {
      const pieceToUpdate = this.pieces.find(p => {
        return p.id === id
      })
      if (!pieceToUpdate)
        return {
          error: true,
          msg: "Can't find piece to send to bench.",
          context: id,
        }
      if (
        pieceToUpdate.type === 'king' &&
        !this.pieces.find(p => p.id !== id && p.type === 'king')
      )
        return {
          error: true,
          notify: true,
          msg: 'Must have at least one king in play.',
          context: id,
        }
      this.toggleBench(pieceToUpdate)
      return true
    },

    updatePiece(updatedProps) {
      const pieceToUpdate = this.pieces.find(p => {
        return p.id === updatedProps.id
      })
      if (!pieceToUpdate)
        return {
          error: true,
          msg: "Can't find piece to update.",
          context: updatedProps,
        }

      if (
        updatedProps.homeY &&
        updatedProps.homeY < Math.floor(this.dimensions.y / 2)
      )
        return {
          error: true,
          msg: `Can't move a piece that far up!`,
          context: updatedProps,
          notify: true,
        }

      if (
        updatedProps.homeX !== undefined &&
        updatedProps.homeY !== undefined
      ) {
        let pieceAtThatLocation = this.pieces.find(
          p =>
            p.id !== updatedProps.id &&
            (p.homeX === updatedProps.homeX && p.homeY === updatedProps.homeY)
        )
        if (pieceAtThatLocation) {
          // switch!
          pieceAtThatLocation.x = pieceToUpdate.homeX
          pieceAtThatLocation.y = pieceToUpdate.homeY
          pieceAtThatLocation.homeX = pieceToUpdate.homeX
          pieceAtThatLocation.homeY = pieceToUpdate.homeY
        }
      }

      Object.keys(updatedProps).forEach(
        key => (pieceToUpdate[key] = updatedProps[key])
      )

      pieceToUpdate.x = pieceToUpdate.homeX
      pieceToUpdate.y = pieceToUpdate.homeY
      return true
    },

    applyUpgrade(type) {
      if (type === 'hp') this.hp++
    },

    onGameReset() {
      this.pieces.forEach(p => {
        if (p.onGameReset) p.onGameReset()
        p.x = p.homeX
        p.y = p.homeY
        p.hp = p.baseHp
      })
    },
    levelUp() {
      this.level++
      this.pieceLimit = getPieceLimit(this.level)
    },
    takeDamage(amount) {
      if (!isHuman) return true
      this.hp -= amount
      return this.hp > 0
    },
    addGold(didWin) {
      let winGold = didWin ? 4 : 1
      let interestGold = Math.min(5, Math.floor(this.gold / 10))
      this.gold += winGold + interestGold
      this.previousWinnings = { didWin, winGold, interestGold }
      // todo working properly every time?
    },
    resetPreviousGold() {
      this.previousWinnings = { didWin: null, winGold: 0, interestGold: 0 }
    },
    canBuy(cost) {
      return cost <= this.gold
    },
    buy(cost) {
      if (!this.canBuy(cost)) return false
      this.gold -= cost
      return cost
    },

    playVs(enemy) {
      const board = gameManager({
        dimensions: this.dimensions,
        pieces: [
          ...enemy.pieces,
          ...this.pieces.map(p => ({ ...p, color: 'black' })),
        ],
      })
      const gameData = board.runGame()
      return gameData
    },
  }
}
