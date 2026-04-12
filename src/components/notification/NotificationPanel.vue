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
  remove,
} = useNotifications(props.userId)

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
</style>
