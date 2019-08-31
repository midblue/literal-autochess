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
    if (!highScores) await getHighScoresFromServer()
    return highScores
  },

  async getGamesCompleted() {
    if (!gamesCompleted) await getGameStatsFromServer()
    return gamesCompleted
  },

  async getGamesPlayed() {
    if (!gamesPlayed) await getGameStatsFromServer()
    return gamesPlayed
  },

  async getLevelCounts() {
    if (!levelCounts) await getLevelCountsFromServer()
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
    if (!levelCounts) await getLevelCountsFromServer()
    if (!gamesCompleted) await getGameStatsFromServer()

    let total = 0
    while (level < 1000) {
      total += levelCounts[level] || 0
      level++
    }
    return total / gamesCompleted
  },
}

function getGameStatsFromServer() {
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

function getHighScoresFromServer() {
  if (highScores) return
  return statsCollection
    .doc('highScores')
    .get()
    .then(doc => {
      // console.log(doc.data())
      highScores = doc.data().list
    })
}

function getLevelCountsFromServer() {
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

  if (!highScores) await getHighScoresFromServer()

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
  if (!name) name = 'No Name'
  const foundLowerHighScore = !!highScores.find(hs => hs.level <= level)
  if (foundLowerHighScore && highScores.length >= 10) highScores.pop()
  highScores.push({ level, name: name.substring(0, 14) })
  highScores = highScores.sort((a, b) => b.level - a.level)
  statsCollection.doc('highScores').update({ list: highScores })
  return highScores
}
