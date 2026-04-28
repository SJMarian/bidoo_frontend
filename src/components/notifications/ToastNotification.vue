<template>
  <Teleport to="body">
    <div v-if="toasts.length > 0" class="toast-container">
      <transition-group name="toast-list" tag="div" class="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast--${toast.notification.severity.toLowerCase()}`]"
          role="alert"
          aria-live="polite"
        >
          <div class="toast__icon">
            <IconSuccess v-if="toast.notification.severity === 'SUCCESS'" />
            <IconWarning v-else-if="toast.notification.severity === 'WARNING'" />
            <IconError v-else-if="toast.notification.severity === 'ERROR'" />
            <IconInfo v-else />
          </div>
          <div class="toast__content">
            <div class="toast__title">{{ toast.notification.title }}</div>
            <div v-if="toast.notification.message" class="toast__message">
              {{ toast.notification.message }}
            </div>
          </div>
          <button
            class="toast__close"
            @click="removeToast(toast.id)"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Notification } from '../../types/notifications'

interface Toast {
  id: string
  notification: Notification
}

// Placeholder icon components - replace with actual icons
const IconSuccess = () => '✓'
const IconWarning = () => '⚠'
const IconError = () => '✕'
const IconInfo = () => 'ℹ'

defineProps({
  toasts: {
    type: Array as PropType<Toast[]>,
    required: true
  }
})

const emit = defineEmits<{
  removeToast: [id: string]
}>()

const removeToast = (id: string) => {
  emit('removeToast', id)
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  pointer-events: auto;
  animation: slideInRight 0.3s ease-out;
  font-size: 14px;
}

.toast--success {
  background-color: #10b981;
  color: white;
  border-left: 4px solid #059669;
}

.toast--info {
  background-color: #3b82f6;
  color: white;
  border-left: 4px solid #1d4ed8;
}

.toast--warning {
  background-color: #f59e0b;
  color: white;
  border-left: 4px solid #d97706;
}

.toast--error {
  background-color: #ef4444;
  color: white;
  border-left: 4px solid #dc2626;
}

.toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-weight: bold;
  font-size: 16px;
}

.toast__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toast__title {
  font-weight: 600;
}

.toast__message {
  font-weight: 400;
  opacity: 0.9;
}

.toast__close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: inherit;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast__close:hover {
  opacity: 1;
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.toast-list-leave-to {
  transform: translateX(400px);
  opacity: 0;
}
</style>
