<template>
  <main :style="{width: this.gamePixelWidth + 'px'}">
    <template v-if="view === 'game'">
      <div class="topbar">
        <h2>Level {{player.level}}</h2>
        <button class="tallbutton" @click="newGame" v-if="!runningGameData">Start Round</button>
        <div v-else class="sub">Turn {{turn}}</div>
      </div>
      <div class="playerstats">
        <div>
          <UpgradeIcon type="hp" />
          <span style="position: relative; top: -5px; left: -5px;">
            <b>{{player.hp}}</b>
          </span>
        </div>
        <div>
          <UpgradeIcon type="gold" />
          <span style="position: relative; top: -5px; left: -5px;">
            <b>{{player.gold}}</b>
          </span>
        </div>
        <div>
          <UpgradeIcon type="piece" />
          <span style="position: relative; top: -5px; left: -5px;">
            <b>{{player.pieceLimit}}</b>
          </span>
        </div>
      </div>
      <GameView
        :gameData="runningGameData"
        :player="player"
        :enemy="enemy"
        :dimensions="player.dimensions"
        @next="prepareNextRound"
        @playbackFinished="playbackFinished"
        @playbackPosition="playbackPosition"
        @updatePiece="updatePiece"
        @sendToBench="sendToBench"
        @playFromBench="playFromBench"
        @sell="sell"
        @notify="notify"
        :gamePixelWidth="gamePixelWidth"
      />
      <transition name="notification">
        <div class="notification" v-if="notification">{{notification}}</div>
      </transition>
    </template>
    <GameOverView v-else :player="player" @newGame="resetEntireGame" />
  </main>
</template>

<script>
import GameView from '~/components/GameView.vue'
import GameOverView from '~/components/GameOverView.vue'
import UpgradeIcon from '~/components/UpgradeIcon'
import playerCreator from '~/assets/gameEngine/player'
import levels from '~/assets/levels'
import firestore from '~/assets/firestore'

export default {
  components: {
    GameView,
    GameOverView,
    UpgradeIcon,
  },
  data() {
    return {
      view: 'game',
      gamePixelWidth: 350,
      player: this.getNewPlayer(),
      enemy: {},
      runningGameData: null,
      notification: ``,
      turn: 0,
    }
  },
  mounted() {
    this.resetEntireGame()
  },
  methods: {
    getNewPlayer() {
      return playerCreator({
        isHuman: true,
        color: 'black',
        pieces: [
          { type: 'king', color: 'black', x: 3, y: 7 },
          { type: 'pawn', color: 'black', x: 0, y: 4 },
        ],
        bench: [],
        gold: 3,
        dimensions: { x: 8, y: 8 },
      })
    },
    resetEntireGame() {
      firestore.newGame()
      this.player = this.getNewPlayer()
      this.prepareNextRound()
      this.view = 'game'
    },
    async prepareNextRound() {
      if (this.player.hp <= 0) {
        if (await firestore.gameEnd(this.player)) {
          // is high score
          const name = prompt('High score! Enter your name.')
          this.player.name = name
          await firestore.addHighScore(this.player)
        }
        this.view = 'gameover'
        return
      }

      this.runningGameData = null
      this.player.onGameReset()
      this.enemy = playerCreator({
        pieces: levels(this.player.level, this.player.dimensions),
      })
    },
    playbackPosition(newPosition) {
      this.turn = newPosition
    },
    playbackFinished(didWin) {
      this.player.resetPreviousGold()
      if (didWin === true) this.player.levelUp()
      if (didWin !== undefined) this.player.addGold(didWin)
      if (didWin === false) this.player.takeDamage(1)
      // todo adjust damage based on pieces?
    },
    newGame() {
      if (this.runningGameData) return
      this.runningGameData = this.player.playVs(this.enemy)
      // todo sometimes getting free pieces on bench???
    },
    sendToBench(id) {
      const result = this.player.sendToBench(id)
      if (!result.error) {
        this.$set(this.player, 'pieces', [...this.player.pieces])
        this.$set(this.player, 'bench', [...this.player.bench])
      } else {
        console.log(result.context)
        if (result.notify) this.notify(result.msg)
      }
    },
    playFromBench(props) {
      const result = this.player.playFromBench(props)
      if (!result.error) {
        this.$set(this.player, 'pieces', [...this.player.pieces])
        this.$set(this.player, 'bench', [...this.player.bench])
      } else {
        console.log(result.context)
        if (result.notify) this.notify(result.msg)
      }
    },
    updatePiece(updatedProps) {
      const result = this.player.updatePiece(updatedProps)
      if (!result.error)
        this.$set(this.player, 'pieces', [...this.player.pieces])
      else {
        console.log(result.context)
        if (result.notify) this.notify(result.msg)
      }
    },
    sell({ id, type }) {
      const result = this.player.sellPiece(id, type)
      if (!result.error) {
        this.notify(`Sold for ${result} gold.`)
        this.$set(this.player, 'pieces', [...this.player.pieces])
      } else {
        console.log(result.context)
        if (result.notify) this.notify(result.msg)
      }
    },
    notify(notification) {
      this.notification = notification
      setTimeout(() => (this.notification = ''), 2000)
    },
  },
}
</script>

<style lang="scss" scoped>
main {
  user-select: none;
  position: relative;
  height: 100%;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.topbar {
  width: 100%;
  height: 25px;
  // margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}
.tallbutton {
  position: relative;
  top: 12px;
  padding: 16px 20px;
}

.hidden {
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

.playerstats {
  width: 100%;
  height: 20px;
  position: relative;
  z-index: 1;
  left: -5px;
  margin-top: 5px;
  margin-bottom: 15px;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  & > *:not(:last-of-type) {
    margin-right: 5px;
  }
}

.notification {
  position: absolute;
  z-index: 5;
  top: 48%;
  left: 50%;
  transform: translatex(-50%) translateY(-50%);
  color: var(--info);
  background: var(--bg-overlay);
  padding: 10px 20px;
  font-size: 1.2em;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 5px 10px var(--bg-shade3);
  pointer-events: none;
  min-width: 70%;
}

.notification-enter,
.notification-leave-to {
  opacity: 0;
}

.notification-enter-active {
  transition: all 0.1s;
}
.notification-leave-active {
  transition: all 0.5s;
}
</style>
