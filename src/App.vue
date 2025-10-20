<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import FlashCard from './components/FlashCard.vue';
import DrawingToolbar from './components/DrawingToolbar.vue';
import { useCardStore } from './stores/cardStore.js';

const store = useCardStore();
// --- START: التعديل الرئيسي ---
// 1. أنشأنا مرجع (reference) للوصول إلى مكون البطاقة مباشرة
const flashCardComponent = ref(null);

// 2. أنشأنا دوال لاستقبال الأوامر من شريط الأدوات
//    وتمريرها إلى الدوال الموجودة داخل مكون البطاقة
function handleUndo() {
  flashCardComponent.value?.undo();
}
function handleRedo() {
  flashCardComponent.value?.redo();
}
function handleClear() {
  flashCardComponent.value?.clearDrawing();
}
function handleSave() {
  flashCardComponent.value?.saveAsImage();
}
// --- END: التعديل الرئيسي ---

function handleKeyDown(e) {
  if (e.target.tagName === 'INPUT') return;
  // أضفنا استدعاء الدوال الجديدة هنا أيضاً لاختصارات لوحة المفاتيح
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
  nextTick(() => {
    if (window.lucide) window.lucide.createIcons();
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

watch(() => store.isDrawingEnabled, () => {
  nextTick(() => {
    if (window.lucide) window.lucide.createIcons();
  });
});
</script>

<template>
  <div class="app-container">
    <main class="main-content">
      <!-- 3. ربطنا المرجع بالمكون هنا باستخدام 'ref' -->
      <FlashCard ref="flashCardComponent" v-if="store.currentCard" :card-data="store.currentCard" />
    </main>

    <!-- 4. أضفنا مستمعي الأحداث هنا لاستقبال الأوامر من شريط الأدوات -->
    <DrawingToolbar @undo="handleUndo" @redo="handleRedo" @clear="handleClear" @save="handleSave" />

    <div class="nav-container">
        <button @click="store.toggleDrawing" class="btn draw-btn" title="Enable/Disable Drawing (E)">
          <i data-lucide="pencil"></i>
        </button>
        <button @click="store.toggleAnswer" class="btn answer-btn" title="Show/Hide Answer (S)">
          {{ store.isAnswerVisible ? 'Question' : 'Answer' }}
        </button>
    </div>
  </div>
</template>

<style>
/* Global styles from your original code */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Segoe+UI:wght@400;600&display=swap');
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
.app-container{display:flex;flex-direction:column;min-height:100vh;padding-bottom:6rem}
.main-content{flex-grow:1;display:flex;justify-content:center;align-items:center;padding:1rem}
.nav-container{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);width:100%;z-index:15;display:flex;justify-content:center;gap:1rem;padding:0 1rem;box-sizing:border-box}
.btn{border:none;color:#fff;padding:.8rem 2.2rem;font-size:1.1rem;font-weight:600;border-radius:12px;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center}
.btn:hover:not(:disabled){transform:translateY(-2px)}
.answer-btn{background-color:#22c55e;box-shadow:0 5px 15px rgba(34,197,94,.4)}
.answer-btn:hover:not(:disabled){background-color:#16a34a}
.draw-btn{background-color:#3b82f6;box-shadow:0 5px 15px rgba(59,130,246,.4);padding:0.8rem}
.draw-btn:hover:not(:disabled){background-color:#2563eb}
@media (max-width: 768px) {
  .main-content { padding: 0.5rem; }
  .btn { padding: 0.7rem 1.5rem; font-size: 1rem; }
  .draw-btn { padding: 0.7rem; }
}
</style>
