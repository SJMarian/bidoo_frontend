<template>
  <div class="notification-panel" role="dialog" aria-label="Notifications">
    <!-- Header -->
    <div class="panel-header">
      <h3 class="panel-title">Notifications</h3>
      <div class="header-actions">
        <button
          v-if="hasUnread"
          class="action-btn"
          @click="onMarkAllAsRead"
          title="Mark all as read"
        >
          Mark all read
        </button>
        <button class="close-btn" @click="$emit('close')" aria-label="Close">✕</button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-state">
      <span class="spinner"></span>
      <span>Loading notifications...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="panel-state error">
      <span>⚠️ {{ error }}</span>
      <button class="action-btn" @click="fetchAll">Retry</button>
    </div>

    <!-- Payment modal (overlay on notification list) -->
    <div v-else-if="showPayment !== null" class="payment-modal">
      <div class="payment-card">
        <button class="payment-close" @click="showPayment = null">✕</button>
        
        <h3 class="payment-title">💳 Complete Payment</h3>
        
        <div class="payment-details">
          <div class="detail-row">
            <span class="detail-label">Auction Item:</span>
            <span class="detail-value">{{ notifications.find(n => n.id === showPayment)?.auctionTitle }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value amount">${{ getPaymentAmount() }}</span>
          </div>
        </div>

        <div class="payment-methods">
          <label class="payment-option">
            <input v-model="paymentMethod" type="radio" value="card" />
            <span class="option-content">
              <span class="option-icon">💳</span>
              <span class="option-text">
                <strong>Credit/Debit Card</strong>
                <small>Visa, Mastercard, American Express</small>
              </span>
            </span>
          </label>

          <label class="payment-option">
            <input v-model="paymentMethod" type="radio" value="bank" />
            <span class="option-content">
              <span class="option-icon">🏦</span>
              <span class="option-text">
                <strong>Bank Transfer</strong>
                <small>Direct transfer to business account</small>
              </span>
            </span>
          </label>
        </div>

        <div class="payment-actions">
          <button 
            class="btn-pay" 
            :disabled="!paymentMethod"
            @click="completePayment(showPayment)"
          >
            Complete Payment
          </button>
          <button 
            class="btn-cancel"
            @click="showPayment = null"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="notifications.length === 0" class="panel-state empty">
      <span class="empty-icon">🔔</span>
      <p>You're all caught up!</p>
      <p class="empty-sub">No notifications yet.</p>
    </div>

    <!-- Notification list -->
    <ul v-else class="notification-list" role="list">
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @mark-read="markAsRead(notification.id)"
        @accept="handleAccept(notification.id)"
        @reject="rejectNotification(notification.id)"
        @delete="remove(notification.id)"
        @click="handleItemClick(notification)"
      />
    </ul>

    <!-- Footer -->
    <div class="panel-footer">
      <span class="footer-count">
        {{ notifications.length }} notification{{ notifications.length !== 1 ? 's' : '' }}
        <template v-if="unreadCount > 0">&nbsp;·&nbsp;{{ unreadCount }} unread</template>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Notification } from '@/types/notification/notification.types'
import { useNotifications } from '@/composables/notification/useNotifications'
import NotificationItem from './NotificationItem.vue'

const props = defineProps<{ userId: number }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'navigate', auctionId: number): void }>()

const {
  notifications,
  unreadCount,
  hasUnread,
  loading,
  error,
  fetchAll,
  markAsRead,
  markAllAsRead,
  acceptNotification,
  rejectNotification,
  remove,
} = useNotifications(props.userId)

// Track payment state
const showPayment = ref<number | null>(null)
const paymentMethod = ref<'card' | 'bank' | null>(null)

async function onMarkAllAsRead() {
  await markAllAsRead()
}

async function handleItemClick(notification: Notification) {
  // Mark as read when clicked
  if (!notification.read) {
    await markAsRead(notification.id)
  }
  // Navigate to the related auction if there is one
  if (notification.auctionId) {
    emit('navigate', notification.auctionId)
    emit('close')
  }
}

async function handleAccept(notificationId: number) {
  const notif = notifications.value.find(n => n.id === notificationId)
  if (notif && notif.type === 'AUCTION_WON') {
    showPayment.value = notificationId
  } else {
    await acceptNotification(notificationId)
  }
}

async function completePayment(notificationId: number) {
  if (!paymentMethod.value) return
  
  // Complete the acceptance with payment
  await acceptNotification(notificationId)
  
  // Reset payment UI
  showPayment.value = null
  paymentMethod.value = null
}

function getPaymentAmount() {
  if (showPayment.value === null) return '0.00'
  const notif = notifications.value.find(n => n.id === showPayment.value)
  return (notif as any)?.amount || (notif as any)?.finalPrice || '0.00'
}
</script>

<style scoped>
.notification-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 520px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  animation: slideDown 0.18s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 12px;
  border-bottom: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.panel-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #7c3aed;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.action-btn:hover { background: #f5f3ff; }

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  padding: 4px;
  border-radius: 4px;
  line-height: 1;
}
.close-btn:hover { color: #111827; }

/* States */
.panel-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

.panel-state.error { color: #ef4444; }

.empty-icon { font-size: 32px; }

.empty-sub {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* Loading spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* List */
.notification-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
}

/* Footer */
.panel-footer {
  padding: 10px 16px;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.footer-count {
  font-size: 12px;
  color: #9ca3af;
}

/* Payment Modal */
.payment-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  overflow: hidden;
  z-index: 1001;
}

.payment-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 380px;
  max-height: 90%;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.2s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.payment-close {
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #9ca3af;
  padding: 4px 8px;
}

.payment-close:hover {
  color: #374151;
}

.payment-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  text-align: center;
}

.payment-details {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  border: 1px solid #e5e7eb;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #111827;
  font-weight: 600;
}

.detail-value.amount {
  font-size: 18px;
  color: #22c55e;
}

.payment-methods {
  margin-bottom: 20px;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-option:last-child {
  margin-bottom: 0;
}

.payment-option:hover {
  border-color: #d1d5db;
  background: #fafafa;
}

.payment-option input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-right: 12px;
  accent-color: #7c3aed;
}

.payment-option input:checked ~ .option-content {
  font-weight: 600;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.option-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  flex-shrink: 0;
}

.option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.option-text strong {
  font-size: 13px;
  color: #111827;
  display: block;
}

.option-text small {
  font-size: 11px;
  color: #9ca3af;
  display: block;
}

.payment-actions {
  display: flex;
  gap: 10px;
}

.btn-pay {
  flex: 1;
  padding: 12px 16px;
  background: #22c55e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-pay:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.2);
}

.btn-pay:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  flex: 1;
  padding: 12px 16px;
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}
</style>
