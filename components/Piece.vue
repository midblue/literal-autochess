<template>
  <div
    class="piece"
    :class="type + ' ' + (color || 'white') + ' ' + (moving ? 'moving' : '') + ' ' + (damage ? 'damage' : '')"
    :style="{'grid-column': bench !== false ? `${bench + 1}/${bench+2}` : (x + 1) + '/' + (x+2), 'grid-row': bench !== false ? '1/2' : (y + 1) + '/' + (y+2)}"
  >
    <div
      class="pieceicon"
      :style="{'background': `url('/autochess/pieceImages/${color.substring(0,1) + indicator.substring(0,1)}.svg')`}"
    ></div>
    <div class="piecebg"></div>
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
  --endspeed: 0.3s;
  --startspeed: 0.15s;
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  div {
    width: 100%;
    height: 100%;
  }

  .pieceicon {
    display: flex;
    align-items: center;
    justify-content: center;
    background-size: contain;
    background-repeat: no-repeat;
    transition: transform var(--endspeed), opacity var(--endspeed);
    z-index: 3;
  }

  .piecebg {
    position: absolute;
    top: 0;
    left: 0;
    transform: scale(1, 1);
    background: transparent;
    box-shadow: none;
    transition: box-shadow var(--endspeed), transform var(--endspeed),
      opacity var(--endspeed), background var(--endspeed);
    z-index: 2;
  }

  &.pawn .pieceicon {
    opacity: 0.75;
    width: 75%;
    height: 75%;
  }

  &.rook .pieceicon,
  &.bishop .pieceicon,
  &.knight .pieceicon {
    width: 85%;
    height: 85%;
  }

  &.king .pieceicon {
    border: 4px solid var(--highlight);
  }
}

.moving {
  z-index: 2;

  .piecebg {
    transition: background var(--startspeed), box-shadow var(--startspeed),
      transform var(--startspeed), opacity var(--startspeed);
    transform: scale(1.3, 1.3);
    background: var(--bg-overlay);
    box-shadow: 0 3px 12px var(--bg-shade3);
  }

  .pieceicon {
    transition: background var(--startspeed), box-shadow var(--startspeed),
      transform var(--startspeed), opacity var(--startspeed);
    transform: scale(1.3, 1.3);
    opacity: 1 !important;
  }
}

.damage .piecebg {
  background: var(--damage-fade) !important;
}
</style>
