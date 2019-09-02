<template>
  <span
    class="bench"
    ref="bench"
    :class="{nointeract: gameData, dropzone: dragging}"
    :style="{
      'grid-template-columns': `repeat(${this.player.dimensions.x}, ${columnWidth}px)`, height: `${columnWidth}px`, width: `${this.player.dimensions.x * columnWidth}px`}"
  >
    <MovablePiece
      v-for="piece, index in player.bench"
      :key="piece.id"
      :indicator="piece.indicator"
      :type="piece.type"
      :color="piece.color"
      :id="piece.id"
      @startdrag="$emit('startPieceDrag', $event)"
      @enddrag="$emit('endDrag', $event)"
      :bench="piece.bench"
    />
  </span>
</template>

<script>
import MovablePiece from '~/components/MovablePiece'

export default {
  components: { MovablePiece },
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
    columnWidth: {},
  },
  data() {
    return {}
  },
  computed: {
    dragging() {
      return !!this.$store.state.draggingPiece
    },
  },
  watch: {
    dragging(isDragging) {},
  },
  mounted() {},
  methods: {
    notify(notification) {
      this.$emit('notify', notification)
    },
  },
}
</script>

<style lang="scss" scoped>
.bench {
  margin-top: 10px;
  position: relative;
  display: grid;
  transition: background 0.2s;
  background: var(--bg-shade);

  &.dropzone {
    background: var(--highlight-light);
  }
}
</style>
