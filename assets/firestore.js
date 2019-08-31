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

let highScores, gamesCompleted, gamesPlayed, levelCounts

const statsCollection = db.collection('stats')

export default {
  async getHighScores() {
    if (!highScores) await getHighScores()
    return highScores
  },

  async getGamesCompleted() {
    if (!gamesCompleted) await getGameStats()
    return gamesCompleted
  },

  async getGamesPlayed() {
    if (!gamesPlayed) await getGameStats()
    return gamesPlayed
  },

  async getLevelCounts() {
    if (!levelCounts) await getLevelCounts()
    return levelCounts
  },

  async gameEnd(player) {
    return await addGameCompleted(player)
  },

  addHighScore,

  newGame() {
    addGameStarted()
  },

  async levelRatio(level) {
    if (!levelCounts) await getLevelCounts()
    if (!gamesCompleted) await getGameStats()

    let total = 0
    while (level < 1000) {
      total += levelCounts[level] || 0
      level++
    }
    return total / gamesCompleted
  },
}

function getGameStats() {
  if (gamesCompleted) return
  return statsCollection
    .doc('totals')
    .get()
    .then(doc => {
      // console.log(doc.data())
      gamesCompleted = doc.data().gamesCompleted
      gamesPlayed = doc.data().gamesPlayed
    })
}

function getHighScores() {
  if (highScores) return
  return statsCollection
    .doc('highScores')
    .get()
    .then(doc => {
      // console.log(doc.data())
      highScores = doc.data().list
    })
}

function getLevelCounts() {
  if (levelCounts) return
  statsCollection
    .doc('levelCounts')
    .get()
    .then(doc => {
      // console.log(doc.data())
      levelCounts = doc.data()
    })
}

function addGameStarted() {
  statsCollection
    .doc('totals')
    .update({ gamesPlayed: firebase.firestore.FieldValue.increment(1) })
}

async function addGameCompleted(player) {
  statsCollection
    .doc('totals')
    .update({ gamesCompleted: firebase.firestore.FieldValue.increment(1) })
  statsCollection
    .doc('levelCounts')
    .update({ [player.level]: firebase.firestore.FieldValue.increment(1) })

  if (!highScores) await getHighScores()

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
  highScores.push({ level, name: name.substring(0, 14) })
  highScores = highScores.sort((a, b) => b.level - a.level)
  statsCollection.doc('highScores').update({ list: highScores })
  return highScores
}
