<template>
  <div class="mod-page">
    <!-- ── Sidebar / Page Header ── -->
    <header class="mod-page__header">
      <div class="mod-page__header-inner">
        <div>
          <h1 class="mod-page__title">Auction Moderation</h1>
          <p class="mod-page__subtitle">Review, approve, and manage all auction listings</p>
        </div>
        <button class="refresh-btn" :class="{ spinning: loading }" @click="loadAuctions" title="Refresh">
          ↻
        </button>
      </div>

      <!-- Stats strip -->
      <div class="stats-strip">
        <div class="stat-chip stat-chip--pending">
          <span class="stat-chip__count">{{ counts.pending }}</span>
          <span class="stat-chip__label">Pending</span>
        </div>
        <div class="stat-chip stat-chip--active">
          <span class="stat-chip__count">{{ counts.active }}</span>
          <span class="stat-chip__label">Active</span>
        </div>
        <div class="stat-chip stat-chip--closed">
          <span class="stat-chip__count">{{ counts.closed }}</span>
          <span class="stat-chip__label">Closed</span>
        </div>
        <div class="stat-chip stat-chip--total">
          <span class="stat-chip__count">{{ auctions.length }}</span>
          <span class="stat-chip__label">Total</span>
        </div>
      </div>
    </header>

    <!-- ── Filters ── -->
    <div class="mod-page__filters">
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="filter-tab"
          :class="{ 'filter-tab--active': activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count !== undefined" class="filter-tab__count">{{ tab.count }}</span>
        </button>
      </div>

      <input
        v-model="searchQuery"
        class="search-input"
        type="text"
        placeholder="Search auctions…"
      />
    </div>

    <!-- ── Error Banner ── -->
    <div v-if="error" class="error-banner">⚠ {{ error }}</div>

    <!-- ── Loading ── -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <p>Loading auctions…</p>
    </div>

    <!-- ── Empty ── -->
    <div v-else-if="filteredAuctions.length === 0" class="empty-state">
      <span class="empty-state__icon">🔍</span>
      <p>No auctions found for this filter.</p>
    </div>

    <!-- ── Auction Cards ── -->
    <div v-else class="mod-page__grid">
      <AuctionModerationCard
        v-for="auction in filteredAuctions"
        :key="auction.id"
        :auction="auction"
        @approve="onApprove"
        @reject="onReject"
        @cancel="onCancel"
        @block-bids="onBlockBids"
        @unblock-bids="onUnblockBids"
        @close="onClose"
        @reopen="onReopen"
      />
    </div>

    <!-- ── Toast Notification ── -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" :class="`toast--${toast.type}`">
        {{ toast.message }}
      </div>
    </Transition>

    <!-- ── Modals ── -->

    <!-- Reject Modal -->
    <ConfirmModal
      v-model="modal.reject"
      title="Reject Auction"
      :description="`Reject &quot;${activeAuction?.title}&quot;? The seller will be notified.`"
      icon="❌"
      variant="danger"
      confirm-label="Reject Auction"
      :requires-reason="true"
      reason-label="Rejection Reason"
      reason-placeholder="e.g. Item violates platform policy"
      @confirm="submitReject"
    />

    <!-- Cancel Modal -->
    <ConfirmModal
      v-model="modal.cancel"
      title="Cancel Auction"
      :description="`Cancel &quot;${activeAuction?.title}&quot;? This action is irreversible.`"
      icon="🚫"
      variant="danger"
      confirm-label="Cancel Auction"
      :requires-reason="true"
      reason-label="Cancellation Reason"
      reason-placeholder="e.g. Fraudulent item reported"
      @confirm="submitCancel"
    />

    <!-- Block Bids Modal -->
    <ConfirmModal
      v-model="modal.blockBids"
      title="Block Bids"
      :description="`Block all new bids on &quot;${activeAuction?.title}&quot;?`"
      icon="🔒"
      variant="warning"
      confirm-label="Block Bids"
      @confirm="submitBlockBids"
    />

    <!-- Unblock Bids Modal -->
    <ConfirmModal
      v-model="modal.unblockBids"
      title="Unblock Bids"
      :description="`Allow bidding to resume on &quot;${activeAuction?.title}&quot;?`"
      icon="🔓"
      variant="success"
      confirm-label="Unblock Bids"
      @confirm="submitUnblockBids"
    />

    <!-- Force Close Modal -->
    <ConfirmModal
      v-model="modal.close"
      title="Force Close Auction"
      :description="`Manually close &quot;${activeAuction?.title}&quot; before its scheduled end time.`"
      icon="🔐"
      variant="warning"
      confirm-label="Close Auction"
      :requires-reason="true"
      reason-label="Close Reason"
      reason-placeholder="e.g. Suspected fraud, emergency closure"
      @confirm="submitClose"
    />

    <!-- Reopen Modal -->
    <ConfirmModal
      v-model="modal.reopen"
      title="Reopen Auction"
      :description="`Reopen &quot;${activeAuction?.title}&quot;? Set a new end time below.`"
      icon="🔄"
      variant="primary"
      confirm-label="Reopen Auction"
      :requires-reason="false"
      :requires-date-time="true"
      @confirm="submitReopen"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import AuctionModerationCard from '../../components/admin/AuctionModerationCard.vue'
import ConfirmModal from '../../components/admin/ConfirmModal.vue'
import { adminModerationApi } from '../../services/adminModerationApi'
import type { Auction, AuctionStatus } from '../../types/auction'

// ── State ────────────────────────────────────────────────────────────────────

const auctions = ref<Auction[]>([])
const loading = ref(false)
const error = ref('')
const activeTab = ref<AuctionStatus | 'ALL'>('ALL')
const searchQuery = ref('')
const activeAuction = ref<Auction | null>(null)

const modal = reactive({
  reject: false,
  cancel: false,
  blockBids: false,
  unblockBids: false,
  close: false,
  reopen: false,
})

const toast = reactive({
  visible: false,
  message: '',
  type: 'success' as 'success' | 'error',
})

// ── Computed ─────────────────────────────────────────────────────────────────

const counts = computed(() => ({
  pending: auctions.value.filter((a) => a.status === 'PENDING').length,
  active:  auctions.value.filter((a) => a.status === 'ACTIVE').length,
  closed:  auctions.value.filter((a) => a.status === 'CLOSED').length,
}))

const tabs = computed(() => [
  { value: 'ALL',       label: 'All',       count: auctions.value.length },
  { value: 'PENDING',   label: 'Pending',   count: counts.value.pending },
  { value: 'UPCOMING',  label: 'Upcoming',  count: auctions.value.filter(a => a.status === 'UPCOMING').length },
  { value: 'ACTIVE',    label: 'Active',    count: counts.value.active },
  { value: 'CLOSED',    label: 'Closed',    count: counts.value.closed },
  { value: 'REJECTED',  label: 'Rejected',  count: auctions.value.filter(a => a.status === 'REJECTED').length },
  { value: 'CANCELLED', label: 'Cancelled', count: auctions.value.filter(a => a.status === 'CANCELLED').length },
] as const)

const filteredAuctions = computed(() => {
  let list = auctions.value
  if (activeTab.value !== 'ALL') {
    list = list.filter((a) => a.status === activeTab.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.sellerUsername.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q),
    )
  }
  return list
})

// ── Data Loading ──────────────────────────────────────────────────────────────

async function loadAuctions() {
  loading.value = true
  error.value = ''
  try {
    auctions.value = await adminModerationApi.getAllAuctions()
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadAuctions)

// ── Modal Triggers ────────────────────────────────────────────────────────────

function onApprove(auction: Auction) {
  activeAuction.value = auction
  // Approve has no form — submit directly with confirmation inline
  doAction(() => adminModerationApi.approve(auction.id), `"${auction.title}" approved successfully.`)
}

function onReject(auction: Auction) {
  activeAuction.value = auction
  modal.reject = true
}

function onCancel(auction: Auction) {
  activeAuction.value = auction
  modal.cancel = true
}

function onBlockBids(auction: Auction) {
  activeAuction.value = auction
  modal.blockBids = true
}

function onUnblockBids(auction: Auction) {
  activeAuction.value = auction
  modal.unblockBids = true
}

function onClose(auction: Auction) {
  activeAuction.value = auction
  modal.close = true
}

function onReopen(auction: Auction) {
  activeAuction.value = auction
  modal.reopen = true
}

// ── Submit Handlers ───────────────────────────────────────────────────────────

async function submitReject({ reason }: { reason?: string }) {
  if (!activeAuction.value) return
  await doAction(
    () => adminModerationApi.reject(activeAuction.value!.id, { reason: reason! }),
    `"${activeAuction.value.title}" rejected.`,
  )
}

async function submitCancel({ reason }: { reason?: string }) {
  if (!activeAuction.value) return
  await doAction(
    () => adminModerationApi.cancel(activeAuction.value!.id, { reason: reason! }),
    `"${activeAuction.value.title}" cancelled.`,
  )
}

async function submitBlockBids() {
  if (!activeAuction.value) return
  await doAction(
    () => adminModerationApi.blockBids(activeAuction.value!.id),
    `Bids blocked for "${activeAuction.value.title}".`,
  )
}

async function submitUnblockBids() {
  if (!activeAuction.value) return
  await doAction(
    () => adminModerationApi.unblockBids(activeAuction.value!.id),
    `Bids unblocked for "${activeAuction.value.title}".`,
  )
}

async function submitClose({ reason }: { reason?: string }) {
  if (!activeAuction.value) return
  await doAction(
    () => adminModerationApi.manualClose(activeAuction.value!.id, { reason: reason! }),
    `"${activeAuction.value.title}" force-closed.`,
  )
}

async function submitReopen({ dateTime, reason }: { dateTime?: string; reason?: string }) {
  if (!activeAuction.value) return
  await doAction(
    () =>
      adminModerationApi.reopen(activeAuction.value!.id, {
        newEndTime: dateTime!,
        reason,
      }),
    `"${activeAuction.value.title}" reopened.`,
  )
}

// ── Helper ────────────────────────────────────────────────────────────────────

async function doAction(fn: () => Promise<Auction>, successMsg: string) {
  try {
    const updated = await fn()
    // Patch the local auction list
    const idx = auctions.value.findIndex((a) => a.id === updated.id)
    if (idx !== -1) auctions.value[idx] = updated
    showToast(successMsg, 'success')
  } catch (e: any) {
    showToast(e.message, 'error')
  }
}

let toastTimer: ReturnType<typeof setTimeout>
function showToast(message: string, type: 'success' | 'error') {
  clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.visible = true
  toastTimer = setTimeout(() => {
    toast.visible = false
  }, 3500)
}
</script>

<style scoped>
/* ── Page Layout ── */
.mod-page {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text-primary);
  padding: 2rem;
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ── */
.mod-page__header {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mod-page__header-inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.mod-page__title {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  margin: 0;
}

.mod-page__subtitle {
  font-size: 0.88rem;
  color: var(--color-text-muted);
  margin: 0.3rem 0 0;
}

.refresh-btn {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  width: 38px;
  height: 38px;
  border-radius: 8px;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.refresh-btn:hover { border-color: var(--color-accent); color: var(--color-accent) }
.refresh-btn.spinning { animation: spin 0.8s linear infinite }
@keyframes spin { to { transform: rotate(360deg) } }

/* ── Stats Strip ── */
.stats-strip {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.55rem 1.1rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  min-width: 72px;
}

.stat-chip__count {
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
}

.stat-chip__label {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin-top: 0.2rem;
}

.stat-chip--pending { background: rgba(251,191,36,0.08); }
.stat-chip--pending .stat-chip__count { color: #f59e0b }
.stat-chip--active  { background: rgba(34,197,94,0.08); }
.stat-chip--active .stat-chip__count { color: #22c55e }
.stat-chip--closed  { background: rgba(148,163,184,0.08); }
.stat-chip--closed .stat-chip__count { color: #94a3b8 }
.stat-chip--total   { background: rgba(99,102,241,0.08); }
.stat-chip--total .stat-chip__count { color: #818cf8 }

/* ── Filters ── */
.mod-page__filters {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-tabs {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.filter-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 7px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-tab:hover { border-color: var(--color-border-hover) }
.filter-tab--active {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.filter-tab__count {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  padding: 0 0.35rem;
  font-size: 0.75rem;
  font-weight: 700;
}
.filter-tab:not(.filter-tab--active) .filter-tab__count {
  background: var(--color-surface-raised);
  color: var(--color-text-muted);
}

.search-input {
  margin-left: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  padding: 0.45rem 0.9rem;
  font-size: 0.88rem;
  width: 220px;
  transition: border-color 0.15s;
}
.search-input:focus { outline: none; border-color: var(--color-accent) }
.search-input::placeholder { color: var(--color-text-muted) }

/* ── Error / Loading / Empty ── */
.error-banner {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: #ef4444;
  font-size: 0.88rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--color-text-muted);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 0;
  color: var(--color-text-muted);
}
.empty-state__icon { font-size: 2.5rem }

/* ── Grid ── */
.mod-page__grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Toast ── */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.85rem 1.3rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  z-index: 2000;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.toast--success { background: #166534; color: #bbf7d0; border: 1px solid #16a34a }
.toast--error   { background: #7f1d1d; color: #fecaca; border: 1px solid #dc2626 }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease }
.toast-enter-from { opacity: 0; transform: translateY(12px) }
.toast-leave-to   { opacity: 0; transform: translateY(12px) }
</style>
