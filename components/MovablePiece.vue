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
      this.startY = e.clientY
      this.startX = e.clientX
      this.dragY = 0
      this.dragX = 0
    },
    dragMove(e) {
      e.preventDefault()
      this.dragY = e.clientY - this.startY
      this.dragX = e.clientX - this.startX
    },
    dragEnd(e) {
      e.preventDefault()
      this.dragging = false
      window.removeEventListener('mouseup', this.dragEnd)
      window.removeEventListener('mousemove', this.dragMove)
      this.mouseUpListener = null
      this.mouseMoveListener = null

      const boardPosition = this.boardEl.getBoundingClientRect()
      const boardTop = boardPosition.top,
        boardLeft = boardPosition.left,
        boardWidth = boardPosition.width,
        boardHeight = boardPosition.height

      let newXPercent = (e.clientX - boardLeft) / boardWidth
      let newYPercent = (e.clientY - boardTop) / boardHeight

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
}
.dragging {
  position: absolute;
}
</style>
