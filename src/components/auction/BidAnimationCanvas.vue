<template>
  <div class="bid-anim-wrapper">
    <!-- Rive canvas — used when @rive-app/canvas is installed -->
    <canvas
      ref="canvasRef"
      class="bid-anim-canvas"
      :class="{ hidden: !riveReady }"
      width="200"
      height="200"
    />

    <!--
      CSS fallback animation — shown when Rive is not available
      or while the .riv file is loading.
      Plays automatically when animState changes.
    -->
    <div v-if="!riveReady" class="bid-anim-fallback">
      <div
        class="bid-anim-icon"
        :class="{
          'bid-anim-icon--success': animState === 'success',
          'bid-anim-icon--fail':    animState === 'fail',
          'bid-anim-icon--idle':    animState === 'idle',
        }"
      >
        <span v-if="animState === 'success'" class="icon">🎯</span>
        <span v-else-if="animState === 'fail'" class="icon">❌</span>
        <span v-else class="icon pulse">🔨</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    animState?: 'idle' | 'success' | 'fail'
    riveFileSrc?: string
  }>(),
  {
    animState: 'idle',
    // Public Rive demo file — replace with your own .riv file
    riveFileSrc: 'https://cdn.rive.app/animations/vehicles.riv',
  },
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
const riveReady = ref(false)

// Dynamically import Rive so it doesn't break if not installed
onMounted(async () => {
  try {
    const { Rive, Layout, Fit, Alignment } = await import('@rive-app/canvas')
    if (!canvasRef.value) return

    const r = new Rive({
      src: props.riveFileSrc,
      canvas: canvasRef.value,
      autoplay: true,
      layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
      onLoad: () => {
        r.resizeDrawingSurfaceToCanvas()
        riveReady.value = true
      },
      onLoadError: () => {
        riveReady.value = false
      },
    })
  } catch {
    // @rive-app/canvas not installed — CSS fallback will show instead
    riveReady.value = false
  }
})
</script>

<style scoped>
.bid-anim-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
}

.bid-anim-canvas {
  width: 120px;
  height: 120px;
}
.bid-anim-canvas.hidden {
  display: none;
}

.bid-anim-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.bid-anim-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.icon {
  font-size: 2.5rem;
  line-height: 1;
}

/* Success state — green glow + scale up */
.bid-anim-icon--success {
  background: rgba(34, 197, 94, 0.15);
  box-shadow: 0 0 24px rgba(34, 197, 94, 0.4);
  animation: successPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Fail state — red shake */
.bid-anim-icon--fail {
  background: rgba(239, 68, 68, 0.15);
  box-shadow: 0 0 24px rgba(239, 68, 68, 0.3);
  animation: failShake 0.5s ease;
}

/* Idle — gentle pulse */
.pulse {
  animation: idlePulse 2s ease-in-out infinite;
}

@keyframes successPop {
  0%   { transform: scale(0.5); opacity: 0 }
  60%  { transform: scale(1.2) }
  100% { transform: scale(1);   opacity: 1 }
}

@keyframes failShake {
  0%, 100% { transform: translateX(0) }
  20%       { transform: translateX(-8px) }
  40%       { transform: translateX(8px) }
  60%       { transform: translateX(-6px) }
  80%       { transform: translateX(6px) }
}

@keyframes idlePulse {
  0%, 100% { transform: scale(1);    opacity: 0.8 }
  50%       { transform: scale(1.08); opacity: 1   }
}
</style>
