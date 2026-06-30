<template>
  <!-- Timer section - show for cards with timer data -->
  <div class="card__timer" v-if="hasTimerData">
    <!-- Active timer display -->
    <div v-if="timerRunning" class="timer-display">
      <div class="timer-time">{{ currentTimer?.formattedTime || '00:00:00' }}</div>
      <div class="timer-date">Started: {{ currentTimer?.startTimeFormatted || '' }}</div>
      <div class="timer-current">Now: {{ formatDate(new Date()) }}</div>
      <button v-if="isInProgress" class="timer-btn stop-btn" type="button" @click.stop="stopTimerForCard">
        ⏹ Stop
      </button>
    </div>

    <!-- Inactive timer - can be started/continued -->
    <div v-else class="timer-controls">
      <button v-if="isInProgress" class="timer-btn start-btn" type="button" @click.stop="startTimerForCard">
        {{ card.timerData && card.timerData.duration ? '▶ Continue Timer' : '▶ Start Timer' }}
      </button>

      <!-- Show completed timer info if available (even when not in progress) -->
      <div v-if="card.timerData && card.timerData.duration && !isInProgress" class="timer-completed-info timer-readonly">
        <div class="timer-info">
          <span class="timer-duration">{{ card.timerData.durationFormatted }}</span>
          <span class="timer-date-range">
            {{ card.timerData.startTimeFormatted }} - {{ card.timerData.endTimeFormatted }}
          </span>
        </div>
      </div>
      
      <!-- Show placeholder for cards with timer structure but no data yet -->
      <div v-if="card.timerData && !card.timerData.duration && !isInProgress" class="timer-placeholder">
        <span class="timer-placeholder-text">Timer ready (move to In Progress to start)</span>
      </div>
    </div>
  </div>

  <!-- Add Timer button for In Progress cards without timer -->
  <div v-if="isInProgress && !hasTimerData" class="card__add-timer">
    <button class="add-timer-btn" type="button" @click.stop="addTimerToCard">
      ⏱️ Add Timer
    </button>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
  isInProgress: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(['timer-start', 'timer-stop', 'add-timer']);

const { startTimer, stopTimer, getTimerInfo, activeTimers, timerInterval } = inject('timerFunctions');

function formatDate(date) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const timerRunning = ref(false);
const currentTimer = ref(null);

// Check if card has any timer data (active or timer structure initialized)
const hasTimerData = computed(() => {
  return props.card.timerData || activeTimers.value[props.card.id];
});

// Check if timer is running for this card
function checkTimerStatus() {
  const timerInfo = getTimerInfo(props.card.id);
  if (timerInfo) {
    timerRunning.value = timerInfo.running;
    currentTimer.value = timerInfo;
  } else {
    timerRunning.value = false;
    currentTimer.value = null;
  }
}

function addTimerToCard() {
  // Initialize timer data structure for this card
  const updates = {
    timerData: {
      startTime: null,
      startTimeFormatted: null,
      endTime: null,
      endTimeFormatted: null,
      duration: 0,
      durationFormatted: '00:00:00'
    }
  };
  emit('add-timer', updates);
}

function startTimerForCard() {
  if (props.card.timerData && props.card.timerData.duration) {
    // Continue existing timer
    const originalStartTime = new Date(props.card.timerData.startTime);
    const elapsed = props.card.timerData.duration || 0;
    
    // Calculate new start time that accounts for previous duration
    const now = new Date();
    const adjustedStartTime = new Date(now.getTime() - (elapsed * 1000));
    
    // Manually set the timer state
    activeTimers.value[props.card.id] = {
      startTime: adjustedStartTime.getTime(),
      startTimeFormatted: props.card.timerData.startTimeFormatted, // Keep original start time
      elapsed: elapsed,
      running: true
    };
    
    // Start interval if not already running
    if (!timerInterval.value) {
      timerInterval.value = setInterval(() => {
        Object.keys(activeTimers.value).forEach(cardId => {
          if (activeTimers.value[cardId].running) {
            activeTimers.value[cardId].elapsed = Math.floor((Date.now() - activeTimers.value[cardId].startTime) / 1000);
          }
        });
      }, 1000);
    }
  } else {
    // Start new timer
    startTimer(props.card.id);
  }
  checkTimerStatus();
  emit('timer-start');
}

function stopTimerForCard() {
  stopTimer(props.card.id);
  checkTimerStatus();
  emit('timer-stop');
}

// Check timer status when component is created
checkTimerStatus();

// Set up interval to update timer display
let displayInterval = null;
onMounted(() => {
  displayInterval = setInterval(() => {
    checkTimerStatus();
  }, 1000);
});

onBeforeUnmount(() => {
  if (displayInterval) {
    clearInterval(displayInterval);
  }
});
</script>

<style scoped>
.card__timer {
  padding: 12px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  margin-top: 8px;
}

.timer-controls {
  display: flex;
  justify-content: center;
}

.timer-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.timer-time {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1e40af;
  font-family: monospace;
}

.timer-date {
  font-size: 0.8rem;
  color: #64748b;
}

.timer-current {
  font-size: 0.7rem;
  color: #94a3b8;
  font-style: italic;
}

.timer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.timer-duration {
  font-size: 1.1rem;
  font-weight: 600;
  color: #10b981;
  font-family: monospace;
}

.timer-date-range {
  font-size: 0.75rem;
  color: #64748b;
  text-align: center;
}

.timer-btn {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.timer-btn:hover {
  transform: translateY(-1px);
}

.start-btn {
  background: #10b981;
  color: white;
}

.start-btn:hover {
  background: #059669;
}

.stop-btn {
  background: #ef4444;
  color: white;
}

.stop-btn:hover {
  background: #dc2626;
}

.timer-completed {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
}

.timer-readonly {
  opacity: 0.8;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.timer-readonly .timer-btn {
  display: none;
}

.card__add-timer {
  padding: 12px 0;
  border-top: 1px solid rgba(148, 163, 184, 0.2);
  margin-top: 8px;
  text-align: center;
}

.add-timer-btn {
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  background: #f1f5f9;
  color: #64748b;
}

.add-timer-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.timer-placeholder {
  padding: 8px;
  text-align: center;
  font-size: 0.85rem;
  color: #94a3b8;
  font-style: italic;
}

.timer-placeholder-text {
  display: inline-block;
  padding: 4px 8px;
  background: rgba(148, 163, 184, 0.1);
  border-radius: 6px;
}
</style>