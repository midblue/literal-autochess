<template>
  <div class="shopholder" v-if="buyablePieces.length">
    <div class="shop">
      <div class="sectionlabel">Shop</div>
      <div
        v-for="piece, index in buyablePieces"
        :key="piece + index"
        class="shopitem"
        @click="buy(piece)"
        :class="{fade: prices.pieces[piece] > player.gold}"
      >
        <Piece
          class="piece"
          :type="piece"
          color="black"
          :indicator=" piece === 'knight' ? 'n' : piece.substring(0,1)"
        />
        <div class="price">{{ prices.pieces[piece]}}</div>
      </div>
    </div>
    <div class="notification" v-if="notification">{{notification}}</div>
  </div>
</template>

<script>
import Piece from '~/components/Piece'
import prices from '~/assets/pieceManagement/prices'
import pool from '~/assets/pieceManagement/buyPool'

export default {
  components: { Piece },
  props: {
    player: {},
    gameData: {},
  },
  data() {
    return {
      prices,
      buyablePieces: [],
      notification: '',
    }
  },
  computed: {},
  watch: {
    gameData(newData) {
      if (newData) this.resetItems()
    },
  },
  mounted() {
    this.resetItems()
  },
  methods: {
    resetItems() {
      this.buyablePieces = []
      for (let i = 0; i < 4; i++) {
        this.buyablePieces = [
          ...this.buyablePieces,
          pool[Math.floor(Math.random() * pool.length)],
        ]
      }
    },
    buy(item) {
      if (!prices.pieces[item]) return
      const success = this.player.buy(prices.pieces[item])
      if (success) {
        this.buyablePieces.splice(
          this.buyablePieces.findIndex(p => p === item),
          1
        )
        this.player.addPiece({ type: item, x: 3, y: 4, bench: true })
      } else {
        this.$emit('notify', 'Not enough money!')
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.shopholder {
  position: relative;
}
.shop {
  display: flex;
  align-items: center;

  & > *:not(:last-child) {
    margin-right: 15px;
  }

  .shopitem {
    flex: 1;
    cursor: pointer;
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: #eee;
    }

    &.fade {
      opacity: 0.3;
    }
  }

  .piece {
    width: 30px;
    height: 30px;
  }
}
</style>
