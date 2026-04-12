<template>
  <div class="rule-editor">
    <h4 class="rule-editor__title">⚙️ Bid Increment Rule</h4>

    <div class="rule-editor__row">
      <label class="rule-editor__label">Type</label>
      <div class="toggle-group">
        <button
          class="toggle-btn"
          :class="{ 'toggle-btn--active': localType === 'FIXED' }"
          @click="localType = 'FIXED'"
        >
          Fixed ($)
        </button>
        <button
          class="toggle-btn"
          :class="{ 'toggle-btn--active': localType === 'PERCENTAGE' }"
          @click="localType = 'PERCENTAGE'"
        >
          Percentage (%)
        </button>
      </div>
    </div>

    <div class="rule-editor__row">
      <label class="rule-editor__label">
        {{ localType === 'FIXED' ? 'Fixed Amount ($)' : 'Percentage (%)' }}
      </label>
      <div class="rule-editor__input-wrap">
        <span class="rule-editor__prefix">{{ localType === 'FIXED' ? '$' : '%' }}</span>
        <input
          v-model.number="localIncrement"
          type="number"
          class="rule-editor__input"
          min="0.01"
          step="0.01"
          placeholder="e.g. 10"
        />
      </div>
    </div>

    <div class="rule-editor__preview">
      <span class="rule-editor__preview-label">Preview:</span>
      <span class="rule-editor__preview-value">{{ previewText }}</span>
    </div>

    <button class="rule-editor__save" :disabled="saving" @click="save">
      {{ saving ? 'Saving…' : '💾 Save Rule' }}
    </button>

    <div v-if="message" class="rule-editor__message" :class="messageClass">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { bidApi } from '../../services/bidApi'
import type { BidIncrementType } from '../../types/bid'

const props = defineProps<{
  auctionId: number
  currentIncrement: number
  currentType: BidIncrementType
}>()

const emit = defineEmits<{ (e: 'updated'): void }>()

const localType = ref<BidIncrementType>(props.currentType)
const localIncrement = ref<number>(props.currentIncrement)
const saving = ref(false)
const message = ref('')
const messageClass = ref('')

const previewText = computed(() => {
  if (localType.value === 'FIXED') {
    return `Each bid must be at least $${localIncrement.value ?? 0} more than the current highest.`
  } else {
    return `Each bid must be at least ${localIncrement.value ?? 0}% more than the current highest.`
  }
})

async function save() {
  if (!localIncrement.value || localIncrement.value <= 0) {
    message.value = 'Please enter a valid increment value.'
    messageClass.value = 'rule-editor__message--error'
    return
  }

  saving.value = true
  message.value = ''

  try {
    await bidApi.updateIncrementRule(props.auctionId, {
      minimumBidIncrement: localIncrement.value,
      incrementType: localType.value,
    })
    message.value = 'Rule updated successfully!'
    messageClass.value = 'rule-editor__message--success'
    emit('updated')
  } catch (e: any) {
    message.value = e.message
    messageClass.value = 'rule-editor__message--error'
  } finally {
    saving.value = false
    setTimeout(() => (message.value = ''), 3000)
  }
}
</script>

<style scoped>
.rule-editor {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.rule-editor__title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.rule-editor__row {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.rule-editor__label {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.toggle-group {
  display: flex;
  gap: 0.4rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.5rem;
  border-radius: 7px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.toggle-btn--active {
  background: var(--color-accent);
  color: #fff;
  border-color: var(--color-accent);
}

.rule-editor__input-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.rule-editor__prefix {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-secondary);
}

.rule-editor__input {
  flex: 1;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  padding: 0.55rem 0.8rem;
  font-size: 0.9rem;
  transition: border-color 0.15s;
}
.rule-editor__input:focus { outline: none; border-color: var(--color-accent) }

.rule-editor__preview {
  background: rgba(99,102,241,0.08);
  border-radius: 8px;
  padding: 0.6rem 0.9rem;
  font-size: 0.82rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.rule-editor__preview-label { color: var(--color-text-muted); font-weight: 600 }
.rule-editor__preview-value { color: #818cf8; font-style: italic }

.rule-editor__save {
  background: var(--color-accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.65rem;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.rule-editor__save:hover:not(:disabled) { filter: brightness(1.1) }
.rule-editor__save:disabled { opacity: 0.5; cursor: not-allowed }

.rule-editor__message {
  font-size: 0.82rem;
  border-radius: 7px;
  padding: 0.5rem 0.8rem;
  text-align: center;
}
.rule-editor__message--success { background: rgba(34,197,94,0.1); color: var(--color-success) }
.rule-editor__message--error   { background: rgba(239,68,68,0.1); color: var(--color-danger)  }
</style>
