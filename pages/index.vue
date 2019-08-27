<template>
  <main>
    <h2>Level {{player.level}}</h2>
    <button @click="newGame" :class="{hidden: runningGameData}">Start!</button>
    <br />
    <GameView
      :gameData="runningGameData"
      :player="player"
      :enemy="enemy"
      @done="done"
      @win="win"
      @updatePiece="updatePiece"
      @sendToBench="sendToBench"
      @playFromBench="playFromBench"
      @notify="notify"
    />
    <br />
    <Shop :gameData="runningGameData" :player="player" @notify="notify" />
    <br />
    <div>Health: {{player.hp}}</div>
    <div>Gold: {{player.gold}}</div>
    <transition name="notification">
      <div class="notification" v-if="notification">{{notification}}</div>
    </transition>
  </main>
</template>

<script>
import GameView from '~/components/GameView.vue'
import playerCreator from '~/assets/gameEngine/player'
import levels from '~/assets/levels'
import Shop from '~/components/Shop'

export default {
  components: {
    GameView,
    Shop,
  },
  data() {
    return {
      player: playerCreator({
        isHuman: true,
        color: 'black',
        pieces: [
          // { type: 'rook', color: 'black', x: 0, y: 7 },
          // { type: 'rook', color: 'black', x: 7, y: 7 },
          // { type: 'bishop', color: 'black', x: 1, y: 7 },
          // { type: 'bishop', color: 'black', x: 6, y: 7 },
          // { type: 'knight', color: 'black', x: 2, y: 7 },
          // { type: 'knight', color: 'black', x: 5, y: 7 },
          // { type: 'queen', color: 'black', x: 4, y: 7 },
          // { type: 'pawn', color: 'black', x: 0, y: 6 },
          // { type: 'pawn', color: 'black', x: 1, y: 6 },
          // { type: 'pawn', color: 'black', x: 2, y: 6 },
          // { type: 'pawn', color: 'black', x: 3, y: 6 },
          // { type: 'pawn', color: 'black', x: 4, y: 6 },
          // { type: 'pawn', color: 'black', x: 5, y: 6 },
          // { type: 'pawn', color: 'black', x: 6, y: 6 },
          { type: 'king', color: 'black', x: 3, y: 7 },
        ],
        bench: [{ type: 'pawn', color: 'black', bench: 0 }],
      }),
      enemy: playerCreator({
        pieces: levels(1),
      }),
      runningGameData: null,
      notification: ``,
    }
  },
  methods: {
    done() {
      this.runningGameData = null
      this.player.onGameReset()
      this.enemy = playerCreator({
        pieces: levels(this.player.level),
      })
    },
    win(didWin) {
      if (didWin) this.player.levelUp()
      this.player.addGold(didWin)
      if (!didWin) this.player.takeDamage(1)
      // todo adjust damage based on pieces?
      if (this.player.hp <= 0) {
        alert('game over!')
        //todo reset game
      }
    },
    newGame() {
      this.runningGameData = this.player.playVs(this.enemy)
    },
    sendToBench(id) {
      const result = this.player.sendToBench(id)
      if (!result.error) {
        this.$set(this.player, 'pieces', [...this.player.pieces])
        this.$set(this.player, 'bench', [...this.player.bench])
      } // else this.notify(result.msg)
    },
    playFromBench(props) {
      const result = this.player.playFromBench(props)
      if (!result.error) {
        this.$set(this.player, 'pieces', [...this.player.pieces])
        this.$set(this.player, 'bench', [...this.player.bench])
      } else this.notify(result.msg)
    },
    updatePiece(updatedProps) {
      const result = this.player.updatePiece(updatedProps)
      if (!result.error)
        this.$set(this.player, 'pieces', [...this.player.pieces])
      else this.notify(result.msg)
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
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.hidden {
  opacity: 0;
  pointer-events: none;
}

.notification {
  position: absolute;
  z-index: 5;
  top: 40%;
  left: 50%;
  transform: translatex(-50%) translateY(-50%);
  color: blueviolet;
  background: rgba(white, 0.9);
  padding: 10px 20px;
  font-size: 1.2em;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 5px 10px rgba(black, 0.2);
  pointer-events: none;
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
