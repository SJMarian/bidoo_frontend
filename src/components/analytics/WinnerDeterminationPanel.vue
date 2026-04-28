<template>
  <div class="winner-panel">
    <div class="winner-panel__header">
      <h3 class="winner-panel__title">🏆 Automatic Winner Determination</h3>
      <button class="batch-btn" :disabled="batchLoading" @click="runBatch">
        {{ batchLoading ? 'Processing…' : '⚡ Process All Expired' }}
      </button>
    </div>

    <p class="winner-panel__desc">
      Closes all ACTIVE auctions that have passed their end time and determines the highest bidder as the winner.
    </p>

    <!-- Single auction winner determination -->
    <div class="single-form">
      <label class="single-form__label">Determine winner for specific auction:</label>
      <div class="single-form__row">
        <input
          v-model.number="auctionIdInput"
          type="number"
          class="single-form__input"
          placeholder="Auction ID"
          min="1"
        />
        <button class="determine-btn" :disabled="!auctionIdInput || loading" @click="runSingle">
          {{ loading ? 'Processing…' : 'Determine Winner' }}
        </button>
      </div>
    </div>

    <!-- Results -->
    <div v-if="results.length > 0" class="results">
      <h4 class="results__title">Results</h4>
      <div v-for="result in results" :key="result.auctionId" class="result-card"
        :class="result.winnerUsername ? 'result-card--won' : 'result-card--no-bids'"
      >
        <div class="result-card__header">
          <span class="result-card__auction">{{ result.auctionTitle }}</span>
          <span class="result-card__status">{{ result.auctionStatus }}</span>
        </div>
        <div v-if="result.winnerUsername" class="result-card__winner">
          <span class="result-card__winner-icon">👑</span>
          <div>
            <div class="result-card__winner-name">{{ result.winnerUsername }}</div>
            <div class="result-card__winner-bid">
              Winning bid: ${{ fmt(result.winningBidAmount) }}
            </div>
          </div>
        </div>
        <p class="result-card__message">{{ result.message }}</p>
      </div>
    </div>

    <div v-if="error" class="error-msg">⚠ {{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { analyticsApi } from '../../services/analyticsApi'
import type { WinnerDeterminationResult } from '../../types/analytics'

const auctionIdInput = ref<number | null>(null)
const loading = ref(false)
const batchLoading = ref(false)
const results = ref<WinnerDeterminationResult[]>([])
const error = ref('')

async function runSingle() {
  if (!auctionIdInput.value) return
  loading.value = true
  error.value = ''
  try {
    const r = await analyticsApi.determineWinner(auctionIdInput.value)
    results.value = [r]
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function runBatch() {
  batchLoading.value = true
  error.value = ''
  try {
    results.value = await analyticsApi.determineAllWinners()
    if (results.value.length === 0) {
      error.value = 'No expired auctions found to process.'
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    batchLoading.value = false
  }
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>

<style scoped>
.winner-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.winner-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.winner-panel__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.winner-panel__desc {
  font-size: 0.83rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

.batch-btn {
  background: rgba(99,102,241,0.15);
  border: 1px solid rgba(99,102,241,0.4);
  color: #818cf8;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.batch-btn:hover:not(:disabled) { background: rgba(99,102,241,0.25) }
.batch-btn:disabled { opacity: 0.5; cursor: not-allowed }

.single-form { display: flex; flex-direction: column; gap: 0.4rem }
.single-form__label { font-size: 0.78rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em }
.single-form__row { display: flex; gap: 0.6rem }

.single-form__input {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  padding: 0.55rem 0.85rem;
  font-size: 0.9rem;
  width: 140px;
}
.single-form__input:focus { outline: none; border-color: var(--color-accent) }

.determine-btn {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.determine-btn:hover:not(:disabled) { filter: brightness(1.1) }
.determine-btn:disabled { opacity: 0.5; cursor: not-allowed }

.results { display: flex; flex-direction: column; gap: 0.75rem }
.results__title { font-size: 0.8rem; font-weight: 700; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 }

.result-card {
  border-radius: 10px;
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.result-card--won    { background: rgba(34,197,94,0.07); border-color: rgba(34,197,94,0.3) }
.result-card--no-bids { background: rgba(148,163,184,0.07) }

.result-card__header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem }
.result-card__auction { font-size: 0.9rem; font-weight: 700; color: var(--color-text-primary) }
.result-card__status { font-size: 0.72rem; font-weight: 700; color: #818cf8; background: rgba(99,102,241,0.1); padding: 0.2rem 0.6rem; border-radius: 4px; text-transform: uppercase }

.result-card__winner { display: flex; align-items: center; gap: 0.75rem }
.result-card__winner-icon { font-size: 1.5rem }
.result-card__winner-name { font-size: 0.95rem; font-weight: 700; color: #22c55e }
.result-card__winner-bid { font-size: 0.8rem; color: var(--color-text-muted) }

.result-card__message { font-size: 0.8rem; color: var(--color-text-secondary); margin: 0; font-style: italic }

.error-msg { font-size: 0.83rem; color: var(--color-danger); background: rgba(239,68,68,0.1); border-radius: 8px; padding: 0.6rem 0.9rem }
</style>
