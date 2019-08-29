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
      boardEl: null,
      benchEl: null,
    }
  },
  computed: {},
  watch: {},
  mounted() {
    this.boardEl = this.$el.parentElement.parentElement.querySelector('.board')
    this.benchEl = this.$el.parentElement.parentElement.querySelector('.bench')
  },
  methods: {
    startDrag(e) {
      e.preventDefault()
      this.dragging = true
      this.$emit('startdrag')
      window.addEventListener('mouseup', this.dragEnd)
      window.addEventListener('mousemove', this.dragMove)
      window.addEventListener('touchend', this.dragEnd)
      window.addEventListener('touchmove', this.dragMove)
      this.startY = e.clientY || e.pageY
      this.startX = e.clientX || e.pageX
      this.dragY = 0
      this.dragX = 0
    },
    dragMove(e) {
      e.preventDefault()
      this.dragY = (e.clientY || e.pageY) - this.startY
      this.dragX = (e.clientX || e.pageX) - this.startX
    },
    dragEnd(e) {
      e.preventDefault()
      this.dragging = false
      window.removeEventListener('mouseup', this.dragEnd)
      window.removeEventListener('mousemove', this.dragMove)
      window.removeEventListener('touchend', this.dragEnd)
      window.removeEventListener('touchmove', this.dragMove)
      this.mouseUpListener = null
      this.mouseMoveListener = null

      const boardPosition = this.boardEl.getBoundingClientRect()
      const boardTop = boardPosition.top,
        boardLeft = boardPosition.left,
        boardWidth = boardPosition.width,
        boardHeight = boardPosition.height

      let newXPercent = ((e.clientX || e.pageX) - boardLeft) / boardWidth
      let newYPercent = ((e.clientY || e.pageY) - boardTop) / boardHeight

      // console.log(newXPercent, newYPercent)

      this.$emit('enddrag', {
        x: newXPercent,
        y: newYPercent,
        id: this.id,
        bench: this.bench,
      })

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
  z-index: 4;
  transform: scale(1.3, 1.3);
  box-shadow: 0 10px 10px var(--bg-shade3);
  background: var(--bg-overlay);
}
</style>
