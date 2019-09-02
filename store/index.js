export const state = () => ({
  draggingPiece: null,
})

export const mutations = {
  set(state, payload) {
    for (let prop in payload) {
      state[prop] = payload[prop]
    }
  },
}
