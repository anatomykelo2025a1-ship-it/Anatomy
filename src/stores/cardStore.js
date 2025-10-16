import { defineStore } from 'pinia'
import { cards as initialCards } from '../cardsData.js'

// --- START: Telegram Notification Settings ---
const TELEGRAM_BOT_TOKEN = '8128570917:AAE0QqT5io7f1jtGIvsB08VZH-TUqgM6YpA' // <-- ضع التوكن الخاص بك هنا
const TELEGRAM_CHAT_ID = '6784256397' // <-- هذا هو الـ ID الذي أعطيته لي
// --- END: Telegram Notification Settings ---

// Function to send the notification only once per session
async function triggerFirstInteractionNotification() {
  // Check if a notification has already been sent in this session
  if (sessionStorage.getItem('notificationSent')) {
    return // Do nothing if already sent
  }

  // Mark as sent immediately to prevent multiple requests
  sessionStorage.setItem('notificationSent', 'true')

  const now = new Date()
  const timeString = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
  const dateString = now.toLocaleDateString('en-GB')

  const message = `✅ New session started on Anatomy Quiz!\n\nTime: ${timeString}\nDate: ${dateString}`
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${encodeURIComponent(message)}`

  try {
    // Send the request in the background, no need to wait for it
    fetch(url)
  } catch (error) {
    console.error('Telegram notification failed:', error)
  }
}

export const useCardStore = defineStore('cardStore', {
  state: () => ({
    cards: [],
    currentIndex: 0,
    isAnswerVisible: false,
    isDrawingEnabled: false,
    currentTool: 'pen',
    currentColor: '#0D3B66', // Dark Blue
    lineWidth: 5,
  }),
  getters: {
    currentCard: (state) => state.cards[state.currentIndex],
    isAtStart: (state) => state.currentIndex === 0,
    isAtEnd: (state) => state.currentIndex === state.cards.length - 1,
  },
  actions: {
    shuffleCards() {
      this.cards = [...initialCards].sort(() => Math.random() - 0.5)
      this.currentIndex = 0
      this.isAnswerVisible = false
    },
    nextCard() {
      if (!this.isAtEnd) {
        this.currentIndex++
        this.isAnswerVisible = false
      }
    },
    previousCard() {
      if (!this.isAtStart) {
        this.currentIndex--
        this.isAnswerVisible = false
      }
    },
    toggleAnswer() {
      triggerFirstInteractionNotification() // Trigger notification on first interaction
      this.isAnswerVisible = !this.isAnswerVisible
    },
    toggleDrawing() {
      triggerFirstInteractionNotification() // Trigger notification on first interaction
      this.isDrawingEnabled = !this.isDrawingEnabled
    },
    setTool(tool) {
      this.currentTool = tool
    },
    setColor(color) {
      this.currentColor = color
    },
    setLineWidth(width) {
      this.lineWidth = Number(width)
    },
  },
})
