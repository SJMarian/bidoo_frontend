// src/services/countdown/countdownApi.ts

import type { AuctionCountdownResponse, ServerTimeResponse } from '@/types/countdown/countdown.types'

const BASE_URL = 'http://localhost:8080/api'

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json() as Promise<T>
}

export const countdownApi = {
  /**
   * Get the current server time.
   * Call once on page load to calculate client↔server clock offset.
   */
  async getServerTime(): Promise<ServerTimeResponse> {
    const res = await fetch(`${BASE_URL}/time`)
    return handleResponse<ServerTimeResponse>(res)
  },

  /**
   * Get countdown timing data for a specific auction.
   */
  async getCountdown(auctionId: number): Promise<AuctionCountdownResponse> {
    const res = await fetch(`${BASE_URL}/auctions/${auctionId}/countdown`)
    return handleResponse<AuctionCountdownResponse>(res)
  },
}
