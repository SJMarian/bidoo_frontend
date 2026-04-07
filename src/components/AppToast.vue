<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast--${toast.type}`"
          @click="remove(toast.id)"
        >
          <div class="toast-icon">
            <CircleCheck v-if="toast.type === 'success'" :size="20" />
            <CircleX v-else-if="toast.type === 'error'" :size="20" />
            <Info v-else-if="toast.type === 'info'" :size="20" />
            <TriangleAlert v-else-if="toast.type === 'warning'" :size="20" />
          </div>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" @click.stop="remove(toast.id)">
            <X :size="14" />
          </button>
          <div
            class="toast-progress"
            :style="{ animationDuration: toast.duration + 'ms' }"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'
import { CircleCheck, CircleX, Info, TriangleAlert, X } from 'lucide-vue-next'

const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 420px;
  width: 100%;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  background: #1e293b;
  color: #f1f5f9;
  font-family: 'Manrope', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
}

/* ── Type-specific accent colors ── */
.toast--success {
  border-left: 4px solid #22c55e;
}
.toast--success .toast-icon {
  color: #22c55e;
}
.toast--success .toast-progress {
  background: #22c55e;
}

.toast--error {
  border-left: 4px solid #ef4444;
}
.toast--error .toast-icon {
  color: #ef4444;
}
.toast--error .toast-progress {
  background: #ef4444;
}

.toast--info {
  border-left: 4px solid #3b82f6;
}
.toast--info .toast-icon {
  color: #3b82f6;
}
.toast--info .toast-progress {
  background: #3b82f6;
}

.toast--warning {
  border-left: 4px solid #f59e0b;
}
.toast--warning .toast-icon {
  color: #f59e0b;
}
.toast--warning .toast-progress {
  background: #f59e0b;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

/* ── Progress bar ── */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  opacity: 0.6;
  animation: shrink linear forwards;
}

@keyframes shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* ── Transition animations ── */
.toast-enter-active {
  animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  animation: slideOut 0.3s cubic-bezier(0.4, 0, 1, 1) forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes slideOut {
  from {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateX(100%) scale(0.9);
  }
}

@media (max-width: 480px) {
  .toast-container {
    top: auto;
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: 100%;
  }
}
</style>
