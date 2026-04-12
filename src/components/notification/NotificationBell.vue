<template>
  <!-- Notification Bell — sits in the top navbar -->
  <div class="notification-bell" ref="bellRef">
    <button
      class="bell-btn"
      :class="{ 'has-unread': hasUnread }"
      @click="togglePanel"
      aria-label="Notifications"
    >
      <!-- Bell SVG icon -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="{ ringing: hasUnread }"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      <!-- Unread badge -->
      <span v-if="hasUnread" class="badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown panel -->
    <NotificationPanel
      v-if="panelOpen"
      :user-id="userId"
      @close="panelOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NotificationPanel from './NotificationPanel.vue'
import { useNotifications } from '@/composables/notification/useNotifications'

const props = defineProps<{ userId: number }>()

const { hasUnread, unreadCount } = useNotifications(props.userId)

const panelOpen = ref(false)
const bellRef = ref<HTMLElement | null>(null)

function togglePanel() {
  panelOpen.value = !panelOpen.value
}

// Close panel when clicking outside
function handleOutsideClick(e: MouseEvent) {
  if (bellRef.value && !bellRef.value.contains(e.target as Node)) {
    panelOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', handleOutsideClick))
</script>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.bell-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  color: #4b5563;
  transition: background 0.2s, color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bell-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.bell-btn.has-unread {
  color: #7c3aed;
}

/* Badge */
.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
}

/* Bell ring animation for new notifications */
@keyframes ring {
  0%   { transform: rotate(0deg); }
  10%  { transform: rotate(15deg); }
  20%  { transform: rotate(-12deg); }
  30%  { transform: rotate(10deg); }
  40%  { transform: rotate(-8deg); }
  50%  { transform: rotate(5deg); }
  60%  { transform: rotate(-3deg); }
  70%  { transform: rotate(2deg); }
  80%  { transform: rotate(-1deg); }
  90%  { transform: rotate(1deg); }
  100% { transform: rotate(0deg); }
}

.ringing {
  animation: ring 0.8s ease-in-out;
  transform-origin: top center;
}
</style>
