// src/services/notification/notificationApi.ts
//
// All REST calls to the backend notification endpoints.
// Base URL points to Spring Boot on port 8080.

import type {
  Notification,
  UnreadCountResponse,
  CreateNotificationRequest,
} from '@/types/notification/notification.types'

const BASE_URL = 'http://localhost:8080/api/notifications'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export const notificationApi = {
  /** Fetch all notifications for a user (newest first) */
  async getAll(userId: number): Promise<Notification[]> {
    const res = await fetch(`${BASE_URL}?userId=${userId}`)
    return handleResponse<Notification[]>(res)
  },

  /** Fetch only unread notifications */
  async getUnread(userId: number): Promise<Notification[]> {
    const res = await fetch(`${BASE_URL}/unread?userId=${userId}`)
    return handleResponse<Notification[]>(res)
  },

  /** Get unread count for the notification badge */
  async getUnreadCount(userId: number): Promise<UnreadCountResponse> {
    const res = await fetch(`${BASE_URL}/count?userId=${userId}`)
    return handleResponse<UnreadCountResponse>(res)
  },

  /** Create and send a notification (internal / admin use) */
  async create(request: CreateNotificationRequest): Promise<Notification> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })
    return handleResponse<Notification>(res)
  },

  /** Mark a single notification as read */
  async markAsRead(notificationId: number, userId: number): Promise<Notification> {
    const res = await fetch(`${BASE_URL}/${notificationId}/read?userId=${userId}`, {
      method: 'PATCH',
    })
    return handleResponse<Notification>(res)
  },

  /** Mark all notifications as read */
  async markAllAsRead(userId: number): Promise<{ updated: number; message: string }> {
    const res = await fetch(`${BASE_URL}/read-all?userId=${userId}`, {
      method: 'PATCH',
    })
    return handleResponse<{ updated: number; message: string }>(res)
  },

  /** Delete a notification */
  async deleteNotification(notificationId: number, userId: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/${notificationId}?userId=${userId}`, {
      method: 'DELETE',
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Delete failed ${res.status}: ${text}`)
    }
  },
}
