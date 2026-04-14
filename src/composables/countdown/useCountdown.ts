// src/composables/countdown/useCountdown.ts
//
// Server-synchronized countdown composable.
//
// How server sync works:
//   1. On mount, fetch server time from GET /api/time
//   2. Calculate clockOffset = serverTimeMs - Date.now()
//   3. Every tick: effectiveNow = Date.now() + clockOffset
//   4. remainingMs = endTimeMs - effectiveNow
//
// This means even if the user's system clock is wrong, the countdown
// always reflects the actual server time.

import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import type {
  AuctionState,
  AuctionStateChangeEvent,
  CountdownParts,
} from '@/types/countdown/countdown.types'
import { countdownApi } from '@/services/countdown/countdownApi'

declare const SockJS: any
declare const Stomp: any

function pad(n: number): string {
  return String(Math.floor(n)).padStart(2, '0')
}

/**
 * Get the WebSocket endpoint URL.
 * SockJS expects an HTTP URL, not a ws:// URL.
 * It will handle the protocol upgrade internally.
 */
function getWebSocketUrl(): string {
  // Use HTTP URL for the SockJS endpoint
  return 'http://localhost:8080/ws'
}

function msToCountdownParts(ms: number): CountdownParts {
  if (ms <= 0) {
    return { hours: '00', minutes: '00', seconds: '00', totalSeconds: 0, isFinalTen: false, isExpired: true }
  }
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    totalSeconds,
    isFinalTen: totalSeconds <= 10,
    isExpired: false,
  }
}

export function useCountdown(auctionId: number) {
  const state = ref<AuctionState>('UPCOMING')
  const endTimeMs = ref(0)
  const clockOffset = ref(0)       // diff between server clock and client clock in ms
  const remainingMs = ref(0)
  const loading = ref(true)
  const isClosed = ref(false)
  const winner = ref<{ winnerId: number | null; winningBid: number } | null>(null)

  const countdown = computed<CountdownParts>(() => msToCountdownParts(remainingMs.value))

  let tickInterval: ReturnType<typeof setInterval> | null = null
  let stompClient: any = null

  // ── Tick ────────────────────────────────────────────────────────────────────

  function startTick() {
    if (tickInterval) clearInterval(tickInterval)
    tickInterval = setInterval(() => {
      if (state.value !== 'ACTIVE') {
        remainingMs.value = 0
        return
      }
      const effectiveNow = Date.now() + clockOffset.value
      remainingMs.value = Math.max(0, endTimeMs.value - effectiveNow)

      if (remainingMs.value === 0 && !isClosed.value) {
        // Time's up client-side; server will confirm via WebSocket shortly
        state.value = 'CLOSED'
      }
    }, 1000)
  }

  // ── Initialization ───────────────────────────────────────────────────────────

  async function init() {
    loading.value = true
    try {
      // 1. Get server time to calculate clock offset
      const serverTime = await countdownApi.getServerTime()
      clockOffset.value = serverTime.serverTimeMs - Date.now()

      // 2. Get auction countdown data
      const data = await countdownApi.getCountdown(auctionId)
      state.value = data.state
      endTimeMs.value = data.endTimeMs
      remainingMs.value = data.remainingMs

      if (data.state === 'ACTIVE') startTick()
      if (data.state === 'CLOSED' || data.state === 'PAID') isClosed.value = true
    } catch (e) {
      console.error('[Countdown] Init failed:', e)
    } finally {
      loading.value = false
    }
  }

  // ── WebSocket ─────────────────────────────────────────────────────────────────

  function connectWebSocket() {
    const wsUrl = getWebSocketUrl()
    const socket = new SockJS(wsUrl)
    stompClient = Stomp.over(socket)
    stompClient.debug = import.meta.env.DEV ? console.log : () => {}

    stompClient.connect({}, () => {
      // Subscribe to state changes for this specific auction
      stompClient.subscribe(`/topic/auction/${auctionId}/state`, (frame: any) => {
        const event: AuctionStateChangeEvent = JSON.parse(frame.body)
        handleStateChange(event)
      })
    }, (error: any) => {
      console.error('[Countdown] WebSocket connection error:', error)
    })
  }

  function handleStateChange(event: AuctionStateChangeEvent) {
    state.value = event.newState

    if (event.newState === 'ACTIVE') {
      startTick()
      isClosed.value = false
    }

    if (event.newState === 'CLOSED') {
      isClosed.value = true
      remainingMs.value = 0
      if (tickInterval) clearInterval(tickInterval)
      winner.value = { winnerId: event.winnerId, winningBid: event.winningBid }
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────────

  onMounted(() => {
    init()
    connectWebSocket()
  })

  onUnmounted(() => {
    if (tickInterval) clearInterval(tickInterval)
    if (stompClient) {
      try { stompClient.disconnect() } catch (_) {}
    }
  })

  return {
    state: readonly(state),
    countdown,
    remainingMs: readonly(remainingMs),
    isClosed: readonly(isClosed),
    winner: readonly(winner),
    loading: readonly(loading),
  }
}
