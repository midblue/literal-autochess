<template>
  <nuxt />
</template>

<script>
export default {
  data() {
    return {
      preloadedImages: [],
    }
  },
  mounted() {
    document.addEventListener('touchmove', () => {
      event.preventDefault()
    })
    for (let i of [
      'bp',
      'bq',
      'bk',
      'bn',
      'bb',
      'br',
      'wp',
      'wk',
      'wq',
      'wb',
      'wn',
      'wr',
    ]) {
      const img = new Image()
      img.src = `/autochess/pieceImages/${i}.svg`
      this.preloadedImages.push(img)
    }
  },
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Arvo:400,700&display=swap');

:root {
  --font-stack: 'Arvo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
  --action: gold;
  --action-light: rgb(255, 234, 115);
  --highlight: gold;
  --highlight-light: rgba(255, 217, 0, 0.192);
  --text: #222;
  --bg: white;
  --bg-overlay: rgba(255, 255, 255, 0.95);
  --bg-fade: rgba(255, 255, 255, 0.2);
  --bg-shade: rgba(0, 0, 0, 0.02);
  --bg-shade2: rgba(0, 0, 0, 0.05);
  --bg-shade3: rgba(0, 0, 0, 0.25);
  --damage: red;
  --damage-fade: rgba(255, 0, 0, 0.5);
  --info: purple;
}

html,
body {
  font-family: var(--font-stack);
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  margin: 0;
  color: var(--text);
  background: var(--bg);

  & > *,
  &,
  & > * > * {
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

input,
button,
textarea {
  font-family: var(--font-stack);
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  background: var(--action-light);
  // border:1px solid rgba(black, 0.2);
  border: none;
  transition: all 0.2s;

  &:hover {
    background: var(--action);
    cursor: pointer;
  }
}

.sub {
  font-size: 1rem;
  opacity: 0.8;
  line-height: 1.6;
}
.sub2 {
  font-size: 0.8rem;
  opacity: 0.7;
  line-height: 1.6;
}

.sectionlabel {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 2px;
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>
