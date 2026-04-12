<template>
  <span class="status-badge" :class="`status-badge--${statusClass}`">
    <span class="status-badge__dot" />
    {{ label }}
    <span v-if="bidsBlocked" class="status-badge__blocked">🔒 Bids Blocked</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AuctionStatus } from '../../types/auction'

const props = defineProps<{
  status: AuctionStatus
  bidsBlocked?: boolean
}>()

const statusClass = computed(() => props.status.toLowerCase())

const label = computed(() => {
  const map: Record<AuctionStatus, string> = {
    PENDING: 'Pending Review',
    APPROVED: 'Approved',
    UPCOMING: 'Upcoming',
    ACTIVE: 'Active',
    CLOSED: 'Closed',
    PAID: 'Paid',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled',
  }
  return map[props.status] ?? props.status
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  white-space: nowrap;
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.8;
}

.status-badge__blocked {
  margin-left: 0.3rem;
  font-size: 0.7rem;
}

/* Status-specific colours */
.status-badge--pending   { background: rgba(251,191,36,0.15); color: #f59e0b }
.status-badge--approved  { background: rgba(99,102,241,0.15); color: #818cf8 }
.status-badge--upcoming  { background: rgba(99,102,241,0.15); color: #818cf8 }
.status-badge--active    { background: rgba(34,197,94,0.15);  color: #22c55e }
.status-badge--closed    { background: rgba(148,163,184,0.15);color: #94a3b8 }
.status-badge--paid      { background: rgba(16,185,129,0.15); color: #10b981 }
.status-badge--rejected  { background: rgba(239,68,68,0.15);  color: #ef4444 }
.status-badge--cancelled { background: rgba(239,68,68,0.12);  color: #f87171 }
</style>
