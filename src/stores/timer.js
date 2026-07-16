import { defineStore } from "pinia"

export const useTimerStore = defineStore('timer', {
  state: () => ({
    timers: {}, // Store all timers by card ID
    activeTimers: {}, // Currently running timers
    pausedTimers: {}, // Currently paused timers
  }),

  getters: {
    // Get all timers
    getAllTimers: (state) => state.timers,

    // Get a specific timer by card ID
    getTimerById: (state) => (cardId) => state.timers[cardId],

    // Get active timer by card ID
    getActiveTimerById: (state) => (cardId) => state.activeTimers[cardId],

    // Get paused timer by card ID
    getPausedTimerById: (state) => (cardId) => state.pausedTimers[cardId],

    // Check if a timer is running for a card
    isTimerRunning: (state) => (cardId) => !!state.activeTimers[cardId],

    // Check if a timer is paused for a card
    isTimerPaused: (state) => (cardId) => !!state.pausedTimers[cardId],
  },

  actions: {
    // Initialize a new timer for a card
    initializeTimer(cardId) {
      if (!this.timers[cardId]) {
        this.timers[cardId] = {
          cardId,
          startTime: null,
          startTimeFormatted: null,
          endTime: null,
          endTimeFormatted: null,
          duration: 0,
          durationFormatted: '00:00:00',
          pausedTime: null,
          pausedTimeFormatted: null,
          pausedDuration: 0,
          history: [] // Store historical timer sessions
        };
      }
    },

    // Start a new timer
    startTimer(cardId) {
      const now = new Date();
      this.initializeTimer(cardId);

      const timer = this.timers[cardId];
      timer.startTime = now;
      timer.startTimeFormatted = this.formatDate(now);
      timer.duration = 0;
      timer.durationFormatted = '00:00:00';
      timer.pausedTime = null;
      timer.pausedTimeFormatted = null;
      timer.pausedDuration = 0;

      // Add to active timers
      this.activeTimers[cardId] = {
        startTime: now,
        lastUpdate: now,
        ...timer
      };

      // Remove from paused if it was there
      delete this.pausedTimers[cardId];
    },

    // Continue an existing timer
    continueTimer(cardId, timerData) {
      const now = new Date();
      this.initializeTimer(cardId);

      const timer = this.timers[cardId];
      // Merge existing data with new start
      timer.startTime = now;
      timer.startTimeFormatted = this.formatDate(now);
      timer.pausedTime = null;
      timer.pausedTimeFormatted = null;

      // Add to active timers
      this.activeTimers[cardId] = {
        startTime: now,
        lastUpdate: now,
        ...timer
      };

      // Remove from paused if it was there
      delete this.pausedTimers[cardId];
    },

    // Pause a running timer
    pauseTimer(cardId) {
      const now = new Date();
      const activeTimer = this.activeTimers[cardId];

      if (activeTimer) {
        const timer = this.timers[cardId];
        timer.pausedTime = now;
        timer.pausedTimeFormatted = this.formatDate(now);

        // Calculate duration up to pause point
        const duration = this.calculateDuration(activeTimer.startTime, now);
        timer.duration = duration;
        timer.durationFormatted = this.formatDuration(duration);
        timer.pausedDuration = duration;

        // Move from active to paused
        this.pausedTimers[cardId] = {
          ...activeTimer,
          pausedTime: now,
          pausedTimeFormatted: timer.pausedTimeFormatted,
          duration: timer.duration,
          durationFormatted: timer.durationFormatted
        };

        delete this.activeTimers[cardId];
      }
    },

    // Resume a paused timer
    resumeTimer(cardId) {
      const now = new Date();
      const pausedTimer = this.pausedTimers[cardId];

      if (pausedTimer) {
        const timer = this.timers[cardId];
        timer.startTime = now;
        timer.startTimeFormatted = this.formatDate(now);
        timer.pausedTime = null;
        timer.pausedTimeFormatted = null;

        // Move from paused to active
        this.activeTimers[cardId] = {
          startTime: now,
          lastUpdate: now,
          ...timer,
          // Keep the accumulated duration
          duration: pausedTimer.duration,
          durationFormatted: pausedTimer.durationFormatted
        };

        delete this.pausedTimers[cardId];
      }
    },

    // Stop a timer (running or paused)
    stopTimer(cardId) {
      const now = new Date();
      let timer = this.timers[cardId];

      // If timer is running
      if (this.activeTimers[cardId]) {
        const activeTimer = this.activeTimers[cardId];
        timer.endTime = now;
        timer.endTimeFormatted = this.formatDate(now);
        timer.duration = this.calculateDuration(activeTimer.startTime, now);
        timer.durationFormatted = this.formatDuration(timer.duration);

        // Add to history
        timer.history.push({
          startTime: activeTimer.startTime,
          endTime: now,
          duration: timer.duration,
          durationFormatted: timer.durationFormatted
        });

        delete this.activeTimers[cardId];
      }
      // If timer is paused
      else if (this.pausedTimers[cardId]) {
        const pausedTimer = this.pausedTimers[cardId];
        timer.endTime = now;
        timer.endTimeFormatted = this.formatDate(now);
        // Duration was already calculated when paused

        // Add to history
        timer.history.push({
          startTime: pausedTimer.startTime,
          endTime: now,
          duration: pausedTimer.duration,
          durationFormatted: pausedTimer.durationFormatted
        });

        delete this.pausedTimers[cardId];
      }
    },

    // Update timer display (call this periodically)
    updateTimerDisplay(cardId) {
      const activeTimer = this.activeTimers[cardId];
      if (activeTimer) {
        const now = new Date();
        const duration = this.calculateDuration(activeTimer.startTime, now);
        const timer = this.timers[cardId];
        timer.duration = duration;
        timer.durationFormatted = this.formatDuration(duration);
        timer.currentTime = now;
      }
    },

    // Calculate duration between two dates in seconds
    calculateDuration(startTime, endTime) {
      return Math.floor((endTime - startTime) / 1000);
    },

    // Format duration in seconds to HH:MM:SS
    formatDuration(seconds) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      return [
        hrs.toString().padStart(2, '0'),
        mins.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
      ].join(':');
    },

    // Format date for display
    formatDate(date) {
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    // Get timer info for display
    getTimerInfo(cardId) {
      const timer = this.timers[cardId];
      if (!timer) return null;

      // Check if it's active
      if (this.activeTimers[cardId]) {
        return {
          ...timer,
          running: true,
          paused: false,
          formattedTime: this.formatDuration(this.calculateDuration(this.activeTimers[cardId].startTime, new Date()))
        };
      }
      // Check if it's paused
      else if (this.pausedTimers[cardId]) {
        return {
          ...timer,
          running: false,
          paused: true,
          formattedTime: timer.durationFormatted
        };
      }
      // Return the stored timer data
      else {
        return {
          ...timer,
          running: false,
          paused: false,
          formattedTime: timer.durationFormatted
        };
      }
    },

        // Display local storage content (for debugging)
    displayLocalStorageContent() {
      console.log('Current timer store state:', this.$state);
      console.log('Local storage content:', localStorage.getItem('timer'));
    }
  },
  
  // Enable persistence for the timer store
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'timer',
        storage: localStorage,
        paths: ['timers'] // Only persist the timers data, not active/paused states
      }
    ]
  }
});
