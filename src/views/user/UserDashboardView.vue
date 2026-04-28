<template>
  <div class="user-dashboard">

    <!-- ── Header ── -->
    <header class="dashboard-header">
      <div>
        <h1 class="dashboard-header__title">My Dashboard</h1>
        <p class="dashboard-header__subtitle">Welcome back, {{ userName }}</p>
      </div>
      <div class="dashboard-header__actions">
        <NotificationBadge :userId="userId" />
      </div>
    </header>

    <!-- ── Stats Row ── -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-card__icon">🏷️</div>
        <div class="stat-card__value">{{ stats.activeBids }}</div>
        <div class="stat-card__label">Active Bids</div>
      </div>
      <div class="stat-card stat-card--winning">
        <div class="stat-card__icon">🏆</div>
        <div class="stat-card__value">{{ stats.winning }}</div>
        <div class="stat-card__label">Currently Winning</div>
      </div>
      <div class="stat-card stat-card--outbid">
        <div class="stat-card__icon">📉</div>
        <div class="stat-card__value">{{ stats.outbid }}</div>
        <div class="stat-card__label">Outbid</div>
      </div>
      <div class="stat-card">
        <div class="stat-card__icon">🎉</div>
        <div class="stat-card__value">{{ stats.won }}</div>
        <div class="stat-card__label">Auctions Won</div>
      </div>
    </div>

    <!-- ── Main Content ── -->
    <div class="dashboard-grid">

      <!-- Left: Notifications Feed -->
      <section class="dashboard-card notifications-feed">
        <div class="card-header">
          <h2 class="card-header__title">🔔 Notifications</h2>
          <button
            v-if="notifications.length > 0"
            class="btn-ghost"
            @click="markAllRead"
          >Mark all read</button>
        </div>

        <div v-if="loadingNotifs" class="loading-state">
          <div class="spinner" /> Loading...
        </div>

        <div v-else-if="notifications.length === 0" class="empty-state">
          <div class="empty-state__icon">🔕</div>
          <p>No notifications yet</p>
          <span>You'll be notified when bids are placed or auction status changes</span>
        </div>

        <ul v-else class="notif-list">
          <li
            v-for="notif in notifications"
            :key="notif.id"
            class="notif-item"
            :class="[`notif-item--${notif.severity.toLowerCase()}`, { 'notif-item--unread': !notif.isRead }]"
            @click="markRead(notif)"
          >
            <div class="notif-item__icon">{{ severityIcon(notif.severity) }}</div>
            <div class="notif-item__body">
              <div class="notif-item__title">{{ notif.title }}</div>
              <div class="notif-item__message">{{ notif.message }}</div>
              <div class="notif-item__time">{{ timeAgo(notif.createdAt) }}</div>
            </div>
            <div v-if="!notif.isRead" class="notif-item__dot" />
          </li>
        </ul>
      </section>

      <!-- Right: My Bids -->
      <section class="dashboard-card my-bids">
        <div class="card-header">
          <h2 class="card-header__title">📋 My Bid Activity</h2>
          <select v-model="bidFilter" class="filter-select">
            <option value="all">All</option>
            <option value="BID_PLACED">Bids Placed</option>
            <option value="BID_OUTBID">Outbid Alerts</option>
            <option value="YOU_WON_AUCTION">Won Auctions</option>
            <option value="AUCTION_ENDING_SOON">Ending Soon</option>
            <option value="PAYMENT_REQUIRED">Payment Due</option>
          </select>
        </div>

        <div v-if="loadingNotifs" class="loading-state">
          <div class="spinner" /> Loading...
        </div>

        <div v-else-if="filteredBidActivity.length === 0" class="empty-state">
          <div class="empty-state__icon">📭</div>
          <p>No activity yet</p>
          <span>Start bidding on auctions to see your activity here</span>
        </div>

        <ul v-else class="activity-list">
          <li
            v-for="notif in filteredBidActivity"
            :key="notif.id"
            class="activity-item"
            :class="`activity-item--${notif.type.toLowerCase()}`"
          >
            <div class="activity-item__badge" :class="`badge--${notif.severity.toLowerCase()}`">
              {{ typeIcon(notif.type) }}
            </div>
            <div class="activity-item__body">
              <div class="activity-item__title">{{ notif.title }}</div>
              <div class="activity-item__message">{{ notif.message }}</div>
              <div class="activity-item__meta">
                <span class="activity-item__time">{{ timeAgo(notif.createdAt) }}</span>
                <span v-if="notif.relatedAuctionId" class="activity-item__auction">
                  Auction #{{ notif.relatedAuctionId }}
                </span>
              </div>
            </div>
            <div class="activity-item__status" :class="`status--${notif.severity.toLowerCase()}`">
              {{ notif.severity }}
            </div>
          </li>
        </ul>
      </section>

    </div>

    <!-- ── Payment Due Banner ── -->
    <div v-if="paymentDue.length > 0" class="payment-banner">
      <div class="payment-banner__icon">💳</div>
      <div class="payment-banner__body">
        <strong>Payment Required</strong>
        <p>You have {{ paymentDue.length }} pending payment{{ paymentDue.length > 1 ? 's' : '' }}. Please complete them within 7 days.</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import NotificationBadge from '../../components/notifications/NotificationBadge.vue'
import { notificationApi } from '../../services/notificationsApi'
import type { Notification } from '../../types/notifications'
import { NotificationType, SeverityLevel } from '../../types/notifications'

// ── Config ──────────────────────────────────────────────────────────────────
// In a real app, userId and userName come from auth context / store
const userId = ref(1)   // Change this to the logged-in user's ID
const userName = ref('John Doe') // Change this to the logged-in user's name

// ── State ────────────────────────────────────────────────────────────────────
const notifications = ref<Notification[]>([])
const loadingNotifs = ref(false)
const bidFilter = ref<string>('all')
let pollingInterval: ReturnType<typeof setInterval> | null = null

// ── Computed ─────────────────────────────────────────────────────────────────
const stats = computed(() => ({
  activeBids: notifications.value.filter(n => n.type === NotificationType.BID_PLACED).length,
  winning:    notifications.value.filter(n => n.type === NotificationType.BID_PLACED && !notifications.value.some(x => x.type === NotificationType.BID_OUTBID && x.relatedAuctionId === n.relatedAuctionId && x.createdAt > n.createdAt)).length,
  outbid:     notifications.value.filter(n => n.type === NotificationType.BID_OUTBID).length,
  won:        notifications.value.filter(n => n.type === NotificationType.YOU_WON_AUCTION).length,
}))

const paymentDue = computed(() =>
  notifications.value.filter(n => n.type === NotificationType.PAYMENT_REQUIRED && !n.isRead)
)

const BID_ACTIVITY_TYPES = [
  NotificationType.BID_PLACED,
  NotificationType.BID_OUTBID,
  NotificationType.YOU_WON_AUCTION,
  NotificationType.AUCTION_ENDING_SOON,
  NotificationType.PAYMENT_REQUIRED,
  NotificationType.AUCTION_CANCELLED,
  NotificationType.AUCTION_CLOSED,
]

const filteredBidActivity = computed(() => {
  const activityNotifs = notifications.value.filter(n =>
    BID_ACTIVITY_TYPES.includes(n.type)
  )
  if (bidFilter.value === 'all') return activityNotifs
  return activityNotifs.filter(n => n.type === bidFilter.value)
})

// ── Methods ───────────────────────────────────────────────────────────────────
async function loadNotifications() {
  loadingNotifs.value = true
  try {
    notifications.value = await notificationApi.getUserNotifications(userId.value)
  } catch (e) {
    console.error('Failed to load notifications:', e)
  } finally {
    loadingNotifs.value = false
  }
}

async function markRead(notif: Notification) {
  if (notif.isRead) return
  try {
    await notificationApi.markAsRead(notif.id)
    notif.isRead = true
  } catch (e) {
    console.error('Failed to mark as read:', e)
  }
}

async function markAllRead() {
  try {
    await notificationApi.markAllAsRead(userId.value)
    notifications.value.forEach(n => n.isRead = true)
  } catch (e) {
    console.error('Failed to mark all as read:', e)
  }
}

function severityIcon(severity: string): string {
  const icons: Record<string, string> = {
    SUCCESS: '✅', WARNING: '⚠️', ERROR: '❌', INFO: 'ℹ️'
  }
  return icons[severity] ?? 'ℹ️'
}

function typeIcon(type: string): string {
  const icons: Record<string, string> = {
    BID_PLACED:          '🏷️',
    BID_OUTBID:          '📉',
    YOU_WON_AUCTION:     '🎉',
    AUCTION_ENDING_SOON: '⏰',
    PAYMENT_REQUIRED:    '💳',
    PAYMENT_RECEIVED:    '✅',
    AUCTION_CANCELLED:   '🚫',
    AUCTION_CLOSED:      '🏁',
    AUCTION_APPROVED:    '✅',
    AUCTION_REJECTED:    '❌',
    AUCTION_MODERATED:   '🔒',
    SYSTEM_ANNOUNCEMENT: '📢',
  }
  return icons[type] ?? '🔔'
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return date.toLocaleDateString()
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  loadNotifications()
  // Auto-refresh every 5 seconds
  pollingInterval = setInterval(loadNotifications, 5000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})
</script>

<style scoped>
.user-dashboard {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text-primary);
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ── */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dashboard-header__title {
  font-size: 1.7rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.02em;
}
.dashboard-header__subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin: 0.3rem 0 0;
}
.dashboard-header__actions {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* ── Stats Row ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.stat-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  transition: border-color 0.15s;
}
.stat-card:hover { border-color: var(--color-accent); }
.stat-card--winning { border-color: rgba(34,197,94,0.4); background: rgba(34,197,94,0.05); }
.stat-card--outbid  { border-color: rgba(251,191,36,0.4); background: rgba(251,191,36,0.05); }
.stat-card__icon  { font-size: 1.4rem; }
.stat-card__value { font-size: 2rem; font-weight: 800; }
.stat-card__label { font-size: 0.8rem; color: var(--color-text-muted); font-weight: 600; }

/* ── Grid ── */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

/* ── Card ── */
.dashboard-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.card-header__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}

/* ── Notification List ── */
.notif-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.notif-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
}
.notif-item:hover { background: rgba(255,255,255,0.04); }
.notif-item--unread { background: rgba(99,102,241,0.05); border-color: rgba(99,102,241,0.2); }
.notif-item--success { border-left: 3px solid #22c55e; }
.notif-item--warning { border-left: 3px solid #fbbf24; }
.notif-item--error   { border-left: 3px solid #ef4444; }
.notif-item--info    { border-left: 3px solid #6366f1; }
.notif-item__icon  { font-size: 1.1rem; flex-shrink: 0; margin-top: 2px; }
.notif-item__body  { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
.notif-item__title { font-size: 0.85rem; font-weight: 700; }
.notif-item__message { font-size: 0.8rem; color: var(--color-text-muted); line-height: 1.4; }
.notif-item__time  { font-size: 0.72rem; color: var(--color-text-muted); margin-top: 0.2rem; }
.notif-item__dot {
  width: 8px; height: 8px;
  background: #6366f1;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 6px;
}

/* ── Activity List ── */
.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.activity-item {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  transition: background 0.15s;
}
.activity-item:hover { background: rgba(255,255,255,0.04); }
.activity-item__badge {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  background: rgba(255,255,255,0.05);
}
.badge--success { background: rgba(34,197,94,0.15); }
.badge--warning { background: rgba(251,191,36,0.15); }
.badge--error   { background: rgba(239,68,68,0.15); }
.badge--info    { background: rgba(99,102,241,0.15); }
.activity-item__body  { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; }
.activity-item__title { font-size: 0.85rem; font-weight: 700; }
.activity-item__message { font-size: 0.78rem; color: var(--color-text-muted); line-height: 1.4; }
.activity-item__meta  { display: flex; gap: 0.5rem; align-items: center; margin-top: 0.2rem; }
.activity-item__time  { font-size: 0.72rem; color: var(--color-text-muted); }
.activity-item__auction { font-size: 0.72rem; color: var(--color-accent); background: rgba(99,102,241,0.1); padding: 1px 6px; border-radius: 4px; }
.activity-item__status {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}
.status--success { background: rgba(34,197,94,0.15);  color: #22c55e; }
.status--warning { background: rgba(251,191,36,0.15); color: #fbbf24; }
.status--error   { background: rgba(239,68,68,0.15);  color: #ef4444; }
.status--info    { background: rgba(99,102,241,0.15); color: #6366f1; }

/* ── Payment Banner ── */
.payment-banner {
  display: flex;
  gap: 1rem;
  align-items: center;
  background: rgba(251,191,36,0.08);
  border: 1px solid rgba(251,191,36,0.3);
  border-radius: 12px;
  padding: 1rem 1.25rem;
}
.payment-banner__icon { font-size: 1.5rem; }
.payment-banner__body strong { font-size: 0.9rem; font-weight: 700; color: #fbbf24; }
.payment-banner__body p { font-size: 0.82rem; color: var(--color-text-muted); margin: 0.2rem 0 0; }

/* ── Shared ── */
.loading-state {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
  padding: 1rem 0;
}
.spinner {
  width: 20px; height: 20px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg) } }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  padding: 2rem 0;
  color: var(--color-text-muted);
  text-align: center;
}
.empty-state__icon { font-size: 2rem; }
.empty-state p  { font-size: 0.9rem; font-weight: 600; margin: 0; }
.empty-state span { font-size: 0.8rem; }

.btn-ghost {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  padding: 0.3rem 0.75rem;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-ghost:hover { border-color: var(--color-accent); color: var(--color-accent); }

.filter-select {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text-secondary);
  font-size: 0.78rem;
  padding: 0.3rem 0.6rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .dashboard-grid { grid-template-columns: 1fr; }
}
</style>
