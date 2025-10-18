<script setup>
import { ref, onMounted, watch } from 'vue'
import { useCardStore } from '../stores/cardStore'

const props = defineProps({ cardData: Object })
const store = useCardStore()
const canvas = ref(null)
const imageEl = ref(null)
let ctx = null
let isDrawing = false
let startX, startY

// --- Swipe Navigation Logic ---
const touchStartX = ref(0)
function handleTouchStart(e) {
  // CORRECTED: Do not start swipe if drawing is enabled or if the touch is on the canvas area
  if (store.isDrawingEnabled || e.target.tagName === 'CANVAS') {
    touchStartX.value = 0 // Reset to prevent accidental swipe
    return
  }
  touchStartX.value = e.touches[0].clientX
}
function handleTouchEnd(e) {
  if (store.isDrawingEnabled || touchStartX.value === 0) return
  const touchEndX = e.changedTouches[0].clientX
  const deltaX = touchEndX - touchStartX.value
  
  if (deltaX < -50) { // Swipe Left
    store.nextCard();
  }
  if (deltaX > 50) { // Swipe Right
    store.previousCard();
  }
  touchStartX.value = 0
}

// --- Drawing & History Logic ---
let resizeObserver = null
function setupCanvas(){if(!canvas.value)return;ctx=canvas.value.getContext("2d");if(resizeObserver){resizeObserver.disconnect()}resizeObserver=new ResizeObserver(entries=>{for(let entry of entries){const{width,height}=entry.contentRect;canvas.value.width=width;canvas.value.height=height;redrawCanvas()}});resizeObserver.observe(canvas.value);loadHistory()}
function getCoords(e){const t=canvas.value.getBoundingClientRect(),o=e.touches?e.touches[0].clientX:e.clientX,n=e.touches?e.touches[0].clientY:e.clientY,a=canvas.value.width/t.width,r=canvas.value.height/t.height;return{x:(o-t.left)*a,y:(n-t.top)*r}}
const history=ref([]),historyIndex=ref(-1);
function startDrawing(e){if(!store.isDrawingEnabled)return;isDrawing=!0;const{x:t,y:o}=getCoords(e);startX=t,startY=o,ctx.beginPath(),ctx.moveTo(t,o)}
function draw(e){if(!isDrawing||!store.isDrawingEnabled||"arrow"===store.currentTool)return;ctx.lineCap="round",ctx.lineJoin="round",ctx.lineWidth=store.lineWidth,ctx.strokeStyle=store.currentColor,ctx.globalCompositeOperation="eraser"===store.currentTool?"destination-out":"source-over",ctx.globalAlpha="highlighter"===store.currentTool?.3:1;const{x:t,y:o}=getCoords(e);ctx.lineTo(t,o),ctx.stroke()}
function stopDrawing(e){if(!isDrawing)return;isDrawing=!1,"arrow"===store.currentTool&&drawArrow(startX,startY,getCoords(e.changedTouches?e.changedTouches[0]:e).x,getCoords(e.changedTouches?e.changedTouches[0]:e).y),pushStateToHistory()}
function drawArrow(e,t,o,n){ctx.lineCap="round",ctx.lineJoin="round",ctx.lineWidth=store.lineWidth,ctx.strokeStyle=store.currentColor,ctx.globalCompositeOperation="source-over",ctx.globalAlpha=1;const a=10+.5*ctx.lineWidth,r=o-e,i=n-t;if(Math.hypot(r,i)<5)return;const s=Math.atan2(i,r);ctx.moveTo(e,t),ctx.lineTo(o,n),ctx.lineTo(o-a*Math.cos(s-Math.PI/6),n-a*Math.sin(s-Math.PI/6)),ctx.moveTo(o,n),ctx.lineTo(o-a*Math.cos(s+Math.PI/6),n-a*Math.sin(s+Math.PI/6)),ctx.stroke()}
const STORAGE_PREFIX="drawing_history_";function pushStateToHistory(){if(historyIndex.value<history.value.length-1){history.value.splice(historyIndex.value+1)}history.value.push(canvas.value.toDataURL());historyIndex.value++;saveHistory()}
function saveHistory(){const e={history:history.value,historyIndex:historyIndex.value};localStorage.setItem(STORAGE_PREFIX+props.cardData.id,JSON.stringify(e))}
function loadHistory(){const e=localStorage.getItem(STORAGE_PREFIX+props.cardData.id);if(e){const t=JSON.parse(e);history.value=t.history,historyIndex.value=t.historyIndex;redrawCanvas()}else{history.value=[],historyIndex.value=-1,ctx.clearRect(0,0,canvas.value.width,canvas.value.height),pushStateToHistory()}}
function redrawCanvas(){if(ctx&&historyIndex.value>=0&&history.value.length>0){const e=new Image;e.onload=()=>{ctx.clearRect(0,0,canvas.value.width,canvas.value.height),ctx.drawImage(e,0,0,canvas.value.width,canvas.value.height)},e.src=history.value[historyIndex.value]}else if(ctx){ctx.clearRect(0,0,canvas.value.width,canvas.value.height)}}
function undo(){historyIndex.value>0&&(historyIndex.value--,redrawCanvas(),saveHistory())}
function redo(){historyIndex.value<history.value.length-1&&(historyIndex.value++,redrawCanvas(),saveHistory())}
function clearDrawing(){history.value=[],historyIndex.value=-1,redrawCanvas(),pushStateToHistory()}
function saveAsImage(){const t=imageEl.value;if(!t)return;const o=document.createElement("canvas"),n=o.getContext("2d");o.width=t.naturalWidth,o.height=t.naturalHeight,n.drawImage(t,0,0),n.drawImage(canvas.value,0,0,o.width,o.height);const a=document.createElement("a");a.download=`pathology-card-${props.cardData.id}.png`,a.href=o.toDataURL("image/png"),a.click()}
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
  <div
    class="card"
    :class="{ 'answer-mode': store.isAnswerVisible }"
    ref="cardRef"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div class="image-container">
      <img ref="imageEl" :src="cardData.image" :alt="cardData.title" crossOrigin="anonymous" />
      <!-- CORRECTED: Added .stop to prevent events from bubbling up and conflicting with swipe -->
      <canvas
        ref="canvas"
        :class="{ active: store.isDrawingEnabled }"
        @mousedown.stop
        @mousemove.stop
        @mouseup.stop
        @mouseleave.stop
        @touchstart.prevent.stop
        @touchmove.prevent.stop
        @touchend.stop
      ></canvas>
    </div>

    <div v-if="!store.isAnswerVisible" class="question-container">
      <ul>
        <li v-for="(q, index) in cardData.question" :key="index" v-html="q"></li>
      </ul>
    </div>

    <div v-else class="info-container">
      <h3 class="identify-answer">{{ cardData.title }}</h3>
      <ol v-if="Array.isArray(cardData.comment) && cardData.isNumbered" class="comment-list">
        <li v-for="(item, index) in cardData.comment" :key="index" v-html="item"></li>
      </ol>
      <ul v-else-if="Array.isArray(cardData.comment)" class="comment-list">
        <li v-for="(item, index) in cardData.comment" :key="index" v-html="item"></li>
      </ul>
      <p v-else class="comment-list" v-html="cardData.comment"></p>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #3b82f6;
  border-radius: 18px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  transition: border-color 0.3s ease;
  user-select: none;
  -webkit-user-select: none;
}
.image-container {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 1.5/1;
  /* CORRECTED: Reduced margin */
  margin-bottom: 1rem;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
  box-shadow: 0 0 30px 8px rgba(59, 130, 246, 0.5);
  transition: box-shadow 0.3s ease;
}
canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
canvas.active {
  pointer-events: auto;
  cursor: crosshair;
}
.card.answer-mode {
  border-color: #22c55e;
}
.card.answer-mode .image-container img {
  box-shadow: 0 0 30px 8px rgba(34, 197, 94, 0.5);
}
.question-container ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
  font-size: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.question-container li {
  background: rgba(59, 130, 246, 0.15);
  border-left: 5px solid #3b82f6;
  padding: 16px 24px;
  border-radius: 10px;
}
.info-container {
  /* CORRECTED: Reduced margin */
  margin-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 1.5rem;
}
.identify-answer {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  color: #bbf7d0;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(34, 197, 94, 0.3);
  text-align: center;
  width: 100%;
}
.comment-list {
  font-size: 1.15rem;
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
}
.comment-list li {
  background: rgba(34, 197, 94, 0.15);
  border-left: 5px solid #22c55e;
  padding: 14px 20px;
  margin-bottom: 1rem;
  border-radius: 10px;
}
.comment-list li:last-child {
  margin-bottom: 0;
}
@media (max-width: 768px) {
  .card {
    padding: 1rem;
  }
  .question-container ul {
    font-size: 1rem;
  }
  .question-container li {
    padding: 12px 16px;
  }
  .identify-answer {
    font-size: 1.5rem;
  }
  .comment-list {
    font-size: 1rem;
  }
}
</style>

