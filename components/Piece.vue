<template>
  <div
    class="piece"
    :class="type + ' ' + (color || 'white') + ' ' + (moving ? 'moving' : '') + ' ' + (damage ? 'damage' : '')"
    :style="{'grid-column': bench !== false ? `${bench + 1}/${bench+2}` : (x + 1) + '/' + (x+2), 'grid-row': bench !== false ? '1/2' : (y + 1) + '/' + (y+2)}"
  >
    <div
      :style="{'background': `url('/autochess/pieceImages/${color.substring(0,1) + indicator.substring(0,1)}.svg')`}"
    ></div>
  </div>
</template>

<script>
export default {
  props: {
    x: { default: 0 },
    y: { default: 0 },
    type: {},
    color: {
      default: 'white',
    },
    moving: { default: false },
    damage: { default: false },
    indicator: {},
    bench: { default: false },
  },
  data() {
    return {}
  },
  computed: {},
  watch: {},
  methods: {},
  mounted() {},
}
</script>

<style lang="scss" scoped>
.piece {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 50px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  transition: box-shadow 0.2s, transform 0.2s, opacity 0.2s, background 0.2s;
  // todo not animating properly

  div {
    width: 100%;
    height: 100%;
    // border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    // box-shadow: 0 3px 3px rgba(black, 0.1);
    background-size: contain;
    background-repeat: no-repeat;
  }

  &.pawn div {
    opacity: 0.75;
    width: 75%;
    height: 75%;
  }

  &.rook div,
  &.bishop div,
  &.knight div {
    width: 85%;
    height: 85%;
  }

  &.king div {
    border: 4px solid gold;
  }
}

.moving {
  transition: background 0.4s, box-shadow 0.4s, transform 0.4s, opacity 0.4s;
  transform: scale(1.3, 1.3);
  background: rgba(white, 0.8);
  box-shadow: 0 3px 12px rgba(black, 0.3);
  z-index: 2;

  div {
    opacity: 1 !important;
  }
}
.damage {
  transition: background 0.4s;
  background: rgba(red, 0.5) !important;
}
</style>
