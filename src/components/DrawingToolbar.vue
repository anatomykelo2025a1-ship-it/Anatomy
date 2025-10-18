<script setup>
import { useCardStore } from '../stores/cardStore';
import { onMounted, nextTick, watch } from 'vue';

const store = useCardStore();
const emit = defineEmits(['undo', 'redo', 'clear', 'save']);

onMounted(() => {
  nextTick(() => {
    if (window.lucide) window.lucide.createIcons();
  });
});

watch(() => store.isDrawingEnabled, () => {
  nextTick(() => {
    if (window.lucide) window.lucide.createIcons();
  });
});
</script>

<template>
  <div class="drawing-toolbar">
    <button @click="store.toggleDrawing" class="tool-btn" :class="{ active: store.isDrawingEnabled }" title="Toggle Drawing (E)">
      <i :data-lucide="store.isDrawingEnabled ? 'x' : 'pencil'"></i>
    </button>
    <div class="tool-separator"></div>

    <button @click="store.setTool('pen')" class="tool-btn" :class="{ active: store.currentTool === 'pen' }" :disabled="!store.isDrawingEnabled" title="Pen"><i data-lucide="pen-tool"></i></button>
    <button @click="store.setTool('arrow')" class="tool-btn" :class="{ active: store.currentTool === 'arrow' }" :disabled="!store.isDrawingEnabled" title="Arrow"><i data-lucide="arrow-up-right"></i></button>
    <button @click="store.setTool('eraser')" class="tool-btn" :class="{ active: store.currentTool === 'eraser' }" :disabled="!store.isDrawingEnabled" title="Eraser"><i data-lucide="eraser"></i></button>
    
    <div class="tool-separator"></div>

    <button @click="emit('undo')" class="tool-btn" :disabled="!store.isDrawingEnabled" title="Undo"><i data-lucide="undo-2"></i></button>
    <button @click="emit('redo')" class="tool-btn" :disabled="!store.isDrawingEnabled" title="Redo"><i data-lucide="redo-2"></i></button>
    <button @click="emit('clear')" class="tool-btn" :disabled="!store.isDrawingEnabled" title="Clear All"><i data-lucide="trash-2"></i></button>
    <button @click="emit('save')" class="tool-btn" :disabled="!store.isDrawingEnabled" title="Save"><i data-lucide="save"></i></button>

    <div class="tool-separator"></div>
    
    <label for="color-picker" class="tool-btn" :class="{disabled: !store.isDrawingEnabled}" title="Color"><i data-lucide="palette"></i></label>
    <input type="color" id="color-picker" :value="store.currentColor" @input="store.setColor($event.target.value)" :disabled="!store.isDrawingEnabled">
    
    <input type="range" class="line-width-slider" min="2" max="30" :value="store.lineWidth" @input="store.setLineWidth($event.target.value)" :disabled="!store.isDrawingEnabled" title="Line Width"/>
  </div>
</template>

<style scoped>
.drawing-toolbar{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:rgba(15,23,42,.8);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid #3b82f6;border-radius:50px;padding:.5rem;display:flex;align-items:center;gap:.5rem;box-shadow:0 10px 30px rgba(0,0,0,.5);z-index:20}
.tool-btn{background-color:transparent;border:2px solid transparent;color:#94a3b8;width:3rem;height:3rem;border-radius:50%;display:flex;justify-content:center;align-items:center;cursor:pointer;transition:all .2s ease}
.tool-btn:hover:not(:disabled),.tool-btn.active{background-color:rgba(59,130,246,.2);border-color:#3b82f6;color:#e0e0e0}
.tool-btn:disabled, .tool-btn.disabled { color: #555; cursor: not-allowed; background-color: transparent; border-color: transparent; }
.tool-separator{width:1px;height:1.5rem;background-color:#334155}
.line-width-slider{accent-color:#3b82f6;cursor:pointer}
.line-width-slider:disabled { cursor: not-allowed; }
#color-picker{opacity:0;width:0;height:0;position:absolute}

@media (max-width: 768px) {
  .drawing-toolbar { width: 95%; gap: 0.2rem; padding: 0.3rem; bottom: 0.5rem; }
  .tool-btn { width: 2.5rem; height: 2.5rem; }
  .tool-btn > i { width: 1.2rem; height: 1.2rem; }
  .tool-separator { margin: 0 0.1rem; }
}
</style>
