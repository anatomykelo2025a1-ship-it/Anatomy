<script setup>
import { useCardStore } from '../stores/cardStore';
const store = useCardStore();
// Add 'save' to the list of events
const emit = defineEmits(['undo', 'redo', 'clear', 'save']); 
const colors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ffffff'];
</script>

<template>
  <div class="toolbar-container">
    <div class="toolbar">
      <!-- Tool Buttons -->
      <button @click="store.setTool('pen')" :class="{ active: store.currentTool === 'pen' }" title="Pen"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg></button>
      <button @click="store.setTool('arrow')" :class="{ active: store.currentTool === 'arrow' }" title="Arrow"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>
      <button @click="store.setTool('highlighter')" :class="{ active: store.currentTool === 'highlighter' }" title="Highlighter"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5-3-3-9 9 9 9 3-3-4.5-4.5Z"/><path d="m15 12-9 9"/></svg></button>
      <button @click="store.setTool('eraser')" :class="{ active: store.currentTool === 'eraser' }" title="Eraser"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21H7Z"/><path d="M22 21H7"/><path d="m5 12 5 5"/></svg></button>

      <div class="separator"></div>

      <!-- History Buttons -->
      <button @click="emit('undo')" title="Undo (Ctrl+Z)"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></button>
      <button @click="emit('redo')" title="Redo (Ctrl+Y)"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 0 9 9 9 9 0 0 0 6-2.3L21 13"/></svg></button>
      <button @click="emit('clear')" title="Clear Canvas"><svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button>

      <!-- NEW Save Button -->
      <button @click="emit('save')" title="Save as Image">
        <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      </button>

      <div class="separator"></div>

      <!-- Color Palette & Slider -->
      <div class="color-palette">
        <button v-for="color in colors" :key="color" @click="store.setColor(color)" :style="{ backgroundColor: color }" :class="{ active: store.currentColor === color }" class="color-btn" :title="color"></button>
      </div>
      <div class="separator"></div>
      <input type="range" min="2" max="30" :value="store.lineWidth" @input="store.setLineWidth($event.target.value)" class="line-width-slider" title="Line Width"/>
    </div>
  </div>
</template>

<style scoped>
.toolbar-container{display:flex;justify-content:center;width:100%}.toolbar{background:rgba(30,30,30,.7);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);padding:.5rem 1rem;border-radius:50px;display:flex;gap:.75rem;align-items:center;border:1px solid rgba(255,255,255,.1);box-shadow:0 8px 32px 0 rgba(0,0,0,.37)}.toolbar button{display:flex;justify-content:center;align-items:center;width:40px;height:40px;border-radius:50%;border:2px solid transparent;background-color:transparent;color:#ddd;cursor:pointer;padding:0;transition:all .2s ease-in-out}.toolbar button:hover{background-color:rgba(255,255,255,.1)}.toolbar button.active{background-color:#42b883;color:#fff;border-color:rgba(66,184,131,.5)}.separator{width:1px;height:1.5rem;background-color:rgba(255,255,255,.1);margin:0 .25rem}.color-palette{display:flex;gap:.5rem;align-items:center}.color-btn{width:30px;height:30px;border-radius:50%;border:2px solid #555;transition:all .2s ease-in-out}.color-btn[title="#ffffff"]{border-color:#999}.color-btn:hover{transform:scale(1.1)}.color-btn.active{border-color:#fff;transform:scale(1.2);box-shadow:0 0 10px 2px var(--color-active,currentColor)}.line-width-slider{accent-color:#42b883;cursor:pointer}
</style>
