<template>
  <div class="auction-card group">
    <div class="image-wrapper">
      <div v-if="isLive" class="badge-live"><Radio class="btn-icon" :size="18" />LIVE</div>
      <div v-if="bidsCount !== undefined" class="badge-bids">{{ bidsCount }} Bids</div>
      <div
        class="card-image"
        :style="{ backgroundImage: `url(${imageUrl})` }"
        :aria-label="title"
      ></div>
    </div>

    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-desc">{{ description }}</p>

      <div class="card-footer">
        <div class="bid-info">
          <span class="bid-label">Current Bid</span>
          <span class="bid-amount">{{ formatCurrency(currentBid) }}</span>
        </div>

        <div class="bid-action">
          <div class="input-wrapper">
            <span class="currency-symbol">$</span>
            <input type="number" class="bid-input" placeholder="0.00" v-model="bidAmount" />
          </div>
          <button class="bid-button" @click="placeBid">Bid</button>
          <button class="bid-button" @click="pay">Pay</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Radio } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'
import router from '@/router'

const props = defineProps<{
  id: number
  title: string
  description: string
  imageUrl: string
  currentBid: number
  bidsCount?: number
  isLive?: boolean
  bidIncrement: number
}>()

const bidAmount = ref<number | null>(null)

const emit = defineEmits<{
  (e: 'bid', amount: number): void
  (e: 'pay'): void
}>()

const toast = useToast()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val)
}

const placeBid = () => {
  if (bidAmount.value) {
    if (bidAmount.value <= props.currentBid) {
      toast.error('Bid must be greater than the current bid.')
      return
    }
    if (bidAmount.value < props.currentBid + props.bidIncrement) {
      toast.error(
        `Bid must be at least ${formatCurrency(props.currentBid + props.bidIncrement)} to meet the minimum increment.`,
      )
      return
    }

    emit('bid', bidAmount.value)
    bidAmount.value = null
  }
}

const pay = () => {
  router.push(`/checkout/${props.id}`)
}
</script>

<style scoped>
.auction-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 300px;
  background-color: #ffffff;
  padding: 0.75rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.auction-card:hover {
  transform: translateY(-0.25rem);
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-radius: 0.5rem;
}

.badge-live {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 10;
  background-color: #dc2626;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.icon-small {
  font-size: 14px;
}

.badge-bids {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

.card-image {
  width: 100%;
  height: 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.auction-card:hover .card-image {
  transform: scale(1.1);
}

.card-content {
  padding: 0 0.25rem;
}

.card-title {
  color: #0f172a;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
}

.card-desc {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0 0 0.75rem 0;
}

.card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.bid-info {
  display: flex;
  flex-direction: column;
}

.bid-label {
  color: #94a3b8;
  font-size: 0.625rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.bid-amount {
  color: #197fe6;
  font-size: 1.25rem;
  font-weight: 800;
}

.bid-action {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.75rem;
}

.bid-input {
  width: 5.5rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 0.5rem 0.5rem 0.5rem 1.25rem;
  font-size: 0.875rem;
  outline: none;
  color: #0f172a;
  box-sizing: border-box;
}

.bid-input:focus {
  border-color: #197fe6;
  background-color: #ffffff;
  box-shadow: 0 0 0 1px #197fe6;
}

.bid-button {
  background-color: #197fe6;
  color: white;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
}

.bid-button:hover {
  opacity: 0.9;
}
</style>
