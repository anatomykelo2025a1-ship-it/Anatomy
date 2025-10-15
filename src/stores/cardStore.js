import { defineStore } from 'pinia';
import { cards as initialCards } from '../cardsData.js';

export const useCardStore = defineStore('cardStore', {
  state: () => ({
    cards: [],
    currentIndex: 0,
    isAnswerVisible: false, // للتحكم في ظهور الإجابة
    isDrawingEnabled: false,
    currentTool: 'pen',
    currentColor: '#ef4444',
    lineWidth: 5,
  }),
  getters: {
    currentCard: (state) => state.cards[state.currentIndex],
    isAtStart: (state) => state.currentIndex === 0,
    isAtEnd: (state) => state.currentIndex === state.cards.length - 1,
  },
  actions: {
    shuffleCards() {
      this.cards = [...initialCards].sort(() => Math.random() - 0.5);
      this.currentIndex = 0;
      this.isAnswerVisible = false; // إخفاء الإجابة عند الخلط
    },
    nextCard() {
      if (!this.isAtEnd) {
        this.currentIndex++;
        this.isAnswerVisible = false; // إخفاء الإجابة عند الانتقال
      }
    },
    previousCard() {
      if (!this.isAtStart) {
        this.currentIndex--;
        this.isAnswerVisible = false; // إخفاء الإجابة عند الرجوع
      }
    },
    toggleAnswer() { // لإظهار/إخفاء الإجابة
      this.isAnswerVisible = !this.isAnswerVisible;
    },
    toggleDrawing() {
      this.isDrawingEnabled = !this.isDrawingEnabled;
    },
    setTool(tool) {
      this.currentTool = tool;
    },
    setColor(color) {
      this.currentColor = color;
    },
    setLineWidth(width) {
      this.lineWidth = Number(width);
    },
  },
});