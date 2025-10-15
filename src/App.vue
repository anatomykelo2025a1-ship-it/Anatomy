<script setup>
import { ref, onMounted, onUnmounted } from 'vue' // Import onUnmounted
import FlashCard from './components/FlashCard.vue'
import DrawingToolbar from './components/DrawingToolbar.vue'
import { useCardStore } from './stores/cardStore.js'

const store = useCardStore()
const flashCardComponent = ref(null)

// --- Event Handlers ---
function handleUndo() {
  flashCardComponent.value?.undo()
}
function handleRedo() {
  flashCardComponent.value?.redo()
}
function handleClear() {
  flashCardComponent.value?.clearDrawing()
}
function handleSave() {
  flashCardComponent.value?.saveAsImage()
}

// --- Keyboard Shortcuts ---
function handleKeyDown(e) {
  // Prevent shortcuts when typing in an input
  if (e.target.tagName === 'INPUT') return

  // Ctrl+Z and Ctrl+Y for Undo/Redo
  if (e.ctrlKey && e.key.toLowerCase() === 'z') {
    e.preventDefault()
    handleUndo()
    return
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'y') {
    e.preventDefault()
    handleRedo()
    return
  }

  switch (e.key.toLowerCase()) {
    case 'arrowright':
      if (!store.isAtEnd) store.nextCard()
      break
    case 'arrowleft':
      if (!store.isAtStart) store.previousCard()
      break
    case 's':
      store.toggleAnswer()
      break
    case 'e':
      store.toggleDrawing()
      break
    case 'c':
      if (store.isDrawingEnabled) handleClear()
      break
  }
}

onMounted(() => {
  store.shuffleCards()
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <header>
    <h1>Pathology Practical Flash Cards</h1>
    <p>Card: {{ store.currentIndex + 1 }} / {{ store.cards.length }}</p>
    <button @click="store.toggleDrawing" class="toggle-draw-btn" title="Enable/Disable Drawing (E)">
      {{ store.isDrawingEnabled ? 'Disable Drawing' : 'Enable Drawing' }}
    </button>
  </header>

  <main>
    <FlashCard ref="flashCardComponent" v-if="store.currentCard" :card-data="store.currentCard" />
  </main>

  <footer>
    <!-- Listen for the new 'save' event -->
    <DrawingToolbar
      v-if="store.isDrawingEnabled"
      @undo="handleUndo"
      @redo="handleRedo"
      @clear="handleClear"
      @save="handleSave"
    />

    <button @click="store.toggleAnswer" class="answer-btn" title="Show/Hide Answer (S)">
      {{ store.isAnswerVisible ? 'Hide Answer' : 'Show Answer' }}
    </button>

    <div class="navigation">
      <button @click="store.previousCard" :disabled="store.isAtStart" title="Previous Card (←)">
        &larr; Previous
      </button>
      <button @click="store.nextCard" :disabled="store.isAtEnd" title="Next Card (→)">
        Next &rarr;
      </button>
    </div>
  </footer>
</template>

<style scoped>
header,
footer {
  text-align: center;
  padding: 1rem;
  background-color: #1a1a1a;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
main {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  flex-grow: 1;
}
.navigation {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.navigation button,
.toggle-draw-btn,
.answer-btn {
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
.navigation button:hover:not(:disabled),
.toggle-draw-btn:hover,
.answer-btn:hover {
  background-color: #33a06f;
}
.answer-btn {
  background-color: #3b82f6;
  margin-bottom: 1rem;
}
.answer-btn:hover {
  background-color: #2563eb;
}
.navigation button:disabled {
  background-color: #555;
  cursor: not-allowed;
}
.toggle-draw-btn {
  background-color: #42b883;
}
</style>
