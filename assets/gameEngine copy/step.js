const render = require('./render')
const move = require('./move')

module.exports = function(board) {
  const events = move(board)
  if (events) {
    // render(board)
    return events
  }
  return false
  // console.log(board.pieces)
}
