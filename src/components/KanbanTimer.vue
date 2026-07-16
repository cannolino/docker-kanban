<template>
  <!-- Timer section - show for cards with timer data -->
  <div class="card__timer" v-if="hasTimerData">
    <!-- Active timer display -->
    <div v-if="timerRunning" class="timer-display">
      <div class="timer-time">{{ currentTimer?.formattedTime || '00:00:00' }}</div>
      <div class="timer-date">Started: {{ currentTimer?.startTimeFormatted || '' }}</div>
      <div class="timer-current">Now: {{ formatDate(new Date()) }}</div>
      <div v-if="isInProgress" class="timer-button-grid">
        <button class="timer-btn pause-btn" type="button" @click.stop="pauseTimerForCard">
          ⏸ Pause
        </button>
        <button class="timer-btn stop-btn" type="button" @click.stop="stopTimerForCard">
          ⏹ Stop
        </button>
      </div>
    </div>

    <!-- Paused timer display -->
    <div v-else-if="timerPaused" class="timer-display">
      <div class="timer-time">{{ currentTimer?.formattedTime || '00:00:00' }}</div>
      <div class="timer-date">Started: {{ currentTimer?.startTimeFormatted || '' }}</div>
      <div class="timer-date">Paused: {{ currentTimer?.pauseTimeFormatted || '' }}</div>
      <div v-if="isInProgress" class="timer-button-grid">
        <button class="timer-btn resume-btn" type="button" @click.stop="resumeTimerForCard">
          ▶ Resume
        </button>
        <button class="timer-btn stop-btn" type="button" @click.stop="stopTimerForCard">
          ⏹ Stop
        </button>
      </div>
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

const emit = defineEmits(['timer-start', 'timer-stop', 'timer-pause', 'timer-resume', 'add-timer']);

const { startTimer, pauseTimer, resumeTimer, continueTimer, stopTimer, getTimerInfo, activeTimers, displayLocalStorageContent } = inject('timerFunctions');

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
const timerPaused = ref(false);
const currentTimer = ref(null);

// Check if card has any timer data (active or timer structure initialized)
const hasTimerData = computed(() => {
  const timerInfo = getTimerInfo(props.card.id);
  return props.card.timerData || (activeTimers.value && activeTimers.value[props.card.id]) || timerInfo;
});

// Check if timer is running for this card
function checkTimerStatus() {
  const timerInfo = getTimerInfo(props.card.id);
  if (timerInfo) {
    timerRunning.value = timerInfo.running && !timerInfo.paused;
    timerPaused.value = timerInfo.paused;
    currentTimer.value = timerInfo;
  } else {
    timerRunning.value = false;
    timerPaused.value = false;
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
    continueTimer(props.card.id, props.card.timerData);
  } else {
    // Start new timer
    startTimer(props.card.id);
  }
  checkTimerStatus();
  emit('timer-start');
}

function pauseTimerForCard() {
  pauseTimer(props.card.id);
  checkTimerStatus();
  emit('timer-pause');
}

function resumeTimerForCard() {
  resumeTimer(props.card.id);
  checkTimerStatus();
  emit('timer-resume');
}

function stopTimerForCard() {
  stopTimer(props.card.id);
  checkTimerStatus();
  emit('timer-stop');
  
  // Display local storage content after stopping timer
  displayLocalStorageContent();
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

<style src="@/assets/timer.css" scoped></style>