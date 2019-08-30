let firebase, db

if (!firebase) {
  firebase = require('firebase/app')
  require('firebase/firestore')

  firebase.initializeApp({
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    projectId: process.env.FIREBASE_PROJECTID,
  })

  db = firebase.firestore()
}

let highScores = [],
  gamesCompleted = 0,
  gamesPlayed = 0,
  levelCounts = []

const statsCollection = db.collection('stats')
statsCollection
  .doc('totals')
  .get()
  .then(doc => {
    // console.log(doc.data())
    gamesCompleted = doc.data().gamesCompleted
    gamesPlayed = doc.data().gamesPlayed + 1
  })
statsCollection
  .doc('levelCounts')
  .get()
  .then(doc => {
    // console.log(doc.data())
    levelCounts = doc.data()
  })
statsCollection
  .doc('highScores')
  .get()
  .then(doc => {
    // console.log(JSON.stringify(doc.data().list))
    highScores = doc.data().list
  })
// todo make a single call?

export default {
  getHighScores() {
    return highScores
  },
  getGamesCompleted() {
    return gamesCompleted
  },
  getGamesPlayed() {
    return gamesPlayed
  },
  getLevelCounts() {
    return levelCounts
  },
  gameEnd(player) {
    return addGameCompleted(player)
  },
  addHighScore,
  newGame() {
    addGameStarted()
  },
  levelRatio(level) {
    let total = 0
    while (level < 1000) {
      total += levelCounts[level] || 0
      level++
    }
    return total / gamesCompleted
  },
}

function addGameStarted() {
  statsCollection
    .doc('totals')
    .update({ gamesPlayed: firebase.firestore.FieldValue.increment(1) })
}

function addGameCompleted(player) {
  statsCollection
    .doc('totals')
    .update({ gamesCompleted: firebase.firestore.FieldValue.increment(1) })
  statsCollection
    .doc('levelCounts')
    .update({ [player.level]: firebase.firestore.FieldValue.increment(1) })

  const foundLowerHighScore = highScores.find(hs => hs.level <= player.level)
  if (highScores.length < 10 || foundLowerHighScore !== undefined) {
    return true
  }
}

function addHighScore({ level, name }) {
  if (
    /(nigger|fag|spic|wetback|towelhead|nigga|fuck|shit|cunt|cock|bitch)/gi.exec(
      name
    )
  )
    return alert('Nope! No names like that, please!')
  const foundLowerHighScore = !!highScores.find(hs => hs.level <= level)
  if (foundLowerHighScore && highScores.length >= 10) highScores.pop()
  highScores.push({ level, name })
  highScores = highScores.sort((a, b) => b.level - a.level)
  statsCollection.doc('highScores').update({ list: highScores })
  return highScores
}
