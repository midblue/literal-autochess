<template>
  <div class="winbanner" :class="{fade: isScrubbing}">
    <div>
      <h3>{{winner === 'black' ? 'You win!': winner === 'stalemate' ? `It's a draw!` : 'You lost.'}}</h3>
      <template v-if="player.hp > 0">
        <div v-if="player.previousWinnings.winGold" class="sub">
          You get
          <b>{{player.previousWinnings.winGold}} gold</b>
          for {{winner === 'black' ? 'winning' : 'playing' }}{{player.previousWinnings.interestGold ? `, and ${player.previousWinnings.interestGold} gold as interest.` : '.' }}
        </div>
      </template>
      <div class="sub" v-if="winner === 'black' && levelRatio < 100">
        Only
        <b>{{levelRatio}}%</b> of players make it this far.
      </div>
    </div>
    <input
      class="scrubber"
      type="range"
      v-model="playbackPosition"
      min="0"
      :max="gameData.length - 1"
      @mousedown="isScrubbing = true"
      @mouseup="isScrubbing = false"
      @touchstart="isScrubbing = true"
      @touchend="isScrubbing = false"
      @touchcancel="isScrubbing = false"
    />
    <button @click="$emit('next')">
      {{player.hp > 0 ?
      winner === 'black' ?
      'Next Level':
      'Try Again'
      : 'See Scores'}}
    </button>
  </div>
</template>

<script>
import firestore from '~/assets/firestore'

export default {
  components: {},
  props: {
    winner: {},
    player: {},
    gameData: {},
  },
  data() {
    return {
      isScrubbing: false,
      levelRatio: 100,
      playbackPosition: 100,
    }
  },
  computed: {},
  async mounted() {
    this.playbackPosition = this.gameData.length - 1
    this.levelRatio = parseInt(
      (await firestore.levelRatio(this.player.level)) * 100
    )
  },
  watch: {
    playbackPosition() {
      this.$emit('playbackPosition', this.playbackPosition)
    },
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.winbanner {
  text-align: center;
  font-size: 1.5rem;
  position: absolute;
  top: 43%;
  left: 50%;
  background: rgba(white, 0.95);
  transform: translateX(-50%) translateY(-50%);
  padding: 20px 30px;
  z-index: 5;
  min-width: 85%;
  transition: all 0.2s;

  &.fade {
    opacity: 0.3;
  }
}
.scrubber {
  padding: 15px 0;
  width: 100%;
}
</style>
