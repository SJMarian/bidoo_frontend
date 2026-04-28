import { ref, computed } from 'vue'
import { notificationApi } from '../services/notificationsApi'
import type { Notification } from '../types/notifications'

interface Toast {
  id: string
  notification: Notification
}

export function useNotifications(userId: number) {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  const toasts = ref<Toast[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.isRead)
  )

  async function fetchNotifications() {
    loading.value = true
    error.value = null
    try {
      notifications.value = await notificationApi.getUserNotifications(userId)
      unreadCount.value = await notificationApi.getUnreadCount(userId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch notifications'
    } finally {
      loading.value = false
    }
  }

  async function fetchUnreadNotifications() {
    loading.value = true
    error.value = null
    try {
      notifications.value = await notificationApi.getUnreadNotifications(userId)
      unreadCount.value = await notificationApi.getUnreadCount(userId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch unread notifications'
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(notificationId: number) {
    try {
      const updated = await notificationApi.markAsRead(notificationId)
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index] = updated
      }
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark as read'
    }
  }

  async function markAllAsRead() {
    try {
      await notificationApi.markAllAsRead(userId)
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to mark all as read'
    }
  }

  async function deleteNotification(notificationId: number) {
    try {
      await notificationApi.deleteNotification(notificationId)
      notifications.value = notifications.value.filter(n => n.id !== notificationId)
      const wasUnread = !notifications.value.find(n => n.id === notificationId)?.isRead
      if (wasUnread) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete notification'
    }
  }

  function showToast(notification: Notification, durationMs = 5000) {
    const toastId = `${notification.id}-${Date.now()}`
    toasts.value.push({ id: toastId, notification })
    
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== toastId)
    }, durationMs)
  }

  function clearToasts() {
    toasts.value = []
  }

  return {
    notifications,
    unreadNotifications,
    unreadCount,
    toasts,
    loading,
    error,
    fetchNotifications,
    fetchUnreadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    showToast,
    clearToasts
  }
}
