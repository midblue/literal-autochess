<template>
  <div class="stats" v-if="unitKillList.length">
    <transition-group name="grid">
      <div class="listing" v-for="piece in unitKillList" :key="piece.id">
        <Piece class="piece" v-bind="piece" />
        <span>{{piece.kills}} kill{{piece.kills === 1 ? '' : 's'}}</span>
      </div>
    </transition-group>
  </div>
</template>

<script>
import Piece from '~/components/Piece'

export default {
  components: { Piece },
  props: {
    gameData: {},
    playbackPosition: {},
    currentEvent: {},
  },
  data() {
    return {
      kills: [],
    }
  },
  computed: {
    unitKillList() {
      const list = []
      this.kills.forEach(k => {
        if (!list.find(p => p.id === k.piece.id))
          list.push({ kills: 0, ...k.piece })
        const found = list.find(p => p.id === k.piece.id)
        found.kills++
        found.type = k.piece.type // pawn -> queen
        // todo that line doesnt work
      })
      return list.sort((a, b) => b.kills - a.kills)
    },
  },
  watch: {
    gameData() {
      this.kills = []
    },
    playbackPosition(newPos, prevPos) {
      if (newPos < prevPos) {
        // going backwards
        this.kills = this.kills.filter(k => k.pos <= newPos)
      } else {
        if (
          !this.currentEvent ||
          !['kill', 'end'].includes(this.currentEvent.type)
        )
          return
        this.kills.push({ pos: newPos, piece: this.currentEvent.from })
      }
    },
  },
  mounted() {},
  methods: {},
}
</script>

<style lang="scss" scoped>
.stats {
  width: 100px;

  .listing {
    display: flex;
    align-items: center;
  }

  .piece {
    display: inline-block;
    height: 30px;
    width: 30px;
    margin-right: 10px;
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
