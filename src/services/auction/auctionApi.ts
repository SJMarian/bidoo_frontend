// src/services/auction/auctionApi.ts

interface AuctionData {
  id: number
  title: string
  description: string
  startingPrice: number
  currentHighestBid: number
  highestBidderId: number | null
  state: 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'PAID'
  startTime: string
  endTime: string
}

const BASE_URL = 'http://localhost:8080/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<T>
}

export const auctionApi = {
  /**
   * Get all auctions
   */
  async getAllAuctions(): Promise<AuctionData[]> {
    const res = await fetch(`${BASE_URL}/auctions`)
    return handleResponse<AuctionData[]>(res)
  },

  /**
   * Get a single auction by ID
   */
  async getAuction(auctionId: number): Promise<AuctionData> {
    const res = await fetch(`${BASE_URL}/auctions/${auctionId}`)
    return handleResponse<AuctionData>(res)
  },

  /**
   * Get active auctions
   */
  async getActiveAuctions(): Promise<AuctionData[]> {
    const res = await fetch(`${BASE_URL}/auctions?state=ACTIVE`)
    return handleResponse<AuctionData[]>(res)
  },
}
