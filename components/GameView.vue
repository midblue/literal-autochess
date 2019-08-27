<template>
  <div class="gameview">
    <span
      class="board outlines"
      :style="{
      'grid-template-columns': `repeat(${dimensions.x}, ${columnWidth}px)`, 
      'grid-template-rows': `repeat(${dimensions.y}, ${columnWidth}px)`,
    }"
    >
      <div
        v-for="i in dimensions.x * dimensions.y"
        :key="'outline'+i"
        :class="{shade: shouldShadeGridElement(i)}"
      ></div>
    </span>
    <template v-if="gameData">
      <Stats
        class="statspane"
        :gameData="gameData"
        :playbackPosition="playbackPosition"
        :currentEvent="currentEvent"
      />
      <div class="winbanner" :class="{fade: fadeSlider}" v-if="winner">
        <div>
          <div>{{winner === 'black' ? 'You win!': 'You lost.'}}</div>
          <div
            class="sub"
          >You get {{player.previousWinnings.winGold}} gold for {{winner === 'black' ? 'winning' : 'playing' }}{{player.previousWinnings.interestGold ? `, and ${player.previousWinnings.interestGold} gold as interest.` : '.' }}</div>
        </div>
        <input
          type="range"
          v-model="playbackPosition"
          min="0"
          :max="gameData.length - 1"
          @mousedown="fadeSlider = true"
          @mouseup="fadeSlider = false"
        />
        <button @click="$emit('done')">{{winner === 'black' ? 'Next Level': 'Try Again'}}</button>
      </div>

      <transition-group
        class="board"
        name="grid"
        :style="{
      'grid-template-columns': `repeat(${dimensions.x}, ${columnWidth}px)`, 
      'grid-template-rows': `repeat(${dimensions.y}, ${columnWidth}px)`,
    }"
      >
        <Piece
          v-for="piece, index in currentGameState"
          :key="piece.id"
          :x="piece.x"
          :y="piece.y"
          :indicator="piece.indicator"
          :type="piece.type"
          :color="piece.color"
          :id="piece.id"
          :moving="movingId === piece.id"
        />
      </transition-group>

      <div
        v-for="popover in activePopovers"
        :key="popover.id"
        class="eventpopover"
        :style="{top: popover.y * (100/dimensions.y) + (50/dimensions.y) + '%', left:popover.x * (100/dimensions.x) + (50/dimensions.x) + '%' }"
      >{{popover.amount}}</div>
      <!-- <button  @click="toggleAuto">Auto</button> -->
      <!-- <button @click="advance">Advance</button>
      <button @click="reverse">Reverse</button>-->
    </template>

    <template v-else>
      <span
        class="board"
        :class="{dropzone: draggingPiece}"
        ref="board"
        :style="{
      'grid-template-columns': `repeat(${dimensions.x}, ${columnWidth}px)`, 
      'grid-template-rows': `repeat(${dimensions.y}, ${columnWidth}px)`,
    }"
      >
        <Piece
          v-for="piece, index in enemy.pieces"
          :key="piece.id"
          :x="piece.x"
          :y="piece.y"
          :indicator="piece.indicator"
          :type="piece.type"
          :color="piece.color"
          :id="piece.id"
        />
        <MovablePiece
          v-for="piece, index in player.pieces"
          :key="piece.id"
          :x="piece.x"
          :y="piece.y"
          :indicator="piece.indicator"
          :type="piece.type"
          :color="piece.color"
          :id="piece.id"
          @startdrag="startPieceDrag"
          @enddrag="placePiece"
          :boardElement="$refs.board"
          :benchElement="$refs.bench"
        />
      </span>
    </template>
    <br />
    <span
      class="bench"
      ref="bench"
      :class="{nointeract: gameData, dropzone: draggingPiece}"
      :style="{
      'grid-template-columns': `repeat(8, ${columnWidth}px)`, height: `${columnWidth}px`, width: `${8 * columnWidth}px`}"
    >
      <MovablePiece
        v-for="piece, index in player.bench"
        :key="piece.id"
        :indicator="piece.indicator"
        :type="piece.type"
        :color="piece.color"
        :id="piece.id"
        @startdrag="startPieceDrag"
        @enddrag="placePiece"
        :boardElement="$refs.board"
        :benchElement="$refs.bench"
        :bench="piece.bench"
      />
    </span>
  </div>
</template>

<script>
import Piece from '~/components/Piece'
import MovablePiece from '~/components/MovablePiece'
import Stats from '~/components/Stats'

export default {
  components: { Piece, MovablePiece, Stats },
  props: {
    dimensions: {
      type: Object,
      default: () => ({ x: 8, y: 8 }),
    },
    gameData: {
      type: Array,
      default: () => [],
    },
    player: {},
    enemy: {},
  },
  data() {
    return {
      autoSpeed: 200,
      currentSpeed: 200,
      columnWidth: 50,
      playbackPosition: -1,
      activePopovers: [],
      winner: null,
      auto: true,
      autoInterval: null,
      movingId: null,
      fadeSlider: false,
      draggingPiece: false,
    }
  },
  computed: {
    currentGameState() {
      if (!this.gameData || !this.gameData.length) return
      return JSON.parse(this.gameData[this.playbackPosition].gameState)
    },
    currentEvent() {
      if (!this.gameData || !this.gameData.length) return
      let newEvent = JSON.parse(this.gameData[this.playbackPosition].event)
      if (!Object.keys(newEvent).length) return
      return newEvent
    },
  },
  watch: {
    gameData() {
      this.playbackPosition = -1
      this.winner = null
      this.auto = true
      this.movingId = null
      this.currentSpeed = this.autoSpeed
      this.advance()
    },
    currentEvent(newEvent) {
      if (!newEvent) return
      this.movingId = null
      if (['damage', 'kill'].includes(newEvent.type)) {
        this.movingId = newEvent.from.id
        // this.activePopovers.push({
        //   x: newEvent.to.x,
        //   y: newEvent.to.y,
        //   amount: newEvent.amount,
        //   id: `${Math.random()}`.substring(2),
        // })
        // setTimeout(() => this.activePopovers.shift(), 3000)
      }
      if (newEvent.attackInPlace) {
        console.log('nomove')
      }
      if (newEvent.type === 'move') {
        this.movingId = newEvent.piece.id
        // todo highlight moves?
      }
      if (newEvent.type === 'end') {
        this.movingId = newEvent.from.id
        if (this.winner) return
        this.winner = newEvent.winner
        this.$emit('win', newEvent.winner === 'black')
      }
    },
  },
  methods: {
    advance() {
      if (!this.gameData || this.winner) return
      // gradually slow down
      this.currentSpeed =
        this.autoSpeed +
        this.autoSpeed * ((this.playbackPosition / this.gameData.length) * 2)

      setTimeout(this.advance, this.currentSpeed)
      if (this.playbackPosition < this.gameData.length - 1)
        this.playbackPosition++
    },
    reverse() {
      if (this.playbackPosition > 0) this.playbackPosition--
    },
    startPieceDrag() {
      this.draggingPiece = true
    },
    placePiece(newPosition) {
      this.draggingPiece = false
      const newX = Math.round(this.dimensions.x * newPosition.x - 0.5)
      const newY = Math.round(this.dimensions.y * newPosition.y - 0.5)
      // console.log(newX, newY)
      if (
        newX > this.dimensions.x - 1 ||
        newX < 0 ||
        newY > this.dimensions.y - 1 ||
        newY < 0
      ) {
        // toBench!
        this.$emit('sendToBench', newPosition.id)
        return
      }
      if (newPosition.bench !== false)
        this.$emit('playFromBench', {
          x: newX,
          y: newY,
          id: newPosition.id,
        })
      else
        this.$emit('updatePiece', {
          homeX: newX,
          homeY: newY,
          id: newPosition.id,
        })
    },
    shouldShadeGridElement(index) {
      if (this.dimensions.x % 2 === 1) return index % 2 === 1
      //even number
      const repeat = this.dimensions.x * 2
      while (index > repeat) index -= repeat
      if (index <= this.dimensions.x) return index % 2 === 0
      return index % 2 === 1
    },
  },
  mounted() {
    setTimeout(this.advance, this.currentSpeed)
  },
}
</script>

<style lang="scss" scoped>
.gameview {
  position: relative;

  .board {
    position: relative;
    display: grid;
    z-index: 1;
    transition: background 0.2s;
    background: rgba(black, 0.02);

    &.dropzone {
      background: linear-gradient(
        to bottom,
        rgba(white, 0.2) 50%,
        rgba(gold, 0.1) 50%
      );
    }

    &.outlines {
      background: none;
      position: absolute;
      pointer-events: none;
      z-index: 0;
      border: none;

      div {
        border: 1px solid rgba(black, 0.02);

        &.shade {
          background: rgba(black, 0.05);
        }
      }
    }
  }
}

.bench {
  position: relative;
  display: grid;
  z-index: 1;
  transition: background 0.2s;
  background: rgba(black, 0.02);

  &.dropzone {
    background: rgba(gold, 0.1);
  }
}

.statspane {
  position: absolute;
  top: 0;
  left: 110%;
}

.nointeract {
  pointer-events: none;
  opacity: 0.6;
}

.eventpopover {
  font-size: 1.4em;
  font-weight: 800;
  position: absolute;
  color: red;
  transform: translateX(-50%) translateY(-50%);
  z-index: 3;
  animation-name: fadeup;
  animation-duration: 1s;
}

.winbanner {
  text-align: center;
  font-size: 1.5rem;
  position: absolute;
  top: 50%;
  left: 50%;
  background: rgba(white, 0.95);
  transform: translateX(-50%) translateY(-50%);
  padding: 20px 30px;
  z-index: 5;
  min-width: 60%;
  transition: all 0.2s;

  &.fade {
    opacity: 0.3;
  }
}

.sub {
  font-size: 1rem;
  opacity: 0.8;
}

@keyframes fadeup {
  from {
    transform: translateX(-50%) translateY(-50%);
  }
  to {
    transform: translateX(-50%) translateY(-350%);
    opacity: 0;
  }
}

.grid-move {
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  z-index: 2;
}
.grid-leave-active {
  display: none;
}
</style>
