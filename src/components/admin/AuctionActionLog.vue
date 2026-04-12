<template>
  <div class="log-panel">
    <div class="log-panel__header">
      <h4 class="log-panel__title">📋 Action History</h4>
      <button class="log-panel__close" @click="$emit('close')">✕</button>
    </div>

    <div v-if="loading" class="log-panel__state">Loading logs…</div>
    <div v-else-if="error" class="log-panel__state log-panel__state--error">{{ error }}</div>
    <div v-else-if="logs.length === 0" class="log-panel__state">No actions recorded yet.</div>

    <ul v-else class="log-list">
      <li v-for="log in logs" :key="log.id" class="log-item">
        <span class="log-item__icon">{{ actionIcon(log.actionType) }}</span>
        <div class="log-item__body">
          <div class="log-item__action">{{ actionLabel(log.actionType) }}</div>
          <div v-if="log.reason" class="log-item__reason">"{{ log.reason }}"</div>
          <div class="log-item__meta">
            by <strong>{{ log.performedBy }}</strong> · {{ formatDate(log.performedAt) }}
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminModerationApi } from '../../services/adminModerationApi'
import type { AdminActionLog, AdminActionType } from '../../types/auction'

const props = defineProps<{ auctionId: number }>()
defineEmits(['close'])

const logs = ref<AdminActionLog[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    logs.value = await adminModerationApi.getAuctionLogs(props.auctionId)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function actionLabel(type: AdminActionType): string {
  const map: Record<AdminActionType, string> = {
    APPROVE: 'Auction Approved',
    REJECT: 'Auction Rejected',
    CANCEL: 'Auction Cancelled',
    BLOCK_BIDS: 'Bids Blocked',
    UNBLOCK_BIDS: 'Bids Unblocked',
    MANUAL_CLOSE: 'Manually Closed',
    REOPEN: 'Auction Reopened',
  }
  return map[type] ?? type
}

function actionIcon(type: AdminActionType): string {
  const map: Record<AdminActionType, string> = {
    APPROVE: '✅',
    REJECT: '❌',
    CANCEL: '🚫',
    BLOCK_BIDS: '🔒',
    UNBLOCK_BIDS: '🔓',
    MANUAL_CLOSE: '🔐',
    REOPEN: '🔄',
  }
  return map[type] ?? '📌'
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}
</script>

<style scoped>
.log-panel {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface-raised);
  overflow: hidden;
}

.log-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--color-border);
}

.log-panel__title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.log-panel__close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}
.log-panel__close:hover { color: var(--color-text-primary) }

.log-panel__state {
  padding: 1.5rem;
  text-align: center;
  color: var(--color-text-muted);
  font-size: 0.88rem;
}
.log-panel__state--error { color: var(--color-danger) }

.log-list {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0;
  max-height: 340px;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--color-border);
  transition: background 0.1s;
}
.log-item:last-child { border-bottom: none }
.log-item:hover { background: rgba(255,255,255,0.03) }

.log-item__icon { font-size: 1.1rem; flex-shrink: 0; padding-top: 0.05rem }

.log-item__body { display: flex; flex-direction: column; gap: 0.2rem }

.log-item__action {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.log-item__reason {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.log-item__meta {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}
</style>
