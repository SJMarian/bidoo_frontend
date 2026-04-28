import type {
  DashboardMetrics,
  WinnerDeterminationResult,
  TransactionRecord,
  InvoiceData,
  BidGrowthTrend,
} from '../types/analytics'

const BASE = 'http://localhost:8080'

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

const json = () => ({ 'Content-Type': 'application/json' })

export const analyticsApi = {
  // Dashboard
  getDashboard: (): Promise<DashboardMetrics> =>
    fetch(`${BASE}/api/admin/analytics/dashboard`).then((r) =>
      handle<DashboardMetrics>(r),
    ),

  // Winner determination
  determineWinner: (auctionId: number): Promise<WinnerDeterminationResult> =>
    fetch(`${BASE}/api/admin/analytics/determine-winner/${auctionId}`, {
      method: 'POST',
      headers: json(),
    }).then((r) => handle<WinnerDeterminationResult>(r)),

  determineAllWinners: (): Promise<WinnerDeterminationResult[]> =>
    fetch(`${BASE}/api/admin/analytics/determine-all-winners`, {
      method: 'POST',
      headers: json(),
    }).then((r) => handle<WinnerDeterminationResult[]>(r)),

  // Transaction records
  getAllTransactions: (): Promise<TransactionRecord[]> =>
    fetch(`${BASE}/api/admin/analytics/transactions`).then((r) =>
      handle<TransactionRecord[]>(r),
    ),

  getTransactionByAuction: (auctionId: number): Promise<TransactionRecord> =>
    fetch(`${BASE}/api/admin/analytics/transactions/${auctionId}`).then((r) =>
      handle<TransactionRecord>(r),
    ),

  // Invoice
  getInvoice: (orderId: number): Promise<InvoiceData> =>
    fetch(`${BASE}/api/admin/analytics/invoice/${orderId}`).then((r) =>
      handle<InvoiceData>(r),
    ),

  // Bid growth trend
  getBidGrowthTrend: (auctionId: number): Promise<BidGrowthTrend> =>
    fetch(`${BASE}/api/auctions/${auctionId}/bid-growth`).then((r) =>
      handle<BidGrowthTrend>(r),
    ),
}
