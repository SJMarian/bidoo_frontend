export type AuctionStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'UPCOMING'
  | 'ACTIVE'
  | 'CLOSED'
  | 'PAID'
  | 'REJECTED'
  | 'CANCELLED'

export type AdminActionType =
  | 'APPROVE'
  | 'REJECT'
  | 'CANCEL'
  | 'BLOCK_BIDS'
  | 'UNBLOCK_BIDS'
  | 'MANUAL_CLOSE'
  | 'REOPEN'

export interface Auction {
  id: number
  title: string
  category: string
  description: string
  startingPrice: number
  minimumBidIncrement: number
  startTime: string
  endTime: string
  status: AuctionStatus
  sellerUsername: string
  rejectionReason: string | null
  cancellationReason: string | null
  bidsBlocked: boolean
  createdAt: string
  updatedAt: string
}

export interface AdminActionLog {
  id: number
  auctionId: number
  auctionTitle: string
  actionType: AdminActionType
  reason: string | null
  performedBy: string
  performedAt: string
}

export interface RejectRequest {
  reason: string
}

export interface CancelRequest {
  reason: string
}

export interface ManualCloseRequest {
  reason: string
}

export interface ReopenRequest {
  newEndTime: string
  reason?: string
}
