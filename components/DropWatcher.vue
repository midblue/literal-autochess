<template></template>

<script>
export default {
  props: {
    elementsToWatch: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {}
  },
  computed: {
    draggingPiece() {
      return this.$store.state.draggingPiece
    },
  },
  watch: {
    draggingPiece(isDragging, droppedPiece) {
      if (isDragging) {
        // possibly have hover updates
      }

      if (!isDragging && droppedPiece) {
        let xPercent, yPercent
        this.elementsToWatch.find(element => {
          const elPosition = (element.el.$el
              ? element.el.$el
              : element.el
            ).getBoundingClientRect(),
            xPercent =
              (droppedPiece.dragX - elPosition.left) / elPosition.width,
            yPercent = (droppedPiece.dragY - elPosition.top) / elPosition.height
          // console.log(
          //   element.name,
          //   xPercent,
          //   yPercent,
          //   elPosition,
          //   droppedPiece.dragX,
          //   droppedPiece.dragY
          // )
          if (
            xPercent >= 0 &&
            xPercent <= 1 &&
            yPercent >= 0 &&
            yPercent <= 1
          ) {
            this.$emit('drop', {
              droppedEl: element,
              piece: droppedPiece,
              xPercent,
              yPercent,
            })
            return true
          }
        })
      }
    },
  },
  mounted() {},
  methods: {},
}
</script>
