<template>
  <tr>
    <td>
      <div class="item-info">
        <div
          class="item-img"
          :style="{ backgroundImage: `url(${imageUrl})` }"
        ></div>
        <span class="item-name">{{ itemName }}</span>
      </div>
    </td>
    <td class="bid-amount">{{ currentBid }}</td>
    <td>
      <span class="status-pill" :class="statusClass">
        <span class="dot"></span> {{ statusText }}
      </span>
    </td>
    <td class="time-left">{{ timeLeft }}</td>
    <td>
      <button :class="actionClass" @click="$emit('action-click')">{{ actionText }}</button>
    </td>
  </tr>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  imageUrl: { type: String, required: true },
  itemName: { type: String, required: true },
  currentBid: { type: String, required: true },
  status: { type: String, required: true }, // 'winning', 'outbid'
  timeLeft: { type: String, required: true },
  actionType: { type: String, default: 'view' }, // 'view', 'bid'
})

defineEmits(['action-click'])

const statusClass = computed(() => {
  return props.status === 'winning' ? 'status-winning' : 'status-outbid'
})

const statusText = computed(() => {
  return props.status === 'winning' ? 'Winning' : 'Outbid'
})

const actionClass = computed(() => {
  return props.actionType === 'bid' ? 'btn-action-primary' : 'btn-action-link'
})

const actionText = computed(() => {
  return props.actionType === 'bid' ? 'Bid Now' : 'View'
})
</script>

<style scoped>
td {
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f5f9;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.item-img {
  width: 40px;
  height: 40px;
  border-radius: 0.25rem;
  background-color: #f1f5f9;
  background-size: cover;
  background-position: center;
}
.item-name {
  font-size: 0.875rem;
  font-weight: 600;
}
.bid-amount {
  font-size: 0.875rem;
  font-weight: 500;
  color: #334155;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.125rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
.status-winning {
  background-color: #dcfce7;
  color: #166534;
}
.status-winning .dot {
  width: 6px;
  height: 6px;
  background-color: #22c55e;
  border-radius: 50%;
}
.status-outbid {
  background-color: #fee2e2;
  color: #991b1b;
}
.status-outbid .dot {
  width: 6px;
  height: 6px;
  background-color: #ef4444;
  border-radius: 50%;
}
.time-left {
  font-size: 0.875rem;
  color: #64748b;
}
.btn-action-link {
  background: transparent;
  border: none;
  color: #197fe6;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
}
.btn-action-link:hover {
  color: #1e3a8a;
}
.btn-action-primary {
  background-color: #197fe6;
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
}
</style>
