export interface DashboardMetrics {
  totalRevenue: number
  completedAuctions: number
  unpaidAuctions: number
  activeAuctions: number
  totalAuctions: number
  totalBids: number
  highestSellingItems: TopSellingItem[]
  revenueByCategory: CategoryRevenue[]
}

export interface TopSellingItem {
  auctionId: number
  title: string
  category: string
  finalPrice: number
  winnerUsername: string
}

export interface CategoryRevenue {
  category: string
  revenue: number
  auctionCount: number
}

export interface WinnerDeterminationResult {
  auctionId: number
  auctionTitle: string
  winnerUsername: string | null
  winningBidAmount: number | null
  auctionStatus: string
  message: string
}

export interface TransactionRecord {
  transactionId: number | null
  orderId: number
  auctionId: number | null
  auctionTitle: string
  winnerUsername: string
  sellerUsername: string
  paymentAmount: number
  currency: string
  paymentStatus: string
  transactionStatus: string
  gatewayTrxId: string
  paidAt: string | null
  createdAt: string | null
}

export interface InvoiceData {
  invoiceNumber: string
  orderId: number
  auctionId: number | null
  auctionTitle: string
  auctionDescription: string
  buyerName: string
  buyerEmail: string
  sellerName: string
  amount: number
  currency: string
  paymentStatus: string
  gatewayTrxId: string
  issuedAt: string | null
  paidAt: string | null
}

export interface BidDataPoint {
  placedAt: string
  amount: number
  bidderUsername: string
  bidNumber: number
}

export interface BidGrowthTrend {
  auctionId: number
  auctionTitle: string
  startingPrice: number
  currentHighestBid: number
  totalBids: number
  bidProgression: BidDataPoint[]
  growthPercent: number
}
