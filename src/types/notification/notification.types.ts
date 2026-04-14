// src/types/notification/notification.types.ts

export type NotificationType =
  | 'AUCTION_WON'
  | 'AUCTION_CLOSED'
  | 'OUTBID'
  | 'AUCTION_STARTING'
  | 'BID_PLACED'
  | 'PAYMENT_REQUIRED'
  | 'AUCTION_APPROVED'
  | 'AUCTION_REJECTED'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  message: string
  auctionTitle: string | null
  auctionId: number | null
  amount?: number | string // Payment amount for AUCTION_WON
  finalPrice?: number | string // Auction final price
  read: boolean
  accepted: boolean | null
  rejected: boolean | null
  createdAt: string // ISO 8601
}

export interface UnreadCountResponse {
  count: number
}

export interface CreateNotificationRequest {
  userId: number
  type: NotificationType
  message: string
  auctionTitle?: string
  auctionId?: number
}

/** Maps each notification type to a display label and icon (emoji) */
export const NOTIFICATION_META: Record<
  NotificationType,
  { label: string; icon: string; color: string }
> = {
  AUCTION_WON: { label: 'Auction Won', icon: '🏆', color: '#22c55e' },
  AUCTION_CLOSED: { label: 'Auction Closed', icon: '🔔', color: '#6b7280' },
  OUTBID: { label: 'Outbid', icon: '⚡', color: '#f59e0b' },
  AUCTION_STARTING: { label: 'Auction Starting', icon: '🚀', color: '#3b82f6' },
  BID_PLACED: { label: 'Bid Placed', icon: '✅', color: '#10b981' },
  PAYMENT_REQUIRED: { label: 'Payment Required', icon: '💳', color: '#ef4444' },
  AUCTION_APPROVED: { label: 'Auction Approved', icon: '✔️', color: '#8b5cf6' },
  AUCTION_REJECTED: { label: 'Auction Rejected', icon: '❌', color: '#dc2626' },
}
