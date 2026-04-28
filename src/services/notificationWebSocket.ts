import type { Notification } from '../types/notifications'

export class NotificationWebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private userId: number
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private listeners: Map<string, Set<(data: any) => void>> = new Map()

  constructor(userId: number, wsUrl = 'ws://localhost:8080/ws/notifications') {
    this.userId = userId
    this.url = `${wsUrl}/${userId}`
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            this.emit('notification', data)
          } catch (err) {
            console.error('Failed to parse WebSocket message:', err)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      setTimeout(() => {
        this.connect().catch(err => console.error('Reconnection failed:', err))
      }, this.reconnectDelay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: (data: any) => void): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback)
    }
  }

  private emit(event: string, data: any): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data))
    }
  }

  send(message: any): void {
    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket is not connected')
    }
  }
}
