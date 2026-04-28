import type { Notification, NotificationType } from '../types/notifications'

const API_BASE = 'http://localhost:8080/api/notifications'

export const notificationApi = {
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/user/${userId}`)
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
    return res.json()
  },

  async getUnreadNotifications(userId: number): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/user/${userId}/unread`)
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
    return res.json()
  },

  async getUnreadCount(userId: number): Promise<number> {
    const res = await fetch(`${API_BASE}/user/${userId}/unread-count`)
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
    const data = await res.json()
    return data.unreadCount
  },

  async getNotificationsByType(userId: number, type: NotificationType): Promise<Notification[]> {
    const res = await fetch(`${API_BASE}/user/${userId}/type/${type}`)
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
    return res.json()
  },

  async markAsRead(notificationId: number): Promise<Notification> {
    const res = await fetch(`${API_BASE}/${notificationId}/read`, {
      method: 'PUT'
    })
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
    return res.json()
  },

  async markAllAsRead(userId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/user/${userId}/read-all`, {
      method: 'PUT'
    })
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
  },

  async deleteNotification(notificationId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/${notificationId}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
  },

  async deleteUserNotifications(userId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/user/${userId}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error(await res.text() || `HTTP ${res.status}`)
  }
}
