<template>
  <div class="bid-page">
    <header class="bid-page__header">
      <div>
        <h1 class="bid-page__title">Live Auction</h1>
        <p class="bid-page__subtitle">Auction #{{ auctionId }}</p>
      </div>
      <button class="admin-toggle" @click="showAdmin = !showAdmin">
        {{ showAdmin ? '✕ Close Admin' : '⚙️ Admin Panel' }}
      </button>
    </header>

    <div class="bid-page__content">
      <!-- Main bid panel -->
      <BidIncrementPanel :auction-id="auctionId" />

      <!-- Admin panel for rule configuration -->
      <Transition name="slide">
        <div v-if="showAdmin && bidState" class="admin-panel">
          <h3 class="admin-panel__title">Admin — Increment Rule Configuration</h3>
          <IncrementRuleEditor
            :auction-id="auctionId"
            :current-increment="bidState.minimumBidIncrement"
            :current-type="bidState.incrementType"
            @updated="onRuleUpdated"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BidIncrementPanel from '../../components/auction/BidIncrementPanel.vue'
import IncrementRuleEditor from '../../components/auction/IncrementRuleEditor.vue'
import { bidApi } from '../../services/bidApi'
import type { BidStateResponse } from '../types/bid'

// In a real app, auctionId comes from route params: useRoute().params.id
// Here we default to 1 for demo purposes
const auctionId = 1

const showAdmin = ref(false)
const bidState = ref<BidStateResponse | null>(null)

onMounted(async () => {
  try {
    bidState.value = await bidApi.getBidState(auctionId)
  } catch {
    // auction may not exist yet — that's fine
  }
})

async function onRuleUpdated() {
  bidState.value = await bidApi.getBidState(auctionId)
}
</script>

<style scoped>
.bid-page {
  min-height: 100vh;
  background: var(--color-bg);
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.bid-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bid-page__title {
  font-size: 1.7rem;
  font-weight: 800;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.bid-page__subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
}

.admin-toggle {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.admin-toggle:hover { border-color: var(--color-accent); color: var(--color-accent) }

.bid-page__content {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.admin-panel {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-panel__title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

/* Slide transition for admin panel */
.slide-enter-active,
.slide-leave-active { transition: all 0.25s ease }
.slide-enter-from   { opacity: 0; transform: translateX(20px) }
.slide-leave-to     { opacity: 0; transform: translateX(20px) }
</style>
