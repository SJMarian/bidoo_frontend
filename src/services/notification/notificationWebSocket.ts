// src/services/notification/notificationWebSocket.ts
//
// Manages the WebSocket (STOMP over SockJS) connection for real-time notifications.
// Uses the globally available SockJS and STOMP loaded via CDN in index.html.
//
// NOTE: Add these two CDN scripts to your index.html <head>:
//   <script src="https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js"></script>
//   <script src="https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js"></script>

import type { Notification } from '@/types/notification/notification.types'

declare const SockJS: any
declare const Stomp: any

type NotificationCallback = (notification: Notification) => void

class NotificationWebSocketService {
  private stompClient: any = null
  private connected = false
  private subscribers: NotificationCallback[] = []
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private currentUserId: number | null = null

  /**
   * Connect to the WebSocket and subscribe to the user's personal notification queue.
   * @param userId  The logged-in user's ID (sent as a STOMP connect header)
   */
  connect(userId: number): void {
    if (this.connected && this.currentUserId === userId) return

    this.currentUserId = userId
    this.disconnect() // clean up any existing connection first

    const socket = new SockJS('http://localhost:8080/ws')
    this.stompClient = Stomp.over(socket)

    // Suppress STOMP debug logs in production
    this.stompClient.debug = import.meta.env.DEV ? console.log : () => {}

    const connectHeaders = { userId: String(userId) }

    this.stompClient.connect(
      connectHeaders,
      () => {
        this.connected = true
        console.log('[Notifications] WebSocket connected for user', userId)

        // Subscribe to the user-specific notification queue
        // Backend sends to: /user/{userId}/queue/notifications
        try {
          if (this.stompClient && this.stompClient.connected) {
            this.stompClient.subscribe('/user/queue/notifications', (frame: any) => {
              try {
                const notification: Notification = JSON.parse(frame.body)
                this.subscribers.forEach((cb) => cb(notification))
              } catch (e) {
                console.error('[Notifications] Failed to parse notification frame:', e)
              }
            })
          } else {
            console.warn('[Notifications] STOMP client not properly connected, will retry')
            setTimeout(() => this.connect(userId), 1000)
          }
        } catch (e) {
          console.error('[Notifications] Failed to subscribe:', e)
          setTimeout(() => this.connect(userId), 1000)
        }
      },
      (error: any) => {
        console.error('[Notifications] WebSocket error:', error)
        this.connected = false
        this.scheduleReconnect(userId)
      },
    )
  }

  /** Disconnect gracefully */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.stompClient && this.connected) {
      try {
        this.stompClient.disconnect()
      } catch (_) {}
    }
    this.connected = false
    this.stompClient = null
  }

  /** Register a callback to receive new notifications in real-time */
  onNotification(callback: NotificationCallback): () => void {
    this.subscribers.push(callback)
    // Return an unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback)
    }
  }

  get isConnected(): boolean {
    return this.connected
  }

  private scheduleReconnect(userId: number): void {
    if (this.reconnectTimer) return
    console.log('[Notifications] Reconnecting in 5s...')
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect(userId)
    }, 5000)
  }
}

// Singleton — one connection per app session
export const notificationWS = new NotificationWebSocketService()
