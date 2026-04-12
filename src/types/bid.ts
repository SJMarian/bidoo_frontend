export type BidIncrementType = 'FIXED' | 'PERCENTAGE'

export interface BidStateResponse {
  auctionId: number
  currentHighestBid: number | null
  startingPrice: number
  minimumNextBid: number
  minimumBidIncrement: number
  incrementType: BidIncrementType
  bidsBlocked: boolean
  auctionStatus: string
  totalBids: number
}

export interface BidResponse {
  id: number
  auctionId: number
  bidderUsername: string
  amount: number
  placedAt: string
}

export interface PlaceBidRequest {
  bidderUsername: string
  amount: number
}

export interface BidValidationResponse {
  valid: boolean
  message: string
  minimumNextBid: number
}

export interface UpdateIncrementRuleRequest {
  minimumBidIncrement: number
  incrementType: BidIncrementType
}
