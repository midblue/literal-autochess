<template>
  <Piece
    class="movable"
    :class="{dragging}"
    :x="x"
    :y="y"
    :type="type"
    :bench="bench"
    :color="color"
    :indicator="indicator"
    @mousedown.native="startDrag"
    @touchstart.native="startDrag"
    :style="{top: dragY + 'px', left: dragX + 'px'}"
  />
</template>

<script>
import Piece from '~/components/Piece'
export default {
  components: { Piece },
  props: {
    x: {},
    y: {},
    type: {},
    color: {
      default: 'white',
    },
    id: {},
    indicator: {},
    bench: { default: false },
  },
  data() {
    return {
      dragging: false,
      startY: 0,
      startX: 0,
      dragY: 0,
      dragX: 0,
    }
  },
  computed: {},
  watch: {},
  mounted() {
    // this.boardEl = this.$el.parentElement.parentElement.querySelector('.board')
    // this.benchEl = this.$el.parentElement.parentElement.querySelector('.bench')
  },

  methods: {
    startDrag(e) {
      e.preventDefault()
      this.dragging = true
      this.$emit('startdrag')
      window.addEventListener('mouseup', this.dragEnd, { passive: false })
      window.addEventListener('mousemove', this.dragMove, { passive: false })
      window.addEventListener('touchend', this.dragEnd, { passive: false })
      window.addEventListener('touchcancel', this.dragEnd, { passive: false })
      window.addEventListener('touchmove', this.dragMove, { passive: false })
      this.startY = e.clientY || e.pageY || e.touches[0].clientY
      this.startX = e.clientX || e.pageX || e.touches[0].clientX
      this.dragY = 0
      this.dragX = 0

      this.$store.commit('set', {
        draggingPiece: {
          type: this.type,
          id: this.id,
          bench: this.bench,
          dragX: this.startX,
          dragY: this.startY,
        },
      })
    },
    dragMove(e) {
      e.preventDefault()
      this.dragY = (e.clientY || e.pageY || e.touches[0].clientY) - this.startY
      this.dragX = (e.clientX || e.pageX || e.touches[0].clientX) - this.startX

      this.$store.commit('set', {
        draggingPiece: {
          type: this.type,
          id: this.id,
          bench: this.bench,
          dragX: e.clientX || e.pageX || e.touches[0].clientX,
          dragY: e.clientY || e.pageY || e.touches[0].clientY,
        },
      })
    },
    dragEnd(e) {
      e.preventDefault()
      // console.log(e)
      this.dragging = false
      window.removeEventListener('mouseup', this.dragEnd)
      window.removeEventListener('mousemove', this.dragMove)
      window.removeEventListener('touchend', this.dragEnd)
      window.removeEventListener('touchcancel', this.dragEnd)
      window.removeEventListener('touchmove', this.dragMove)
      this.mouseUpListener = null
      this.mouseMoveListener = null

      this.$store.commit('set', { draggingPiece: null })

      // const boardPosition = this.boardEl.getBoundingClientRect()
      // const boardTop = boardPosition.top,
      //   boardLeft = boardPosition.left,
      //   boardWidth = boardPosition.width,
      //   boardHeight = boardPosition.height

      // let x = e.clientX || e.pageX || e.changedTouches[0].clientX,
      //   y = e.clientY || e.pageY || e.changedTouches[0].clientY,
      //   newXPercent = (x - boardLeft) / boardWidth,
      //   newYPercent = (y - boardTop) / boardHeight

      // // console.log(x, y, boardPosition, newXPercent, newYPercent)

      // this.$emit('enddrag', {
      //   x: newXPercent,
      //   y: newYPercent,
      //   id: this.id,
      //   bench: this.bench,
      // })

      this.$nextTick(() => {
        this.dragY = 0
        this.dragX = 0
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.movable {
  cursor: move;
  position: absolute;
  transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
}
.dragging {
  position: absolute;
  z-index: 5;
  transform: scale(1.3, 1.3);
  box-shadow: 0 10px 10px var(--bg-shade3);
  background: var(--bg-overlay);
}
</style>
