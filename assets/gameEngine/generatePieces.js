import p from './pieces'

export default function(pieceList) {
  const pieces = []
  for (let piece of pieceList)
    pieces.push(
      p[piece.type]({
        x: piece.x,
        y: piece.y,
        color: piece.color || 'white',
        bench: piece.bench,
      })
    )
  return pieces
}
