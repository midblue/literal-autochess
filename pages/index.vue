<template>
  <main>
    <div class="topbar">
      <h2>Level {{player.level}}</h2>
      <button @click="newGame" :class="{hidden: runningGameData}">Start Round!</button>
    </div>
    <div class="playerstats">
      <div>Health: {{player.hp}}</div>
      <div>Gold: {{player.gold}}</div>
      <div v-if="runningGameData">Turn: {{turn}}</div>
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
      @notify="notify"
    />
    <Shop class="shop" :gameData="runningGameData" :player="player" @notify="notify" />
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
        pieces: [{ type: 'king', color: 'black', x: 3, y: 5 }],
        bench: [{ type: 'pawn', color: 'black', bench: 0 }],
        dimensions: { x: 6, y: 6 },
      }),
      enemy: {},
      runningGameData: null,
      notification: ``,
      turn: 0,
    }
  },
  mounted() {
    this.prepareNextRound()
  },
  methods: {
    prepareNextRound() {
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
      if (didWin === true) this.player.levelUp()
      this.player.addGold(didWin)
      if (didWin === false) this.player.takeDamage(1)
      // todo adjust damage based on pieces?
      if (this.player.hp <= 0) {
        alert('game over!')
        //todo reset game
      }
    },
    newGame() {
      if (this.runningGameData) return
      this.runningGameData = this.player.playVs(this.enemy)
    },
    sendToBench(id) {
      const result = this.player.sendToBench(id)
      if (!result.error) {
        this.$set(this.player, 'pieces', [...this.player.pieces])
        this.$set(this.player, 'bench', [...this.player.bench])
      } else if (result.notify) this.notify(result.msg)
    },
    playFromBench(props) {
      const result = this.player.playFromBench(props)
      if (!result.error) {
        this.$set(this.player, 'pieces', [...this.player.pieces])
        this.$set(this.player, 'bench', [...this.player.bench])
      } else if (result.notify) this.notify(result.msg)
    },
    updatePiece(updatedProps) {
      const result = this.player.updatePiece(updatedProps)
      if (!result.error)
        this.$set(this.player, 'pieces', [...this.player.pieces])
      else if (result.notify) this.notify(result.msg)
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
  width: 300px;
  height: 100vh;
  display: flex;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.topbar {
  width: 100%;
  // margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hidden {
  opacity: 0;
  pointer-events: none;
}

.playerstats {
  width: 100%;
  margin-top: 10px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  & > *:not(:last-of-type) {
    margin-right: 20px;
  }
}

.shop {
  margin-top: 10px;
}

.notification {
  position: absolute;
  z-index: 5;
  top: 45%;
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
