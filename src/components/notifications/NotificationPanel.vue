<template>
  <div class="notification-panel">
    <div class="notification-panel__header">
      <h3 class="notification-panel__title">
        Notifications
        <span v-if="unreadCount > 0" class="notification-panel__badge">{{ unreadCount }}</span>
      </h3>
      <div class="notification-panel__actions">
        <button
          v-if="unreadCount > 0"
          class="notification-panel__btn notification-panel__btn--text"
          @click="markAllAsRead"
          title="Mark all as read"
        >
          Mark all read
        </button>
        <button
          class="notification-panel__btn notification-panel__btn--icon"
          @click="closePanel"
          title="Close"
        >
          ✕
        </button>
      </div>
    </div>

    <div v-if="loading" class="notification-panel__spinner">
      <div class="spinner"></div>
    </div>

    <div v-else-if="notifications.length === 0" class="notification-panel__empty">
      <p>No notifications yet</p>
    </div>

    <div v-else class="notification-panel__list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification-item', { 'notification-item--unread': !notification.isRead }]"
      >
        <div :class="['notification-item__icon', `notification-item__icon--${notification.severity.toLowerCase()}`]">
          {{ getSeverityIcon(notification.severity) }}
        </div>
        <div class="notification-item__content">
          <div class="notification-item__header">
            <h4 class="notification-item__title">{{ notification.title }}</h4>
            <span class="notification-item__time">{{ formatTime(notification.createdAt) }}</span>
          </div>
          <p v-if="notification.message" class="notification-item__message">
            {{ notification.message }}
          </p>
          <div class="notification-item__actions">
            <button
              v-if="!notification.isRead"
              class="notification-item__action"
              @click="markAsRead(notification.id)"
            >
              Mark as read
            </button>
            <button
              class="notification-item__action notification-item__action--delete"
              @click="deleteNotification(notification.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Notification } from '../../types/notifications'
import { SeverityLevel } from '../../types/notifications'

defineProps({
  notifications: {
    type: Array as PropType<Notification[]>,
    required: true
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  closePanel: []
  markAsRead: [id: number]
  markAllAsRead: []
  deleteNotification: [id: number]
}>()

function closePanel() {
  emit('closePanel')
}

function markAsRead(id: number) {
  emit('markAsRead', id)
}

function markAllAsRead() {
  emit('markAllAsRead')
}

function deleteNotification(id: number) {
  emit('deleteNotification', id)
}

function getSeverityIcon(severity: SeverityLevel): string {
  const icons: Record<SeverityLevel, string> = {
    [SeverityLevel.INFO]: 'ℹ',
    [SeverityLevel.SUCCESS]: '✓',
    [SeverityLevel.WARNING]: '⚠',
    [SeverityLevel.ERROR]: '✕'
  }
  return icons[severity] || 'ℹ'
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}
</script>

<style scoped>
.notification-panel {
  background-color: var(--color-surface, #1e293b);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  max-height: 500px;
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.notification-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--color-border, #334155);
}

.notification-panel__title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text, #f1f5f9);
}

.notification-panel__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.notification-panel__actions {
  display: flex;
  gap: 8px;
}

.notification-panel__btn {
  padding: 4px 8px;
  background: none;
  border: none;
  color: var(--color-accent, #6366f1);
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
  transition: all 0.2s;
}

.notification-panel__btn--text {
  font-size: 12px;
  padding: 4px 8px;
}

.notification-panel__btn--text:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.notification-panel__btn--icon {
  padding: 4px 8px;
  font-size: 16px;
  color: var(--color-text-secondary, #94a3b8);
}

.notification-panel__btn--icon:hover {
  color: var(--color-text, #f1f5f9);
}

.notification-panel__spinner,
.notification-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--color-text-secondary, #94a3b8);
}

.notification-panel__list {
  overflow-y: auto;
  flex: 1;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border, #334155);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: rgba(99, 102, 241, 0.05);
}

.notification-item--unread {
  background-color: rgba(99, 102, 241, 0.1);
}

.notification-item__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: bold;
}

.notification-item__icon--info {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.notification-item__icon--success {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.notification-item__icon--warning {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.notification-item__icon--error {
  background-color: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.notification-item__content {
  flex: 1;
}

.notification-item__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.notification-item__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text, #f1f5f9);
  flex: 1;
}

.notification-item__time {
  font-size: 12px;
  color: var(--color-text-secondary, #94a3b8);
  white-space: nowrap;
}

.notification-item__message {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary, #94a3b8);
  line-height: 1.4;
}

.notification-item__actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.notification-item__action {
  font-size: 12px;
  padding: 4px 8px;
  background: none;
  border: 1px solid var(--color-accent, #6366f1);
  color: var(--color-accent, #6366f1);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.notification-item__action:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.notification-item__action--delete {
  border-color: #ef4444;
  color: #ef4444;
}

.notification-item__action--delete:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(99, 102, 241, 0.2);
  border-top-color: var(--color-accent, #6366f1);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
