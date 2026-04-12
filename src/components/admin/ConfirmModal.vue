<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-backdrop" @click.self="$emit('update:modelValue', false)">
      <div class="modal" :class="`modal--${variant}`">
        <div class="modal__header">
          <span class="modal__icon">{{ icon }}</span>
          <h3 class="modal__title">{{ title }}</h3>
          <button class="modal__close" @click="$emit('update:modelValue', false)">✕</button>
        </div>

        <div class="modal__body">
          <p v-if="description" class="modal__description">{{ description }}</p>

          <div v-if="requiresReason" class="modal__field">
            <label class="modal__label">{{ reasonLabel }}</label>
            <textarea
              v-model="localReason"
              class="modal__textarea"
              :placeholder="reasonPlaceholder"
              rows="3"
            />
            <span v-if="reasonError" class="modal__error">{{ reasonError }}</span>
          </div>

          <div v-if="requiresDateTime" class="modal__field">
            <label class="modal__label">New End Time</label>
            <input
              v-model="localDateTime"
              type="datetime-local"
              class="modal__input"
            />
            <span v-if="dateTimeError" class="modal__error">{{ dateTimeError }}</span>
          </div>
        </div>

        <div class="modal__footer">
          <button class="btn btn--ghost" @click="$emit('update:modelValue', false)">Cancel</button>
          <button class="btn" :class="`btn--${variant}`" @click="handleConfirm">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    variant?: 'danger' | 'warning' | 'success' | 'primary'
    icon?: string
    confirmLabel?: string
    requiresReason?: boolean
    requiresDateTime?: boolean
    reasonLabel?: string
    reasonPlaceholder?: string
  }>(),
  {
    variant: 'primary',
    icon: '⚡',
    confirmLabel: 'Confirm',
    requiresReason: false,
    requiresDateTime: false,
    reasonLabel: 'Reason',
    reasonPlaceholder: 'Enter reason...',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', payload: { reason?: string; dateTime?: string }): void
}>()

const localReason = ref('')
const localDateTime = ref('')
const reasonError = ref('')
const dateTimeError = ref('')

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      localReason.value = ''
      localDateTime.value = ''
      reasonError.value = ''
      dateTimeError.value = ''
    }
  },
)

function handleConfirm() {
  let valid = true

  if (props.requiresReason && !localReason.value.trim()) {
    reasonError.value = 'This field is required.'
    valid = false
  } else {
    reasonError.value = ''
  }

  if (props.requiresDateTime && !localDateTime.value) {
    dateTimeError.value = 'Please select a date and time.'
    valid = false
  } else {
    dateTimeError.value = ''
  }

  if (!valid) return

  emit('confirm', {
    reason: localReason.value.trim() || undefined,
    dateTime: localDateTime.value || undefined,
  })
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 20, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0 }
  to   { opacity: 1 }
}

.modal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: 100%;
  max-width: 460px;
  margin: 1rem;
  animation: slideUp 0.2s ease;
  overflow: hidden;
}

@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0 }
  to   { transform: translateY(0);    opacity: 1 }
}

.modal--danger  { border-top: 3px solid var(--color-danger) }
.modal--warning { border-top: 3px solid var(--color-warning) }
.modal--success { border-top: 3px solid var(--color-success) }
.modal--primary { border-top: 3px solid var(--color-accent) }

.modal__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem 1rem;
}

.modal__icon { font-size: 1.4rem; }

.modal__title {
  flex: 1;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
}

.modal__close {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 1rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.15s;
}
.modal__close:hover { color: var(--color-text-primary) }

.modal__body {
  padding: 0 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.modal__description {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.modal__field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.modal__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modal__textarea,
.modal__input {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  padding: 0.65rem 0.85rem;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.15s;
}
.modal__textarea:focus,
.modal__input:focus {
  outline: none;
  border-color: var(--color-accent);
}

.modal__error {
  font-size: 0.78rem;
  color: var(--color-danger);
}

.modal__footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid var(--color-border);
}

/* Shared button styles (overrides in parent, but defined here for portability) */
.btn {
  padding: 0.55rem 1.2rem;
  border-radius: 8px;
  border: none;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn--ghost   { background: transparent; border: 1px solid var(--color-border); color: var(--color-text-secondary) }
.btn--ghost:hover { background: var(--color-surface-raised) }
.btn--danger  { background: var(--color-danger);  color: #fff }
.btn--danger:hover  { filter: brightness(1.1) }
.btn--warning { background: var(--color-warning); color: #1a1a1a }
.btn--warning:hover { filter: brightness(1.1) }
.btn--success { background: var(--color-success); color: #fff }
.btn--success:hover { filter: brightness(1.1) }
.btn--primary { background: var(--color-accent);  color: #fff }
.btn--primary:hover { filter: brightness(1.1) }
</style>
