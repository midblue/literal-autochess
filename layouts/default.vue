<template>
  <nuxt />
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css?family=Arvo:400,700&display=swap');

$font-stack: 'Arvo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  'Helvetica Neue', Arial, sans-serif;

html,
body {
  font-family: $font-stack;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
  margin: 0;
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
  font-family: $font-stack;
}

button {
  padding: 10px 20px;
  font-size: 1rem;
  background: rgba(gold, 0.6);
  // border:1px solid rgba(black, 0.2);
  border: none;
  transition: all 0.2s;

  &:hover {
    background: gold;
    cursor: pointer;
  }
}

.sectionlabel {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 2px;
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>
