/**
 * useRiveAnimation
 *
 * Vue 3 composable that wraps the @rive-app/canvas runtime.
 * Used for bid placement animations (Module 2 external API: Rive).
 *
 * Install the package first:
 *   npm install @rive-app/canvas
 *
 * Usage in a component:
 *   const { canvasRef, triggerBidSuccess, triggerBidFail, cleanup } = useRiveAnimation()
 */
import { ref, onUnmounted } from 'vue'
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas'

export function useRiveAnimation() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  let riveInstance: Rive | null = null

  /**
   * Initialises the Rive instance on a canvas element.
   * Call this in onMounted() after canvasRef is available.
   *
   * @param src   URL or path to the .riv file
   * @param stateMachine  Name of the state machine inside the .riv file
   */
  function initRive(src: string, stateMachine = 'BidStateMachine') {
    if (!canvasRef.value) return

    riveInstance = new Rive({
      src,
      canvas: canvasRef.value,
      stateMachines: stateMachine,
      autoplay: true,
      layout: new Layout({
        fit: Fit.Contain,
        alignment: Alignment.Center,
      }),
      onLoad: () => {
        riveInstance?.resizeDrawingSurfaceToCanvas()
      },
    })
  }

  /**
   * Triggers the "bid success" animation state.
   * Maps to a boolean input named "success" in the Rive state machine.
   */
  function triggerBidSuccess() {
    if (!riveInstance) return
    try {
      const inputs = riveInstance.stateMachineInputs('BidStateMachine')
      const successInput = inputs?.find((i) => i.name === 'success')
      if (successInput) {
        successInput.value = true
        // Reset after animation completes (~1.5s)
        setTimeout(() => {
          successInput.value = false
        }, 1500)
      }
    } catch {
      // Rive not loaded yet or input not found — fail silently
    }
  }

  /**
   * Triggers the "bid failed" animation state.
   * Maps to a boolean input named "failed" in the Rive state machine.
   */
  function triggerBidFail() {
    if (!riveInstance) return
    try {
      const inputs = riveInstance.stateMachineInputs('BidStateMachine')
      const failInput = inputs?.find((i) => i.name === 'failed')
      if (failInput) {
        failInput.value = true
        setTimeout(() => {
          failInput.value = false
        }, 1500)
      }
    } catch {
      // fail silently
    }
  }

  /** Clean up the Rive instance to prevent memory leaks */
  function cleanup() {
    riveInstance?.cleanup()
    riveInstance = null
  }

  onUnmounted(cleanup)

  return { canvasRef, initRive, triggerBidSuccess, triggerBidFail, cleanup }
}
