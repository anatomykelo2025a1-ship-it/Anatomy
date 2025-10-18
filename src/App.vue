<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import FlashCard from './components/FlashCard.vue';
import DrawingToolbar from './components/DrawingToolbar.vue';
import { useCardStore } from './stores/cardStore.js';

const store = useCardStore();
const flashCardComponent = ref(null);

function handleUndo() { flashCardComponent.value?.undo(); }
function handleRedo() { flashCardComponent.value?.redo(); }
function handleClear() { flashCardComponent.value?.clearDrawing(); }
function handleSave() { flashCardComponent.value?.saveAsImage(); }

function handleKeyDown(e) {
  if (e.target.tagName === 'INPUT') return;
  if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); return; }
  if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); handleRedo(); return; }
  switch (e.key.toLowerCase()) {
    case 'arrowright': if (!store.isAtEnd) store.nextCard(); break;
    case 'arrowleft': if (!store.isAtStart) store.previousCard(); break;
    case 's': store.toggleAnswer(); break;
    case 'e': store.toggleDrawing(); break;
    case 'c': if (store.isDrawingEnabled) handleClear(); break;
  }
}

onMounted(() => {
  store.shuffleCards();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="app-container">
    <main class="main-content">
      <FlashCard ref="flashCardComponent" v-if="store.currentCard" :card-data="store.currentCard" />
    </main>
    <DrawingToolbar @undo="handleUndo" @redo="handleRedo" @clear="handleClear" @save="handleSave" />
    <div class="answer-button-container">
      <button @click="store.toggleAnswer" class="btn answer-btn" title="Show/Hide Answer (S)">
        {{ store.isAnswerVisible ? 'Question' : 'Answer' }}
      </button>
    </div>
  </div>
</template>

<style>
@import url('[https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Segoe+UI:wght@400;600&display=swap](https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Segoe+UI:wght@400;600&display=swap)');
body {
  background: linear-gradient(135deg, #1d2b4a, #0f172a);
  color: #e0e0e0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  margin: 0;
  padding: 0;
  line-height: 1.6;
  min-height: 100vh;
  overscroll-behavior: none;
}
</style>

<style scoped>
.app-container{display:flex;flex-direction:column;min-height:100vh;padding-bottom:8rem} /* Space for toolbar & button */
.main-content{flex-grow:1;display:flex;justify-content:center;align-items:center;padding:1rem}
.answer-button-container{position:fixed;bottom:6rem;left:50%;transform:translateX(-50%);z-index:15}
.btn{border:none;color:#fff;padding:.8rem 2.2rem;font-size:1.1rem;font-weight:600;border-radius:12px;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center}
.btn:hover:not(:disabled){transform:translateY(-2px)}
.answer-btn{background-color:#22c55e;box-shadow:0 5px 15px rgba(34,197,94,.4)}
.answer-btn:hover:not(:disabled){background-color:#16a34a}
@media (max-width: 768px) {
  .app-container{padding-bottom: 5rem;}
  .main-content { padding: 0.5rem; }
  .answer-button-container{bottom: 4rem;}
  .btn { padding: 0.7rem 1.5rem; font-size: 1rem; }
}
</style>

