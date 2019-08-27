const commonFunctions = function() {
  return {
    toEssentials: function() {
      return {
        id: this.id,
        type: this.type,
        hp: this.hp,
        x: this.x,
        y: this.y,
        indicator: this.indicator,
        color: this.color,
        bench: this.bench,
      }
    },
    dealDamage: function(damage) {
      this.hp -= damage
    },
    onDamage: function({ damage, attacker }) {
      // if (this.hp <= 0)
      //   console.log(
      //     this.color,
      //     this.type,
      //     'was killed by',
      //     attacker.color,
      //     attacker.type
      //   )
      // else {
      //   console.log(
      //     this.color,
      //     this.type,
      //     'took',
      //     damage,
      //     'damage from',
      //     attacker.color,
      //     attacker.type
      //   )
      // }
    },
  }
}

function getId() {
  return `${Math.random()}`.substring(2)
}

const rook = ({ color = 'white', x, y, bench = false }) => ({
  ...commonFunctions(),
  id: 'r' + getId(),
  x,
  y,
  bench,
  homeX: x,
  homeY: y,
  color,
  type: 'rook',
  indicator: 'r',
  movePriority: 3,
  hp: 1,
  baseHp: 1,
  damage: 1,
  movement: { direction: [0, 2, 4, 6], distance: Infinity },
  attack: { direction: [0, 2, 4, 6], distance: Infinity },
})

const bishop = ({ color = 'white', x, y, bench = false }) => ({
  ...commonFunctions(),
  id: 'b' + getId(),
  x,
  y,
  bench,
  homeX: x,
  homeY: y,
  color,
  type: 'bishop',
  indicator: 'b',
  movePriority: 3,
  hp: 1,
  baseHp: 1,
  damage: 1,
  movement: { direction: [1, 3, 5, 7], distance: Infinity },
  attack: { direction: [1, 3, 5, 7], distance: Infinity },
})

const knight = ({ color = 'white', x, y, bench = false }) => ({
  ...commonFunctions(),
  id: 'n' + getId(),
  x,
  y,
  bench,
  homeX: x,
  homeY: y,
  color,
  type: 'knight',
  indicator: 'n',
  movePriority: 3,
  hp: 1,
  baseHp: 1,
  damage: 1,
})

const queen = ({ color = 'white', x, y, bench = false }) => ({
  ...commonFunctions(),
  id: 'q' + getId(),
  x,
  y,
  bench,
  homeX: x,
  homeY: y,
  color,
  type: 'queen',
  indicator: 'q',
  movePriority: 7,
  hp: 1,
  baseHp: 1,
  damage: 1,
  movement: { direction: [0, 1, 2, 3, 4, 5, 6, 7], distance: Infinity },
  attack: { direction: [0, 1, 2, 3, 4, 5, 6, 7], distance: Infinity },
})

const king = ({ color = 'white', x, y, bench = false }) => ({
  ...commonFunctions(),
  id: 'k' + getId(),
  x,
  y,
  bench,
  homeX: x,
  homeY: y,
  color,
  type: 'king',
  indicator: 'k',
  movePriority: 10,
  hp: 1,
  baseHp: 1,
  damage: 1,
  run: true,
  movement: { direction: [0, 1, 2, 3, 4, 5, 6, 7], distance: 1 },
  attack: { direction: [0, 1, 2, 3, 4, 5, 6, 7], distance: 1 },
  onDamage({ damage, attacker }) {
    // if (this.hp <= 0)
    //   console.log(
    //     'Game over!',
    //     this.color,
    //     'loses! Killed by',
    //     attacker.color,
    //     attacker.type
    //   )
    // else {
    //   console.log(
    //     this.color,
    //     this.type,
    //     'took',
    //     damage,
    //     'damage from',
    //     attacker.color,
    //     attacker.type
    //   )
    // }
  },
})

const pawn = ({ color = 'white', x, y, bench = false }) => ({
  ...commonFunctions(),
  id: 'p' + getId(),
  x,
  y,
  bench,
  homeX: x,
  homeY: y,
  color,
  type: 'pawn',
  indicator: 'p',
  movePriority: 1,
  hp: 1,
  baseHp: 1,
  damage: 1,
  movement: { direction: color === 'white' ? [4] : [0], distance: 1 },
  attack: { direction: color === 'white' ? [3, 5] : [7, 1], distance: 1 },
  onMove({ position }) {
    if (position && (position.isTop || position.isBottom)) {
      const queenObj = queen({ color: this.color, x: this.x, y: this.y })
      delete queenObj.id
      delete queenObj.homeX
      delete queenObj.homeY
      Object.keys(queenObj).forEach(key => {
        this[key] = queenObj[key]
      })
    }
  },
  onGameReset() {
    if (this.type === 'pawn') return
    const pawnObj = pawn({ color: this.color, x: this.x, y: this.y })
    delete pawnObj.id
    delete pawnObj.homeX
    delete pawnObj.homeY
    Object.keys(pawnObj).forEach(key => {
      this[key] = pawnObj[key]
    })
  },
})

export default {
  rook,
  bishop,
  knight,
  queen,
  king,
  pawn,
}
