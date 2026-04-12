<template>
  <div class="bid-panel">
    <!-- ── Current Bid State ── -->
    <div class="bid-panel__state">
      <div class="bid-amount-display" :class="{ 'bid-amount-display--flash': flashBid }">
        <span class="bid-amount-display__label">Current Highest Bid</span>
        <span class="bid-amount-display__value">
          {{ state?.currentHighestBid != null
            ? `$${formatAmount(state.currentHighestBid)}`
            : `$${formatAmount(state?.startingPrice ?? 0)} (starting)` }}
        </span>
        <span class="bid-amount-display__count">{{ state?.totalBids ?? 0 }} bids</span>
      </div>

      <!-- Increment Rule Badge -->
      <div class="rule-badge">
        <span class="rule-badge__label">Increment Rule</span>
        <span class="rule-badge__value">
          <template v-if="state?.incrementType === 'FIXED'">
            + ${{ formatAmount(state.minimumBidIncrement) }} fixed
          </template>
          <template v-else>
            + {{ state?.minimumBidIncrement }}% of current bid
          </template>
        </span>
      </div>
    </div>

    <!-- ── Bid Animation (Rive) ── -->
    <div class="bid-panel__anim">
      <BidAnimationCanvas :anim-state="animState" />
      <p class="bid-panel__anim-label">{{ animLabel }}</p>
    </div>

    <!-- ── Minimum Next Bid Indicator ── -->
    <div class="bid-panel__minimum">
      <span class="minimum__label">Minimum bid to place:</span>
      <span class="minimum__value">${{ formatAmount(state?.minimumNextBid ?? 0) }}</span>
    </div>

    <!-- ── Bid Input ── -->
    <div class="bid-panel__input-area">
      <div class="bid-input-row">
        <span class="bid-input-prefix">$</span>
        <input
          v-model.number="bidAmount"
          type="number"
          class="bid-input"
          :class="{
            'bid-input--valid':   validation?.valid === true,
            'bid-input--invalid': validation?.valid === false,
          }"
          :placeholder="`Min: $${formatAmount(state?.minimumNextBid ?? 0)}`"
          :disabled="!canBid"
          @input="onAmountInput"
        />
        <button
          class="bid-input-fill"
          title="Fill minimum bid"
          :disabled="!canBid"
          @click="fillMinimum"
        >
          ↓ Min
        </button>
      </div>

      <!-- Validation feedback -->
      <div v-if="validation" class="bid-validation" :class="validation.valid ? 'bid-validation--ok' : 'bid-validation--err'">
        {{ validation.message }}
      </div>

      <!-- Bidder name input -->
      <input
        v-model="bidderUsername"
        class="bidder-input"
        type="text"
        placeholder="Your username"
        :disabled="!canBid"
      />

      <!-- Place bid button -->
      <button
        class="place-bid-btn"
        :class="{ 'place-bid-btn--disabled': !canSubmit }"
        :disabled="!canSubmit || submitting"
        @click="submitBid"
      >
        <span v-if="submitting">Placing bid…</span>
        <span v-else>🔨 Place Bid</span>
      </button>

      <!-- Status messages -->
      <div v-if="state?.bidsBlocked" class="bid-panel__blocked">
        🔒 Bidding is currently blocked for this auction.
      </div>
      <div v-else-if="state?.auctionStatus !== 'ACTIVE'" class="bid-panel__blocked">
        ⚠ This auction is not currently active ({{ state?.auctionStatus }}).
      </div>
    </div>

    <!-- ── Bid History ── -->
    <div class="bid-panel__history">
      <div class="bid-panel__history-header">
        <h4>Recent Bids</h4>
        <button class="refresh-btn" @click="loadData">↻</button>
      </div>
      <div v-if="history.length === 0" class="bid-panel__empty">No bids yet. Be the first!</div>
      <ul v-else class="bid-list">
        <li
          v-for="bid in history.slice(0, 8)"
          :key="bid.id"
          class="bid-list__item"
          :class="{ 'bid-list__item--highest': bid.id === highestBidId }"
        >
          <span class="bid-list__user">{{ bid.bidderUsername }}</span>
          <span class="bid-list__amount">${{ formatAmount(bid.amount) }}</span>
          <span class="bid-list__time">{{ formatTime(bid.placedAt) }}</span>
          <span v-if="bid.id === highestBidId" class="bid-list__badge">👑 Highest</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BidAnimationCanvas from './BidAnimationCanvas.vue'
import { bidApi } from '../../services/bidApi'
import type { BidStateResponse, BidResponse, BidValidationResponse } from '../../types/bid'

const props = defineProps<{ auctionId: number }>()

// ── State ─────────────────────────────────────────────────────────────────────
const state = ref<BidStateResponse | null>(null)
const history = ref<BidResponse[]>([])
const bidAmount = ref<number | null>(null)
const bidderUsername = ref('')
const validation = ref<BidValidationResponse | null>(null)
const submitting = ref(false)
const flashBid = ref(false)
const animState = ref<'idle' | 'success' | 'fail'>('idle')

let pollInterval: ReturnType<typeof setInterval>
let validateTimer: ReturnType<typeof setTimeout>

// ── Computed ──────────────────────────────────────────────────────────────────
const canBid = computed(
  () => state.value?.auctionStatus === 'ACTIVE' && !state.value?.bidsBlocked,
)

const canSubmit = computed(
  () =>
    canBid.value &&
    bidAmount.value != null &&
    bidAmount.value > 0 &&
    bidderUsername.value.trim().length > 0 &&
    !submitting.value,
)

const highestBidId = computed(() => {
  if (history.value.length === 0) return null
  return history.value.reduce((max, b) => (b.amount > max.amount ? b : max)).id
})

const animLabel = computed(() => {
  if (animState.value === 'success') return 'Bid placed! 🎉'
  if (animState.value === 'fail') return 'Bid rejected'
  return 'Ready to bid'
})

// ── Data Loading ──────────────────────────────────────────────────────────────
async function loadData() {
  try {
    const [s, h] = await Promise.all([
      bidApi.getBidState(props.auctionId),
      bidApi.getBidHistory(props.auctionId),
    ])
    const prevHighest = state.value?.currentHighestBid
    state.value = s
    history.value = h

    // Flash animation when highest bid changes
    if (prevHighest !== null && s.currentHighestBid !== prevHighest) {
      flashBid.value = true
      setTimeout(() => (flashBid.value = false), 800)
    }
  } catch (e) {
    console.error('Failed to load bid data:', e)
  }
}

onMounted(() => {
  loadData()
  // Poll every 5 seconds to keep bid state fresh
  pollInterval = setInterval(loadData, 5000)
})

onUnmounted(() => {
  clearInterval(pollInterval)
  clearTimeout(validateTimer)
})

// ── Input Handlers ────────────────────────────────────────────────────────────
function onAmountInput() {
  validation.value = null
  clearTimeout(validateTimer)
  if (!bidAmount.value || bidAmount.value <= 0) return
  validateTimer = setTimeout(async () => {
    try {
      validation.value = await bidApi.validateBid(props.auctionId, bidAmount.value!)
    } catch {
      validation.value = null
    }
  }, 400)
}

function fillMinimum() {
  if (state.value) {
    bidAmount.value = state.value.minimumNextBid
    onAmountInput()
  }
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function submitBid() {
  if (!canSubmit.value || bidAmount.value === null) return
  submitting.value = true
  animState.value = 'idle'

  try {
    const placed = await bidApi.placeBid(props.auctionId, {
      bidderUsername: bidderUsername.value.trim(),
      amount: bidAmount.value,
    })

    // Success
    animState.value = 'success'
    history.value.unshift(placed)
    await loadData()
    bidAmount.value = null
    validation.value = null

    setTimeout(() => (animState.value = 'idle'), 2000)
  } catch (e: any) {
    // Fail
    animState.value = 'fail'
    validation.value = {
      valid: false,
      message: e.message,
      minimumNextBid: state.value?.minimumNextBid ?? 0,
    }
    setTimeout(() => (animState.value = 'idle'), 2000)
  } finally {
    submitting.value = false
  }
}

// ── Formatters ────────────────────────────────────────────────────────────────
function formatAmount(n: number): string {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', { timeStyle: 'short', dateStyle: 'short' }).format(
    new Date(iso),
  )
}
</script>

<style scoped>
.bid-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.5rem;
  max-width: 480px;
}

/* ── Bid Amount Display ── */
.bid-amount-display {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: var(--color-surface-raised);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  transition: box-shadow 0.3s ease;
}

.bid-amount-display--flash {
  box-shadow: 0 0 0 2px var(--color-accent), 0 0 20px rgba(99,102,241,0.3);
  animation: bidFlash 0.8s ease;
}

@keyframes bidFlash {
  0%   { background: rgba(99,102,241,0.2) }
  100% { background: var(--color-surface-raised) }
}

.bid-amount-display__label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  font-weight: 600;
}

.bid-amount-display__value {
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.bid-amount-display__count {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

/* ── Rule Badge ── */
.bid-panel__state {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.rule-badge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(99,102,241,0.08);
  border: 1px solid rgba(99,102,241,0.2);
  border-radius: 8px;
  padding: 0.55rem 0.9rem;
}

.rule-badge__label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rule-badge__value {
  font-size: 0.85rem;
  font-weight: 700;
  color: #818cf8;
}

/* ── Animation Area ── */
.bid-panel__anim {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.bid-panel__anim-label {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* ── Minimum Bid ── */
.bid-panel__minimum {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 8px;
  padding: 0.55rem 0.9rem;
}

.minimum__label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.minimum__value {
  font-size: 1rem;
  font-weight: 800;
  color: var(--color-success);
}

/* ── Input Area ── */
.bid-panel__input-area {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.bid-input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bid-input-prefix {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.bid-input {
  flex: 1;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  padding: 0.65rem 0.85rem;
  font-size: 1rem;
  font-weight: 600;
  transition: border-color 0.15s;
}
.bid-input:focus { outline: none; border-color: var(--color-accent) }
.bid-input--valid   { border-color: var(--color-success) !important }
.bid-input--invalid { border-color: var(--color-danger) !important }
.bid-input:disabled { opacity: 0.5; cursor: not-allowed }

.bid-input-fill {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  padding: 0.65rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.bid-input-fill:hover { border-color: var(--color-accent); color: var(--color-accent) }
.bid-input-fill:disabled { opacity: 0.4; cursor: not-allowed }

.bid-validation {
  font-size: 0.82rem;
  border-radius: 6px;
  padding: 0.45rem 0.75rem;
}
.bid-validation--ok  { background: rgba(34,197,94,0.1);  color: var(--color-success) }
.bid-validation--err { background: rgba(239,68,68,0.1);  color: var(--color-danger)  }

.bidder-input {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  padding: 0.6rem 0.85rem;
  font-size: 0.9rem;
  transition: border-color 0.15s;
}
.bidder-input:focus { outline: none; border-color: var(--color-accent) }
.bidder-input:disabled { opacity: 0.5 }
.bidder-input::placeholder { color: var(--color-text-muted) }

.place-bid-btn {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.02em;
}
.place-bid-btn:hover:not(.place-bid-btn--disabled) {
  filter: brightness(1.15);
  transform: translateY(-1px);
}
.place-bid-btn--disabled { opacity: 0.4; cursor: not-allowed }

.bid-panel__blocked {
  font-size: 0.82rem;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  background: rgba(239,68,68,0.1);
  color: var(--color-danger);
  text-align: center;
}

/* ── Bid History ── */
.bid-panel__history { display: flex; flex-direction: column; gap: 0.5rem }

.bid-panel__history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bid-panel__history-header h4 {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.refresh-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-muted);
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s;
}
.refresh-btn:hover { color: var(--color-accent); border-color: var(--color-accent) }

.bid-panel__empty {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-align: center;
  padding: 1rem;
}

.bid-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.bid-list__item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.8rem;
  background: var(--color-surface-raised);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  font-size: 0.82rem;
  transition: border-color 0.15s;
}

.bid-list__item--highest {
  border-color: rgba(99,102,241,0.4);
  background: rgba(99,102,241,0.07);
}

.bid-list__user  { font-weight: 600; color: var(--color-text-primary); flex: 1 }
.bid-list__amount { font-weight: 700; color: var(--color-success) }
.bid-list__time  { font-size: 0.75rem; color: var(--color-text-muted) }
.bid-list__badge { font-size: 0.72rem; color: #818cf8; font-weight: 700 }
</style>
