import type {
  Auction,
  AdminActionLog,
  RejectRequest,
  CancelRequest,
  ManualCloseRequest,
  ReopenRequest,
} from '../types/auction'

const BASE_URL = 'http://localhost:8080/api/admin/auctions'
const ADMIN_USERNAME = 'admin' // In production, pull from auth store

const headers = () => ({
  'Content-Type': 'application/json',
  'X-Admin-Username': ADMIN_USERNAME,
})

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const msg = await res.text()
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const adminModerationApi = {
  // READ
  getAllAuctions: (): Promise<Auction[]> =>
    fetch(`${BASE_URL}`, { headers: headers() }).then((r) => handleResponse<Auction[]>(r)),

  getPendingAuctions: (): Promise<Auction[]> =>
    fetch(`${BASE_URL}/pending`, { headers: headers() }).then((r) => handleResponse<Auction[]>(r)),

  getAuction: (id: number): Promise<Auction> =>
    fetch(`${BASE_URL}/${id}`, { headers: headers() }).then((r) => handleResponse<Auction>(r)),

  // MODERATION ACTIONS
  approve: (id: number): Promise<Auction> =>
    fetch(`${BASE_URL}/${id}/approve`, { method: 'POST', headers: headers() }).then((r) =>
      handleResponse<Auction>(r),
    ),

  reject: (id: number, body: RejectRequest): Promise<Auction> =>
    fetch(`${BASE_URL}/${id}/reject`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<Auction>(r)),

  cancel: (id: number, body: CancelRequest): Promise<Auction> =>
    fetch(`${BASE_URL}/${id}/cancel`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<Auction>(r)),

  blockBids: (id: number): Promise<Auction> =>
    fetch(`${BASE_URL}/${id}/block-bids`, { method: 'POST', headers: headers() }).then((r) =>
      handleResponse<Auction>(r),
    ),

  unblockBids: (id: number): Promise<Auction> =>
    fetch(`${BASE_URL}/${id}/unblock-bids`, { method: 'POST', headers: headers() }).then((r) =>
      handleResponse<Auction>(r),
    ),

  manualClose: (id: number, body: ManualCloseRequest): Promise<Auction> =>
    fetch(`${BASE_URL}/${id}/close`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<Auction>(r)),

  reopen: (id: number, body: ReopenRequest): Promise<Auction> =>
    fetch(`${BASE_URL}/${id}/reopen`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then((r) => handleResponse<Auction>(r)),

  // LOGS
  getAllLogs: (): Promise<AdminActionLog[]> =>
    fetch(`${BASE_URL}/logs`, { headers: headers() }).then((r) =>
      handleResponse<AdminActionLog[]>(r),
    ),

  getAuctionLogs: (id: number): Promise<AdminActionLog[]> =>
    fetch(`${BASE_URL}/${id}/logs`, { headers: headers() }).then((r) =>
      handleResponse<AdminActionLog[]>(r),
    ),
}
