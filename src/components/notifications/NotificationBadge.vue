<template>
  <div class="notification-badge-wrapper">
    <button
      class="notification-badge-btn"
      @click="togglePanel"
      :aria-label="`Notifications (${unreadCount} unread)`"
    >
      <span class="notification-badge-btn__icon">🔔</span>
      <span v-if="unreadCount > 0" class="notification-badge-btn__badge">
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <div v-if="showPanel" class="notification-dropdown">
      <NotificationPanel
        :notifications="notifications"
        :unreadCount="unreadCount"
        :loading="loading"
        @closePanel="showPanel = false"
        @markAsRead="markAsRead"
        @markAllAsRead="markAllAsRead"
        @deleteNotification="deleteNotification"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="showPanel"
        class="notification-overlay"
        @click="showPanel = false"
      ></div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NotificationPanel from './NotificationPanel.vue'
import { useNotifications } from '../../composables/useNotifications'
import { NotificationWebSocketService } from '../../services/notificationWebSocket'

interface Props {
  userId: number
}

const props = defineProps<Props>()

const showPanel = ref(false)
const {
  notifications,
  unreadCount,
  loading,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  showToast
} = useNotifications(props.userId)

let wsService: NotificationWebSocketService | null = null

onMounted(async () => {
  // Load initial notifications
  await fetchNotifications()

  // Try to connect to WebSocket for real-time updates
  wsService = new NotificationWebSocketService(props.userId)
  wsService.on('notification', async (notification) => {
    // Refresh notifications when a new one arrives
    await fetchNotifications()
    showToast(notification)
  })

  // Attempt WebSocket connection, but don't fail if it's not available
  wsService.connect().catch(err => {
    console.warn('WebSocket connection failed, using polling instead:', err)
  })

  // Polling fallback: refresh notifications every 30 seconds if WS is not available
  const pollingInterval = setInterval(async () => {
    if (!wsService?.isConnected()) {
      await fetchNotifications()
    }
  }, 5000)

  onUnmounted(() => {
    clearInterval(pollingInterval)
    if (wsService?.isConnected()) {
      wsService.disconnect()
    }
  })
})

function togglePanel() {
  showPanel.value = !showPanel.value
}
</script>

<style scoped>
.notification-badge-wrapper {
  position: relative;
}

.notification-badge-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text, #f1f5f9);
}

.notification-badge-btn:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.notification-badge-btn__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-badge-btn__badge {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  background-color: #ef4444;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  z-index: 1000;
}

.notification-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  background: transparent;
}
</style>
