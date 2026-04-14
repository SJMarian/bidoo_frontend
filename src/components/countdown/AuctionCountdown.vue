<template>
  <div class="auction-countdown">

    <!-- ── UPCOMING state ──────────────────────────────────────────── -->
    <div v-if="state === 'UPCOMING'" class="status-badge upcoming">
      <span class="status-dot"></span>
      Auction starts soon
    </div>

    <!-- ── ACTIVE state: countdown timer ──────────────────────────── -->
    <div v-else-if="state === 'ACTIVE'" class="timer-wrapper">
      <p class="timer-label">Auction ends in</p>

      <div
        class="timer"
        :class="{
          'timer--final-ten': countdown.isFinalTen,
          'timer--pulse': countdown.isFinalTen,
        }"
      >
        <!-- Hours -->
        <div class="timer-unit" v-if="showHours">
          <span class="timer-digit">{{ countdown.hours }}</span>
          <span class="timer-unit-label">h</span>
        </div>
        <span class="timer-colon" v-if="showHours">:</span>

        <!-- Minutes -->
        <div class="timer-unit">
          <span class="timer-digit">{{ countdown.minutes }}</span>
          <span class="timer-unit-label">m</span>
        </div>
        <span class="timer-colon">:</span>

        <!-- Seconds -->
        <div class="timer-unit">
          <span
            class="timer-digit"
            :class="{ 'digit--tick': tickClass }"
            @animationend="tickClass = false"
          >
            {{ countdown.seconds }}
          </span>
          <span class="timer-unit-label">s</span>
        </div>
      </div>

      <!-- Final 10 second warning bar -->
      <div v-if="countdown.isFinalTen" class="warning-bar">
        <span class="warning-icon">⚠️</span>
        Final {{ countdown.totalSeconds }} second{{ countdown.totalSeconds !== 1 ? 's' : '' }}!
      </div>
    </div>

    <!-- ── CLOSED state: animated banner ──────────────────────────── -->
    <Transition name="closed-banner">
      <div v-if="state === 'CLOSED' || state === 'PAID'" class="closed-banner">
        <div class="closed-inner">
          <span class="closed-icon">🔨</span>
          <span class="closed-text">Auction Closed</span>
        </div>
        <div v-if="winner && winner.winnerId" class="winner-line">
          Winning bid: <strong>${{ winner.winningBid.toFixed(2) }}</strong>
        </div>
        <div v-else class="winner-line no-bids">
          No bids were placed
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCountdown } from '@/composables/countdown/useCountdown'

const props = defineProps<{ auctionId: number }>()
const emit = defineEmits<{
  (e: 'stateChange', auctionId: number, newState: string): void
}>()

const { state, countdown, winner } = useCountdown(props.auctionId)
watch(state, (newState) => {
  emit('stateChange', props.auctionId, newState)
})

// Only show hours column when there's at least 1 hour remaining
const showHours = computed(() => parseInt(countdown.value.hours) > 0)

// Trigger a CSS tick animation every time the seconds digit changes
const tickClass = ref(false)
watch(
  () => countdown.value.seconds,
  () => {
    tickClass.value = false
    requestAnimationFrame(() => { tickClass.value = true })
  },
)
</script>

<style scoped>
.auction-countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-family: inherit;
}

/* ── Upcoming badge ─────────────────────────────────────────────── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.upcoming {
  background: #eff6ff;
  color: #3b82f6;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  animation: blink 1.2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

/* ── Timer wrapper ──────────────────────────────────────────────── */
.timer-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.timer-label {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

/* ── Timer digits ───────────────────────────────────────────────── */
.timer {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.4s ease;
}

.timer-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timer-digit {
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
  color: #111827;
  font-variant-numeric: tabular-nums;
  min-width: 56px;
  text-align: center;
  display: inline-block;
  transition: color 0.3s ease;
}

.timer-unit-label {
  font-size: 10px;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.timer-colon {
  font-size: 36px;
  font-weight: 700;
  color: #d1d5db;
  margin-bottom: 14px;
  line-height: 1;
}

/* ── Final 10 seconds: color transition + pulse ─────────────────── */
.timer--final-ten .timer-digit {
  color: #ef4444;
}

.timer--final-ten .timer-colon {
  color: #fca5a5;
}

@keyframes pulse-timer {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.06); }
}

.timer--pulse {
  animation: pulse-timer 1s ease-in-out infinite;
}

/* ── Per-second tick animation ──────────────────────────────────── */
@keyframes tick-flash {
  0%   { opacity: 1; }
  20%  { opacity: 0.5; }
  100% { opacity: 1; }
}

.digit--tick {
  animation: tick-flash 0.35s ease-out;
}

/* ── Final 10 warning bar ───────────────────────────────────────── */
.warning-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #dc2626;
  animation: pulse-timer 1s ease-in-out infinite;
}

/* ── Closed banner ──────────────────────────────────────────────── */
.closed-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  border-radius: 12px;
  padding: 20px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}

.closed-inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.closed-icon {
  font-size: 28px;
}

.closed-text {
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.02em;
}

.winner-line {
  font-size: 14px;
  color: #d1d5db;
}

.winner-line strong {
  color: #fbbf24;
}

.winner-line.no-bids {
  color: #9ca3af;
  font-style: italic;
}

/* ── Closed banner slide-in transition ──────────────────────────── */
.closed-banner-enter-active {
  animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.closed-banner-leave-active {
  animation: fadeOut 0.3s ease-in forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-20px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes fadeOut {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.95); }
}
</style>
