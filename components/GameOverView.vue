<template>
  <div class="gameoverview">
    <h2>Game Over!</h2>
    <div class="sub">
      You made it to
      <b>level {{player.level}}</b>.
    </div>
    <div class="sectionlabel">High Scores</div>
    <div class="score">
      <span class="sub">
        <b>Name</b>
      </span>
      <span class="sub">
        <b>Level</b>
      </span>
    </div>
    <div
      v-for="score, index in highScores"
      :key="index"
      class="score"
      :class="{highlight: player.name && player.name === score.name && score.level === player.level}"
    >
      <span class="sub">{{score.name}}</span>
      <span class="sub">{{score.level}}</span>
    </div>
    <button @click="$emit('newGame')">Play Again</button>
  </div>
</template>

<script>
import firestore from '~/assets/firestore'

export default {
  components: {},
  props: {
    player: {},
  },
  data() {
    return {
      highScores: [],
    }
  },
  computed: {},
  async created() {
    this.highScores = await firestore.getHighScores()
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
.gameoverview {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.sectionlabel,
button {
  margin-top: 20px;
}

.score {
  width: 100%;
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 10px;

  &.highlight {
    background: var(--highlight-light);
  }
}
</style>
