<template>
  <!-- Toast container — fixed at top-right -->
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type.toLowerCase()}`"
          role="alert"
        >
          <span class="toast-icon">{{ NOTIFICATION_META[toast.type].icon }}</span>
          <div class="toast-body">
            <p class="toast-label">{{ NOTIFICATION_META[toast.type].label }}</p>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <button class="toast-close" @click="dismiss(toast.id)" aria-label="Dismiss">✕</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Notification, NotificationType } from '@/types/notification/notification.types'
import { NOTIFICATION_META } from '@/types/notification/notification.types'
import { notificationWS } from '@/services/notification/notificationWebSocket'

const props = defineProps<{ userId: number }>()

interface Toast {
  id: number
  type: NotificationType
  message: string
  timer: ReturnType<typeof setTimeout>
}

const toasts = ref<Toast[]>([])
let nextId = 0

function show(notification: Notification) {
  const id = ++nextId
  const timer = setTimeout(() => dismiss(id), 5000)
  toasts.value.push({
    id,
    type: notification.type,
    message: notification.message,
    timer,
  })
}

function dismiss(id: number) {
  const idx = toasts.value.findIndex((t) => t.id === id)
  if (idx !== -1) {
    clearTimeout(toasts.value[idx].timer)
    toasts.value.splice(idx, 1)
  }
}

// Subscribe to real-time notifications
let unsubscribe: (() => void) | null = null

onMounted(() => {
  notificationWS.connect(props.userId)
  unsubscribe = notificationWS.onNotification(show)
})

onUnmounted(() => {
  unsubscribe?.()
  // Clear all pending timers
  toasts.value.forEach((t) => clearTimeout(t.timer))
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 360px;
  width: 100%;
}

.toast-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid #7c3aed;
  border-radius: 10px;
  padding: 14px 14px 14px 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  pointer-events: all;
  cursor: default;
}

/* Border-left color per type */
.toast--auction_won   { border-left-color: #22c55e; }
.toast--outbid        { border-left-color: #f59e0b; }
.toast--payment_required { border-left-color: #ef4444; }
.toast--auction_rejected { border-left-color: #dc2626; }
.toast--bid_placed    { border-left-color: #10b981; }
.toast--auction_approved { border-left-color: #8b5cf6; }

.toast-icon {
  font-size: 20px;
  flex-shrink: 0;
  line-height: 1;
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-label {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 3px;
}

.toast-message {
  font-size: 13px;
  color: #111827;
  line-height: 1.4;
  margin: 0;
  /* 2-line clamp */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: #9ca3af;
  padding: 0;
  flex-shrink: 0;
  line-height: 1;
  align-self: flex-start;
}
.toast-close:hover { color: #374151; }

/* TransitionGroup animations */
.toast-enter-active { transition: all 0.25s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from   { opacity: 0; transform: translateX(40px); }
.toast-leave-to     { opacity: 0; transform: translateX(40px); }
</style>
