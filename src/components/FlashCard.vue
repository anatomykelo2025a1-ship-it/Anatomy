<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCardStore } from '../stores/cardStore'

const props = defineProps({ cardData: Object })
const store = useCardStore()
const canvas = ref(null)
const imageEl = ref(null) // Reference to the img element
let ctx = null
let isDrawing = false
let startX, startY

// --- NEW: Resize observer to handle canvas resizing ---
let resizeObserver = null

function setupCanvas() {
  if (!canvas.value) return
  ctx = canvas.value.getContext('2d')

  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      const { width, height } = entry.contentRect
      canvas.value.width = width
      canvas.value.height = height
      redrawCanvas()
    }
  })

  resizeObserver.observe(canvas.value)
  loadHistory()
}

function getCoords(e) {
  const rect = canvas.value.getBoundingClientRect()
  const clientX = e.touches ? e.touches[0].clientX : e.clientX
  const clientY = e.touches ? e.touches[0].clientY : e.clientY

  const scaleX = canvas.value.width / rect.width
  const scaleY = canvas.value.height / rect.height

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  }
}

// --- Drawing & History Logic ---
const history = ref([])
const historyIndex = ref(-1)

function startDrawing(e) {
  if (!store.isDrawingEnabled) return
  isDrawing = !0
  const { x: t, y: o } = getCoords(e)
  ;((startX = t), (startY = o), ctx.beginPath(), ctx.moveTo(t, o))
}
function draw(e) {
  if (!isDrawing || !store.isDrawingEnabled || 'arrow' === store.currentTool) return
  ;((ctx.lineCap = 'round'),
    (ctx.lineJoin = 'round'),
    (ctx.lineWidth = store.lineWidth),
    (ctx.strokeStyle = store.currentColor),
    (ctx.globalCompositeOperation =
      'eraser' === store.currentTool ? 'destination-out' : 'source-over'),
    (ctx.globalAlpha = 'highlighter' === store.currentTool ? 0.3 : 1))
  const { x: t, y: o } = getCoords(e)
  ;(ctx.lineTo(t, o), ctx.stroke())
}
function stopDrawing(e) {
  if (!isDrawing) return
  ;((isDrawing = !1),
    'arrow' === store.currentTool &&
      drawArrow(
        startX,
        startY,
        getCoords(e.changedTouches ? e.changedTouches[0] : e).x,
        getCoords(e.changedTouches ? e.changedTouches[0] : e).y,
      ),
    pushStateToHistory())
}
function drawArrow(e, t, o, n) {
  ;((ctx.lineCap = 'round'),
    (ctx.lineJoin = 'round'),
    (ctx.lineWidth = store.lineWidth),
    (ctx.strokeStyle = store.currentColor),
    (ctx.globalCompositeOperation = 'source-over'),
    (ctx.globalAlpha = 1))
  const a = 10 + 0.5 * ctx.lineWidth,
    r = o - e,
    i = n - t
  if (Math.hypot(r, i) < 5) return
  const s = Math.atan2(i, r)
  ;(ctx.moveTo(e, t),
    ctx.lineTo(o, n),
    ctx.lineTo(o - a * Math.cos(s - Math.PI / 6), n - a * Math.sin(s - Math.PI / 6)),
    ctx.moveTo(o, n),
    ctx.lineTo(o - a * Math.cos(s + Math.PI / 6), n - a * Math.sin(s + Math.PI / 6)),
    ctx.stroke())
}
const STORAGE_PREFIX = 'drawing_history_'
function pushStateToHistory() {
  if (historyIndex.value < history.value.length - 1) {
    history.value.splice(historyIndex.value + 1)
  }
  history.value.push(canvas.value.toDataURL())
  historyIndex.value++
  saveHistory()
}
function saveHistory() {
  const e = { history: history.value, historyIndex: historyIndex.value }
  localStorage.setItem(STORAGE_PREFIX + props.cardData.id, JSON.stringify(e))
}
function loadHistory() {
  const e = localStorage.getItem(STORAGE_PREFIX + props.cardData.id)
  if (e) {
    const t = JSON.parse(e)
    ;((history.value = t.history), (historyIndex.value = t.historyIndex))
    redrawCanvas()
  } else {
    ;((history.value = []),
      (historyIndex.value = -1),
      ctx.clearRect(0, 0, canvas.value.width, canvas.value.height),
      pushStateToHistory())
  }
}
function redrawCanvas() {
  if (ctx && historyIndex.value >= 0 && history.value.length > 0) {
    const e = new Image()
    ;((e.onload = () => {
      ;(ctx.clearRect(0, 0, canvas.value.width, canvas.value.height),
        ctx.drawImage(e, 0, 0, canvas.value.width, canvas.value.height))
    }),
      (e.src = history.value[historyIndex.value]))
  } else if (ctx) {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
  }
}
function undo() {
  historyIndex.value > 0 && (historyIndex.value--, redrawCanvas(), saveHistory())
}
function redo() {
  historyIndex.value < history.value.length - 1 &&
    (historyIndex.value++, redrawCanvas(), saveHistory())
}
function clearDrawing() {
  ;((history.value = []), (historyIndex.value = -1), redrawCanvas(), pushStateToHistory())
}
function saveAsImage() {
  const t = imageEl.value
  if (!t) return
  const o = document.createElement('canvas'),
    n = o.getContext('2d')
  ;((o.width = t.naturalWidth),
    (o.height = t.naturalHeight),
    n.drawImage(t, 0, 0),
    n.drawImage(canvas.value, 0, 0, o.width, o.height))
  const a = document.createElement('a')
  ;((a.download = `pathology-card-${props.cardData.id}.png`),
    (a.href = o.toDataURL('image/png')),
    a.click())
}
defineExpose({ undo, redo, clearDrawing, saveAsImage })
onMounted(() => {
  setupCanvas()
})
watch(
  () => props.cardData,
  () => {
    if (ctx) {
      loadHistory()
    }
  },
)
</script>

<template>
  <div class="card">
    <div class="image-container">
      <img ref="imageEl" :src="cardData.image" :alt="cardData.title" crossOrigin="anonymous" />
      <!-- تمت إضافة :class="{ active: store.isDrawingEnabled }" هنا -->
      <canvas
        ref="canvas"
        :class="{ active: store.isDrawingEnabled }"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawing"
        @touchmove.prevent="draw"
        @touchend="stopDrawing"
      >
      </canvas>
    </div>
    <div class="question-container">
      <ul>
        <li v-for="(q, index) in cardData.question" :key="index" v-html="q"></li>
      </ul>
    </div>
    <div v-if="store.isAnswerVisible" class="info-container">
      <h3>{{ cardData.title }}</h3>
      <ol v-if="Array.isArray(cardData.comment) && cardData.isNumbered">
        <li v-for="(item, index) in cardData.comment" :key="index">{{ item }}</li>
      </ol>
      <ul v-else-if="Array.isArray(cardData.comment)">
        <li v-for="(item, index) in cardData.comment" :key="index">{{ item }}</li>
      </ul>
      <p v-else>{{ cardData.comment }}</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  border: 1px solid #444;
  border-radius: 15px;
  padding: 0.5rem; /* تم تقليل الإطار الداخلي */
  margin: 1rem;
  /* Make width flexible */
  width: 100%;
  max-width: 550px; /* Set a max-width for larger screens */
  background-color: #1a1a1a;
  color: #e0e0e0;
  display: flex;
  flex-direction: column;
}

.image-container {
  position: relative;
  /* Make the container responsive */
  width: 100%;
  height: auto;
  aspect-ratio: 500 / 400; /* Maintain aspect ratio */
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
  background-color: #000;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  /* Make canvas cover the container */
  width: 100%;
  height: 100%;
  pointer-events: none;
}

canvas.active {
  pointer-events: auto;
  cursor: crosshair;
}

/* --- Question & Answer Styles --- */
.question-container {
  padding: 1rem 0.5rem;
  border-bottom: 1px solid #444;
} /* Adjusted padding */
.question-container ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.question-container li {
  background: rgba(59, 130, 246, 0.15);
  border-left: 4px solid #3b82f6;
  padding: 12px 18px;
  border-radius: 8px;
  font-size: 1rem;
} /* Adjusted font size */

.info-container {
  padding: 1rem 0.5rem 0 0.5rem;
} /* Adjusted padding */
h3 {
  color: #42b883;
  margin-top: 0;
  font-size: 1.1rem;
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #444;
} /* Adjusted font size */
p {
  font-size: 1rem;
}
ul,
ol {
  text-align: left;
  padding: 0;
  list-style: none;
}
ol li {
  background: rgba(34, 197, 94, 0.1);
  border-left: 4px solid #22c55e;
  border-radius: 8px;
  padding: 12px 18px;
  margin-bottom: 0.75rem;
  counter-increment: list-counter;
  display: flex;
  align-items: flex-start;
}
ol li::before {
  content: counter(list-counter) '.';
  font-weight: 700;
  color: #a7f3d0;
  margin-right: 12px;
  min-width: 20px;
}
.info-container ul li {
  padding-left: 1.2em;
  position: relative;
}
.info-container ul li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #42b883;
  font-size: 1.2em;
}
</style>
