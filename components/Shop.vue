<template>
  <div class="shopholder" v-if="buyablePieces.length" :class="{dragging}">
    <div class="shop" v-if="!dragging">
      <div class="sectionlabel">Shop</div>
      <div
        v-for="item, index in buyablePieces"
        :key="item + index"
        class="shopitem"
        @click="buy(item)"
        :class="{fade: item.price > player.gold}"
      >
        <Piece
          v-if="item.type==='piece'"
          class="piece"
          :type="item.name"
          color="black"
          :indicator=" item.name === 'knight' ? 'n' : item.name.substring(0,1)"
        />
        <UpgradeIcon v-else :type="item.name" />
        <div class="price">{{ item.price }}</div>
      </div>
    </div>
    <div v-else class="sectionlabel">Drop here to sell ({{sellPrice}} gold)</div>
  </div>
</template>

<script>
import Piece from '~/components/Piece'
import UpgradeIcon from '~/components/UpgradeIcon'
import prices from '~/assets/pieceManagement/prices'
import pool from '~/assets/pieceManagement/buyPool'

// todo allow drag-into-play to buy

export default {
  components: { Piece, UpgradeIcon },
  props: {
    player: {},
    gameData: {},
    count: { default: 4 },
  },
  data() {
    return {
      prices,
      totalPool: [
        ...pool.pieces.map(p => ({
          name: p,
          type: 'piece',
          price: prices.pieces[p],
        })),
        ...pool.upgrades.map(p => ({
          name: p,
          type: 'upgrade',
          price: prices.upgrades[p],
        })),
      ],
      buyablePieces: [],
    }
  },
  computed: {
    dragging() {
      return this.$store.state.draggingPiece
    },
    sellPrice() {
      if (!this.dragging) return
      return prices.sell[this.dragging.type]
    },
  },
  watch: {
    gameData(newData) {
      if (!newData) this.resetItems()
    },
  },
  mounted() {
    this.resetItems()
  },
  methods: {
    resetItems() {
      this.buyablePieces = []
      for (let i = 0; i < this.count; i++) {
        this.buyablePieces.push(
          this.totalPool[Math.floor(Math.random() * this.totalPool.length)]
        )
      }
    },
    buy(item) {
      if (!item.price) return

      const success = this.player.buy(item.price)

      if (success) {
        this.buyablePieces.splice(
          this.buyablePieces.findIndex(p => p === item),
          1
        )

        if (item.type === 'piece')
          this.player.addPiece({ type: item.name, x: 3, y: 4, bench: true })
        else if (item.type === 'upgrade') this.player.applyUpgrade(item.name)
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
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  height: 49px;

  &.dragging {
    background: var(--highlight-light);
  }
}
.shop {
  width: 100%;
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
