export enum NotificationType {
  AUCTION_CREATED = 'AUCTION_CREATED',
  AUCTION_CLOSED = 'AUCTION_CLOSED',
  BID_PLACED = 'BID_PLACED',
  BID_OUTBID = 'BID_OUTBID',
  AUCTION_ENDING_SOON = 'AUCTION_ENDING_SOON',
  YOU_WON_AUCTION = 'YOU_WON_AUCTION',
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  AUCTION_CANCELLED = 'AUCTION_CANCELLED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  AUCTION_APPROVED = 'AUCTION_APPROVED',
  AUCTION_REJECTED = 'AUCTION_REJECTED',
  AUCTION_MODERATED = 'AUCTION_MODERATED'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  ARCHIVED = 'ARCHIVED'
}

export enum SeverityLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message?: string;
  status: NotificationStatus;
  type: NotificationType;
  severity: SeverityLevel;
  isRead: boolean;
  relatedAuctionId?: number;
  relatedBidId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  unreadCount: number;
  notifications: Notification[];
}
