<template>
  <div class="auction-card group">
    <div class="image-wrapper">
      <div v-if="isLive" class="badge-live"><Radio class="btn-icon" :size="18" />ACTIVE</div>
      <div v-if="bidsCount !== undefined" class="badge-bids">{{ bidsCount }} Bids</div>
      <div
        class="card-image"
        :style="{ backgroundImage: `url(${imageUrl})` }"
        :aria-label="title"
      ></div>
    </div>

    <div class="card-content">
      <h3 class="card-title">{{ title }}</h3>
      <span class="status-badge" :class="status?.toLowerCase()">
        {{ status }}
      </span>
      <p class="card-desc">{{ description }}</p>

      <div class="card-footer">
        <div class="price-section">
          <p class="price-label">CURRENT BID</p>

          <h3 class="current-price">
            {{ currency || 'BDT' }} {{ Number(currentBid || 0).toFixed(2) }}
          </h3>

          <p v-if="originalBid !== undefined" class="base-price">
            Original price: {{ baseCurrency || 'BDT' }} {{ Number(originalBid || 0).toFixed(2) }}
          </p>
        </div>

        <div class="bid-action-row">
          <input
            v-model.number="bidAmount"
            type="number"
            class="bid-input"
            :placeholder="minimumBid.toFixed(2)"
            :disabled="!isLive"
          />

          <button class="bid-btn" @click="submitBid" :disabled="!isLive">
            Bid
          </button>

          <button class="pay-btn" @click="$emit('pay')" :disabled="status !== 'CLOSED' && status !== 'PAID'">
            Pay
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Radio } from 'lucide-vue-next'

const props = defineProps<{
  id: number
  title: string
  description: string
  imageUrl: string
  currentBid: number
  originalBid?: number
  currency?: string
  baseCurrency?: string
  status?: string
  isLive: boolean
  bidIncrement: number
  bidsCount?: number
}>()

const bidAmount = ref<number | null>(null)

const emit = defineEmits<{
  (e: 'bid', amount: number): void
  (e: 'pay'): void
}>()

const minimumBid = computed(() => {
  const baseBid = props.originalBid ?? props.currentBid ?? 0
  return baseBid + props.bidIncrement
})

const submitBid = () => {
  if (bidAmount.value === null) return

  const baseBid = props.originalBid ?? props.currentBid ?? 0
  const minimum = baseBid + props.bidIncrement

  if (bidAmount.value < minimum) {
    alert(`Bid must be at least BDT ${minimum.toFixed(2)}`)
    return
  }

  emit('bid', bidAmount.value)
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
  flex-direction: column;
  align-items: flex-start;
}

.price-section {
  margin-top: 1rem;
}

.price-label {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #94a3b8;
  margin-bottom: 0.4rem;
}

.current-price {
  font-size: 1.6rem;
  font-weight: 900;
  color: #197fe6;
  line-height: 1.2;
  margin: 0;
  word-break: break-word;
}

.base-price {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 0.4rem;
}

.bid-action-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

.bid-input {
  width: 130px;
  height: 46px;
  padding: 0 0.75rem;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  font-size: 1rem;
  color: #334155;
  box-sizing: border-box;
}

.bid-btn,
.pay-btn {
  height: 46px;
  padding: 0 1.2rem;
  border: none;
  border-radius: 10px;
  background: #197fe6;
  color: white;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
}

.bid-btn:disabled,
.pay-btn:disabled,
.bid-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.status-badge.upcoming {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.closed {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.paid {
  background: #dbeafe;
  color: #1e40af;
}
</style>
