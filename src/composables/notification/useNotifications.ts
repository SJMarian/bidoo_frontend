// src/composables/notification/useNotifications.ts
//
// Central composable for the notification system.
// Manages: fetching, real-time updates, read/unread state, deletion.
//
// Usage:
//   const { notifications, unreadCount, markAsRead, markAllAsRead, remove } = useNotifications(userId)

import { ref, computed, onUnmounted } from 'vue'
import type { Notification } from '@/types/notification/notification.types'
import { notificationApi } from '@/services/notification/notificationApi'
import { notificationWS } from '@/services/notification/notificationWebSocket'

export function useNotifications(userId: number) {
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Derived state
  const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length)
  const hasUnread = computed(() => unreadCount.value > 0)

  /** Load all notifications from the backend */
  async function fetchAll(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      notifications.value = await notificationApi.getAll(userId)
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load notifications'
    } finally {
      loading.value = false
    }
  }

  /** Mark a single notification as read */
  async function markAsRead(notificationId: number): Promise<void> {
    try {
      const updated = await notificationApi.markAsRead(notificationId, userId)
      const idx = notifications.value.findIndex((n) => n.id === notificationId)
      if (idx !== -1) notifications.value[idx] = updated
    } catch (e: any) {
      error.value = e.message ?? 'Failed to mark as read'
    }
  }

  /** Accept a notification */
  async function acceptNotification(notificationId: number): Promise<void> {
    try {
      const updated = await notificationApi.acceptNotification(notificationId, userId)
      const idx = notifications.value.findIndex((n) => n.id === notificationId)
      if (idx !== -1) notifications.value[idx] = updated
    } catch (e: any) {
      error.value = e.message ?? 'Failed to accept notification'
    }
  }

  /** Reject a notification */
  async function rejectNotification(notificationId: number): Promise<void> {
    try {
      const updated = await notificationApi.rejectNotification(notificationId, userId)
      const idx = notifications.value.findIndex((n) => n.id === notificationId)
      if (idx !== -1) notifications.value[idx] = updated
    } catch (e: any) {
      error.value = e.message ?? 'Failed to reject notification'
    }
  }

  /** Mark all notifications as read */
  async function markAllAsRead(): Promise<void> {
    try {
      await notificationApi.markAllAsRead(userId)
      notifications.value = notifications.value.map((n) => ({ ...n, read: true }))
    } catch (e: any) {
      error.value = e.message ?? 'Failed to mark all as read'
    }
  }

  /** Delete a notification */
  async function remove(notificationId: number): Promise<void> {
    try {
      await notificationApi.deleteNotification(notificationId, userId)
      notifications.value = notifications.value.filter((n) => n.id !== notificationId)
    } catch (e: any) {
      error.value = e.message ?? 'Failed to delete notification'
    }
  }

  /** Handle a real-time notification arriving via WebSocket */
  function handleIncoming(notification: Notification): void {
    // Prepend to the top of the list (newest first)
    notifications.value = [notification, ...notifications.value]
  }

  // Connect WebSocket and register callback
  let unsubscribe = () => {}
  try {
    notificationWS.connect(userId)
    unsubscribe = notificationWS.onNotification(handleIncoming)
  } catch (e) {
    console.error('[useNotifications] Failed to initialize WebSocket:', e)
    // Continue without WebSocket - notifications will still work via polling
  }

  // Initial load
  fetchAll()

  // Cleanup when component unmounts
  onUnmounted(() => {
    unsubscribe()
  })

  return {
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
  }
}
