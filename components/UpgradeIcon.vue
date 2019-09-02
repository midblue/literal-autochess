<template>
  <div class="icon" :class="type"></div>
</template>

<script>
export default {
  props: {
    type: {},
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
.icon {
  position: relative;
  width: 30px;
  height: 30px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;

  &:after {
    font-size: 1.1rem;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;
    left: 20%;
    top: 10%;
  }

  &.hp:after {
    content: '💛';
  }

  &.gold:after {
    font-size: 1.2rem;
    content: '💰';
  }

  &.piece:after {
    top: 4px;
    font-size: 1rem;
    content: '♟️';
  }
}
</style>
