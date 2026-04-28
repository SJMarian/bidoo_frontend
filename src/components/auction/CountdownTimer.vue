<template>
  <!-- ── Auction Closed Banner (slide-in) ── -->
  <Transition name="banner-slide">
    <div v-if="isClosed" class="closed-banner">
      <div class="closed-banner__icon">🔨</div>
      <div class="closed-banner__body">
        <div class="closed-banner__title">Auction Closed</div>
        <div class="closed-banner__sub">This auction has ended. No more bids accepted.</div>
      </div>
    </div>
  </Transition>

  <!-- ── Countdown Timer ── -->
  <div
    v-if="!isClosed && endAt"
    class="countdown"
    :class="{
      'countdown--warning':  secondsLeft <= 60 && secondsLeft > 10,
      'countdown--critical': secondsLeft <= 10 && secondsLeft > 0,
      'countdown--pulse':    secondsLeft <= 10 && secondsLeft > 0,
    }"
  >
    <div class="countdown__label">
      <span class="countdown__dot" />
      Auction ends in
    </div>

    <div class="countdown__display">
      <template v-if="parts.days > 0">
        <div class="countdown__segment">
          <span class="countdown__value">{{ pad(parts.days) }}</span>
          <span class="countdown__unit">Days</span>
        </div>
        <div class="countdown__sep">:</div>
      </template>
      <div class="countdown__segment">
        <span class="countdown__value">{{ pad(parts.hours) }}</span>
        <span class="countdown__unit">Hours</span>
      </div>
      <div class="countdown__sep">:</div>
      <div class="countdown__segment">
        <span class="countdown__value">{{ pad(parts.minutes) }}</span>
        <span class="countdown__unit">Min</span>
      </div>
      <div class="countdown__sep">:</div>
      <div class="countdown__segment">
        <span class="countdown__value">{{ pad(parts.seconds) }}</span>
        <span class="countdown__unit">Sec</span>
      </div>
    </div>

    <!-- Final 10s warning bar -->
    <div v-if="secondsLeft <= 10" class="countdown__bar-wrap">
      <div
        class="countdown__bar"
        :style="{ width: `${(secondsLeft / 10) * 100}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  endAt: string | null        // ISO datetime from server
  serverTime: string | null   // server's current time for sync
}>()

const emit = defineEmits<{
  (e: 'closed'): void   // fires when countdown hits zero
}>()

// ── Clock offset (server time - local time in ms) ────────────────────────────
const clockOffset = ref(0)

watch(
  () => props.serverTime,
  (serverTimeStr) => {
    if (!serverTimeStr) return
    const serverMs = new Date(serverTimeStr).getTime()
    const localMs  = Date.now()
    clockOffset.value = serverMs - localMs
  },
  { immediate: true },
)

// ── Countdown state ───────────────────────────────────────────────────────────
const secondsLeft = ref(0)
const isClosed    = ref(false)
let ticker: ReturnType<typeof setInterval> | null = null

function tick() {
  if (!props.endAt) return
  const now     = Date.now() + clockOffset.value          // server-synced "now"
  const endMs   = new Date(props.endAt).getTime()
  const diff    = Math.max(0, Math.floor((endMs - now) / 1000))
  secondsLeft.value = diff

  if (diff === 0 && !isClosed.value) {
    isClosed.value = true
    emit('closed')
    if (ticker) clearInterval(ticker)
  }
}

onMounted(() => {
  tick()
  ticker = setInterval(tick, 1000)
})

onUnmounted(() => {
  if (ticker) clearInterval(ticker)
})

// Re-sync when endAt changes (e.g. auction reopened)
watch(() => props.endAt, () => {
  isClosed.value = false
  tick()
})

// ── Time parts ────────────────────────────────────────────────────────────────
const parts = computed(() => {
  const s = secondsLeft.value
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
})

function pad(n: number) {
  return String(n).padStart(2, '0')
}
</script>

<style scoped>
/* ── Countdown container ── */
.countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 0.9rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-raised);
  transition: background 0.4s ease, border-color 0.4s ease;
}

/* ── Warning state (≤ 60s): yellow tint ── */
.countdown--warning {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.07);
}

/* ── Critical state (≤ 10s): red tint ── */
.countdown--critical {
  border-color: rgba(239, 68, 68, 0.6);
  background: rgba(239, 68, 68, 0.08);
}

/* ── Pulse animation in final 10s ── */
.countdown--pulse {
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  50%       { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.25); }
}

/* ── Label row ── */
.countdown__label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--color-text-muted);
}

.countdown__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  animation: blink 1.2s ease-in-out infinite;
}
.countdown--warning .countdown__dot  { background: #fbbf24; }
.countdown--critical .countdown__dot { background: #ef4444; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.2; }
}

/* ── Digit display ── */
.countdown__display {
  display: flex;
  align-items: flex-end;
  gap: 0.15rem;
}

.countdown__segment {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.countdown__value {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  transition: color 0.3s ease;
}
.countdown--warning  .countdown__value { color: #fbbf24; }
.countdown--critical .countdown__value { color: #ef4444; }

.countdown__unit {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.2rem;
}

.countdown__sep {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-text-muted);
  line-height: 1;
  padding: 0 0.1rem;
  margin-bottom: 1rem;
  align-self: flex-start;
  margin-top: 0.1rem;
}

/* ── 10s progress bar ── */
.countdown__bar-wrap {
  width: 100%;
  height: 4px;
  background: rgba(239, 68, 68, 0.15);
  border-radius: 99px;
  overflow: hidden;
  margin-top: 0.25rem;
}

.countdown__bar {
  height: 100%;
  background: #ef4444;
  border-radius: 99px;
  transition: width 1s linear;
}

/* ── Closed banner ── */
.closed-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 14px;
}

.closed-banner__icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.closed-banner__title {
  font-size: 1.1rem;
  font-weight: 800;
  color: #ef4444;
}

.closed-banner__sub {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  margin-top: 0.2rem;
}

/* ── Banner slide-in transition ── */
.banner-slide-enter-active {
  animation: slideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.banner-slide-leave-active {
  animation: slideOut 0.3s ease-in forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(-20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)     scale(1); }
}
@keyframes slideOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-10px); }
}
</style>
