import type {
  BidStateResponse,
  BidResponse,
  PlaceBidRequest,
  BidValidationResponse,
  UpdateIncrementRuleRequest,
} from '../types/bid'

const BASE = 'http://localhost:8080/api'

const headers = () => ({ 'Content-Type': 'application/json' })

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const bidApi = {
  /** Get current bid state — highest bid, minimum next bid, rule config */
  getBidState: (auctionId: number): Promise<BidStateResponse> =>
    fetch(`${BASE}/auctions/${auctionId}/bid-state`).then((r) =>
      handle<BidStateResponse>(r),
    ),

  /** Full bid history for an auction */
  getBidHistory: (auctionId: number): Promise<BidResponse[]> =>
    fetch(`${BASE}/auctions/${auctionId}/bids`).then((r) =>
      handle<BidResponse[]>(r),
    ),

  /** Pre-validate a bid amount before submitting */
  validateBid: (auctionId: number, amount: number): Promise<BidValidationResponse> =>
    fetch(`${BASE}/auctions/${auctionId}/validate-bid?amount=${amount}`).then((r) =>
      handle<BidValidationResponse>(r),
    ),

  /** Place a bid */
  placeBid: (auctionId: number, body: PlaceBidRequest): Promise<BidResponse> =>
    fetch(`${BASE}/auctions/${auctionId}/bids`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handle<BidResponse>(r)),

  /** Admin: update increment rule */
  updateIncrementRule: (
    auctionId: number,
    body: UpdateIncrementRuleRequest,
  ): Promise<BidStateResponse> =>
    fetch(`${BASE}/admin/auctions/${auctionId}/increment-rule`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handle<BidStateResponse>(r)),
}
