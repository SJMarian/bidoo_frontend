<template>
  <div class="auction-card" :class="{ 'auction-card--bids-blocked': auction.bidsBlocked }">
    <!-- Header -->
    <div class="auction-card__header">
      <div class="auction-card__title-row">
        <h3 class="auction-card__title">{{ auction.title }}</h3>
        <StatusBadge :status="auction.status" :bids-blocked="auction.bidsBlocked" />
      </div>
      <div class="auction-card__meta">
        <span>🏷️ {{ auction.category }}</span>
        <span>👤 {{ auction.sellerUsername }}</span>
        <span>🕐 Submitted {{ formatDate(auction.createdAt) }}</span>
      </div>
    </div>

    <!-- Body -->
    <div class="auction-card__body">
      <p class="auction-card__description">{{ auction.description }}</p>

      <div class="auction-card__details">
        <div class="detail">
          <span class="detail__label">Starting Price</span>
          <span class="detail__value">${{ auction.startingPrice.toLocaleString() }}</span>
        </div>
        <div class="detail">
          <span class="detail__label">Min Increment</span>
          <span class="detail__value">${{ auction.minimumBidIncrement.toLocaleString() }}</span>
        </div>
        <div class="detail">
          <span class="detail__label">Start Time</span>
          <span class="detail__value">{{ formatDate(auction.startTime) }}</span>
        </div>
        <div class="detail">
          <span class="detail__label">End Time</span>
          <span class="detail__value">{{ formatDate(auction.endTime) }}</span>
        </div>
      </div>

      <!-- Reason banners -->
      <div v-if="auction.rejectionReason" class="auction-card__alert auction-card__alert--danger">
        ❌ Rejection Reason: {{ auction.rejectionReason }}
      </div>
      <div v-if="auction.cancellationReason" class="auction-card__alert auction-card__alert--warning">
        🚫 Cancellation Reason: {{ auction.cancellationReason }}
      </div>
    </div>

    <!-- Actions -->
    <div class="auction-card__actions">
      <!-- PENDING -->
      <template v-if="auction.status === 'PENDING'">
        <button class="action-btn action-btn--success" @click="$emit('approve', auction)">
          ✅ Approve
        </button>
        <button class="action-btn action-btn--danger" @click="$emit('reject', auction)">
          ❌ Reject
        </button>
      </template>

      <!-- UPCOMING or ACTIVE -->
      <template v-if="auction.status === 'UPCOMING' || auction.status === 'ACTIVE'">
        <button class="action-btn action-btn--danger" @click="$emit('cancel', auction)">
          🚫 Cancel
        </button>
      </template>

      <!-- ACTIVE only -->
      <template v-if="auction.status === 'ACTIVE'">
        <button
          v-if="!auction.bidsBlocked"
          class="action-btn action-btn--warning"
          @click="$emit('blockBids', auction)"
        >
          🔒 Block Bids
        </button>
        <button
          v-else
          class="action-btn action-btn--primary"
          @click="$emit('unblockBids', auction)"
        >
          🔓 Unblock Bids
        </button>
        <button class="action-btn action-btn--secondary" @click="$emit('close', auction)">
          🔐 Force Close
        </button>
      </template>

      <!-- CLOSED only -->
      <template v-if="auction.status === 'CLOSED'">
        <button class="action-btn action-btn--primary" @click="$emit('reopen', auction)">
          🔄 Reopen
        </button>
      </template>

      <!-- Always available: view logs -->
      <button class="action-btn action-btn--ghost" @click="showLogs = !showLogs">
        {{ showLogs ? '▲ Hide Logs' : '📋 View Logs' }}
      </button>
    </div>

    <!-- Inline logs panel -->
    <div v-if="showLogs" class="auction-card__logs">
      <AuctionActionLog :auction-id="auction.id" @close="showLogs = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatusBadge from './StatusBadge.vue'
import AuctionActionLog from './AuctionActionLog.vue'
import type { Auction } from '../../types/auction'

defineProps<{ auction: Auction }>()
defineEmits(['approve', 'reject', 'cancel', 'blockBids', 'unblockBids', 'close', 'reopen'])

const showLogs = ref(false)

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}
</script>

<style scoped>
.auction-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  transition: box-shadow 0.2s, border-color 0.2s;
}
.auction-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
}
.auction-card--bids-blocked {
  border-color: rgba(245,158,11,0.5);
  box-shadow: 0 0 0 1px rgba(245,158,11,0.2);
}

.auction-card__header {
  padding: 1.1rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.auction-card__title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.auction-card__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 0.5rem;
}

.auction-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.auction-card__body {
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.auction-card__description {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.auction-card__details {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 0.6rem;
}

.detail {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  background: var(--color-surface-raised);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
}

.detail__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.detail__value {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.auction-card__alert {
  font-size: 0.82rem;
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-style: italic;
}
.auction-card__alert--danger  { background: rgba(239,68,68,0.1); color: #f87171 }
.auction-card__alert--warning { background: rgba(245,158,11,0.1); color: #fbbf24 }

.auction-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-raised);
}

.auction-card__logs {
  padding: 0.85rem 1.25rem 1.25rem;
  border-top: 1px solid var(--color-border);
}

/* Action buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.95rem;
  border-radius: 7px;
  border: none;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.action-btn--success   { background: rgba(34,197,94,0.15);   color: #22c55e; border: 1px solid rgba(34,197,94,0.3) }
.action-btn--danger    { background: rgba(239,68,68,0.12);   color: #ef4444; border: 1px solid rgba(239,68,68,0.3) }
.action-btn--warning   { background: rgba(245,158,11,0.12);  color: #f59e0b; border: 1px solid rgba(245,158,11,0.3) }
.action-btn--primary   { background: rgba(99,102,241,0.15);  color: #818cf8; border: 1px solid rgba(99,102,241,0.3) }
.action-btn--secondary { background: rgba(148,163,184,0.12); color: #94a3b8; border: 1px solid rgba(148,163,184,0.3) }
.action-btn--ghost     { background: transparent; color: var(--color-text-muted); border: 1px solid var(--color-border) }

.action-btn:hover { filter: brightness(1.25); transform: translateY(-1px) }
.action-btn:active { transform: translateY(0) }
</style>
