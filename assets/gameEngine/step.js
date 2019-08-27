import render from './render'
import move from './move'

export default function(board, isNewGame) {
  const events = move(board, isNewGame)
  if (events) {
    // render(board)
    return events
  }
  return false
  // console.log(board.pieces)
}
