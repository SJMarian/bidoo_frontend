<template>
  <li
    class="notification-item"
    :class="{ unread: !notification.read, accepted: notification.accepted, rejected: notification.rejected }"
    role="listitem"
    @click="$emit('click')"
  >
    <!-- Type icon -->
    <div class="item-icon" :style="{ color: meta.color }">
      {{ meta.icon }}
    </div>

    <!-- Content -->
    <div class="item-content">
      <div class="item-top">
        <span class="item-label" :style="{ color: meta.color }">{{ meta.label }}</span>
        <span class="item-time">{{ timeAgo }}</span>
      </div>
      <p class="item-message">{{ notification.message }}</p>
      <p v-if="notification.auctionTitle" class="item-auction">
        📦 {{ notification.auctionTitle }}
      </p>
      <!-- Payment info for AUCTION_WON -->
      <div v-if="notification.type === 'AUCTION_WON'" class="payment-info">
        <div class="payment-amount">
          <span class="label">💳 Payment Required:</span>
          <span class="amount">${{ getAuctionAmount() }}</span>
        </div>
        <div class="payment-status">
          <span v-if="notification.accepted" class="status-badge payment-pending">⏳ Awaiting Payment</span>
          <span v-else class="status-badge payment-required">⚠️ Action Required</span>
        </div>
      </div>
      <!-- Status badge -->
      <div v-if="notification.type !== 'AUCTION_WON'" class="item-status">
        <span v-if="notification.accepted" class="status-badge accepted">✓ Accepted</span>
        <span v-else-if="notification.rejected" class="status-badge rejected">✗ Rejected</span>
      </div>
    </div>

    <!-- Unread dot -->
    <div v-if="!notification.read" class="unread-dot" title="Unread"></div>

    <!-- Actions (shown on hover) -->
    <div class="item-actions">
      <button
        v-if="hasAcceptReject && !notification.accepted && !notification.rejected"
        class="item-action-btn accept"
        title="Accept"
        @click.stop="$emit('accept')"
      >
        ✓
      </button>
      <button
        v-if="hasAcceptReject && !notification.accepted && !notification.rejected"
        class="item-action-btn reject"
        title="Reject"
        @click.stop="$emit('reject')"
      >
        ✕
      </button>
      <button
        v-if="!notification.read"
        class="item-action-btn"
        title="Mark as read"
        @click.stop="$emit('mark-read')"
      >
        ✓
      </button>
      <button
        class="item-action-btn delete"
        title="Delete"
        @click.stop="$emit('delete')"
      >
        🗑
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Notification } from '@/types/notification/notification.types'
import { NOTIFICATION_META } from '@/types/notification/notification.types'

const props = defineProps<{ notification: Notification }>()

defineEmits<{
  (e: 'click'): void
  (e: 'mark-read'): void
  (e: 'accept'): void
  (e: 'reject'): void
  (e: 'delete'): void
}>()

const meta = computed(() => NOTIFICATION_META[props.notification.type])

/** Notification types that support accept/reject */
const acceptRejectTypes = ['AUCTION_APPROVED', 'AUCTION_REJECTED', 'PAYMENT_REQUIRED', 'AUCTION_WON']

const hasAcceptReject = computed(() => acceptRejectTypes.includes(props.notification.type))

/** Get auction amount from notification */
const getAuctionAmount = () => {
  return (props.notification as any).amount || (props.notification as any).finalPrice || '0.00'
}

/** Human-readable relative time (e.g. "3 minutes ago") */
const timeAgo = computed(() => {
  const now = Date.now()
  const created = new Date(props.notification.createdAt).getTime()
  const diff = Math.floor((now - created) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
})
</script>

<style scoped>
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f9fafb;
  transition: background 0.15s;
  position: relative;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-item.unread {
  background: #faf5ff;
}
.notification-item.unread:hover {
  background: #f3e8ff;
}

.notification-item.accepted {
  background: #f0fdf4;
}

.notification-item.rejected {
  background: #fef2f2;
}

/* Icon */
.item-icon {
  font-size: 20px;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
  padding-top: 1px;
}

/* Content */
.item-content {
  flex: 1;
  min-width: 0;
}

.item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 3px;
}

.item-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.item-time {
  font-size: 11px;
  color: #9ca3af;
  flex-shrink: 0;
}

.item-message {
  font-size: 13px;
  color: #374151;
  margin: 0 0 4px;
  line-height: 1.45;
  /* Clamp to 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-auction {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Unread dot */
.unread-dot {
  width: 8px;
  height: 8px;
  background: #7c3aed;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

/* Hover actions */
.item-actions {
  display: none;
  gap: 4px;
  flex-shrink: 0;
}

.notification-item:hover .item-actions {
  display: flex;
}

.item-action-btn {
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 4px;
  color: #374151;
  transition: background 0.15s;
}
.item-action-btn:hover { background: #e5e7eb; }
.item-action-btn.accept {
  color: #22c55e;
}
.item-action-btn.accept:hover {
  background: #dcfce7;
}
.item-action-btn.reject {
  color: #ef4444;
}
.item-action-btn.reject:hover {
  background: #fee2e2;
}
.item-action-btn.delete { color: #ef4444; }
.item-action-btn.delete:hover { background: #fee2e2; }

/* Status badge */
.item-status {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.status-badge.accepted {
  background: #dcfce7;
  color: #166534;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Payment Info */
.payment-info {
  margin-top: 6px;
  padding: 6px 8px;
  background: linear-gradient(135deg, #fef3c7 0%, #f3e8ff 100%);
  border-left: 3px solid #f59e0b;
  border-radius: 3px;
}

.payment-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  color: #92400e;
  margin-bottom: 4px;
}

.payment-amount .label {
  font-weight: 600;
}

.payment-amount .amount {
  font-size: 13px;
  font-weight: 700;
  color: #dc2626;
}

.payment-status {
  display: flex;
  gap: 6px;
}

.status-badge.payment-required {
  background: #fee2e2;
  color: #991b1b;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}

.status-badge.payment-pending {
  background: #fed7aa;
  color: #92400e;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 3px;
}
</style>
