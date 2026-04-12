<template>
  <li
    class="notification-item"
    :class="{ unread: !notification.read }"
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
    </div>

    <!-- Unread dot -->
    <div v-if="!notification.read" class="unread-dot" title="Unread"></div>

    <!-- Actions (shown on hover) -->
    <div class="item-actions">
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
        ✕
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
  (e: 'delete'): void
}>()

const meta = computed(() => NOTIFICATION_META[props.notification.type])

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
.item-action-btn.delete { color: #ef4444; }
.item-action-btn.delete:hover { background: #fee2e2; }
</style>
