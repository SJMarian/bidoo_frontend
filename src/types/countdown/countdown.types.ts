// src/types/countdown/countdown.types.ts

export type AuctionState = 'UPCOMING' | 'ACTIVE' | 'CLOSED' | 'PAID'

export interface ServerTimeResponse {
  serverTimeMs: number
  serverTimeIso: string
}

export interface AuctionCountdownResponse {
  auctionId: number
  auctionTitle: string
  state: AuctionState
  endTimeMs: number
  startTimeMs: number
  serverTimeMs: number
  remainingMs: number
}

export interface AuctionStateChangeEvent {
  auctionId: number
  previousState: AuctionState
  newState: AuctionState
  winnerId: number | null
  winningBid: number
  serverTimeMs: number
}

/** Parsed countdown broken into display-friendly parts */
export interface CountdownParts {
  hours: string
  minutes: string
  seconds: string
  totalSeconds: number
  isFinalTen: boolean  // true when <= 10 seconds remain
  isExpired: boolean
}
