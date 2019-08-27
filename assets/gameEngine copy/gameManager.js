const step = require('./step')
const render = require('./render')

module.exports = function({ dimensions, pieces }) {
  return {
    gameOver: true,
    winner: null,
    dimensions,
    stepCount: 0,
    steps: [],
    pieces,
    deletePiece(x, y) {
      this.pieces.splice(this.pieces.findIndex(p => p.x === x && p.y === y), 1)
    },
    toString() {
      return JSON.stringify(this.pieces.map(p => p.toEssentials()))
    },
    runGame() {
      this.gameOver = false
      // render(this)
      this.steps.push({
        event: { type: 'start' },
        gameState: this.toString(),
      })
      this.stepCount++

      let event
      while (!this.gameOver) {
        event = step(this)
        this.steps.push({
          event: JSON.stringify(event),
          gameState: this.toString(),
        })
        this.stepCount++
      }

      console.log('Game won by', this.winner, 'in', this.stepCount, 'moves.')

      return this.steps
    },
    endGame(winner) {
      this.winner = winner
      this.gameOver = true
    },
  }
}
