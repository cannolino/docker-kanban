<template>
  <article class="card" draggable="true" @dragstart="onDragStart" @dragover.prevent @drop.prevent="onDrop">
    <div class="card__heading">
      <h3>{{ card.title }}</h3>
      <button class="card__delete" type="button" @click.stop="deleteCard" aria-label="Delete task">×</button>
    </div>

    <div class="card__description" v-if="!isEditingDescription">
      <p class="card__text" @click="startEditDescription">{{ card.description }}</p>
      <button class="card__edit-btn" type="button" @click.stop="startEditDescription" aria-label="Edit description">✏️</button>
    </div>

        <div class="card__edit-form" v-else @click.stop>
      <textarea
        v-model="editedDescription"
        class="card__textarea"
        @keydown.meta.enter="saveDescription"
        @keydown.ctrl.enter="saveDescription"
      ></textarea>
      <div class="card__edit-actions">
        <button class="btn-save" type="button" @click="saveDescription">Save</button>
        <button class="btn-cancel" type="button" @click="cancelEditDescription">Cancel</button>
      </div>
    </div>

        <!-- Timer section - show for In Progress cards or cards with timer data -->
        <div class="card__timer" v-if="props.isInProgress || hasTimerData">
      <!-- Active timer display -->
      <div v-if="timerRunning" class="timer-display">
          <div class="timer-time">{{ currentTimer?.formattedTime || '00:00:00' }}</div>
          <div class="timer-date">Started: {{ currentTimer?.startTimeFormatted || '' }}</div>
          <div class="timer-current">Now: {{ formatDate(new Date()) }}</div>
                    <button v-if="props.isInProgress" class="timer-btn stop-btn" type="button" @click.stop="stopTimerForCard">
            ⏹ Stop
          </button>
        </div>

      <!-- Inactive timer - can be started/continued -->
      <div v-else class="timer-controls">
      <button v-if="props.isInProgress" class="timer-btn start-btn" type="button" @click.stop="startTimerForCard">
        {{ card.timerData && card.timerData.duration ? '▶ Continue Timer' : '▶ Start Timer' }}
      </button>

            <!-- Show completed timer info if available (even when not in progress) -->
            <div v-if="card.timerData && card.timerData.duration && !props.isInProgress" class="timer-completed-info timer-readonly">
              <div class="timer-info">
                <span class="timer-duration">{{ card.timerData.durationFormatted }}</span>
                <span class="timer-date-range">
                  {{ card.timerData.startTimeFormatted }} - {{ card.timerData.endTimeFormatted }}
                </span>
              </div>
            </div>
    </div>
    </div>

    <div class="card__controls">
      <button class="action-btn" type="button" @click.stop="moveLeft" :disabled="isFirstColumn">←</button>
      <button class="action-btn" type="button" @click.stop="moveRight" :disabled="isLastColumn">→</button>
    </div>
  </article>
</template>

<script setup>
import { ref, inject, onMounted, onBeforeUnmount, computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
  columnId: {
    type: String,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isFirstColumn: {
    type: Boolean,
    required: true,
  },
  isLastColumn: {
    type: Boolean,
    required: true,
  },
  isInProgress: {
    type: Boolean,
    required: true,
  },
});

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

const emit = defineEmits(['drag-start', 'drop-card', 'move-left', 'move-right', 'delete-card', 'update-card']);

const isEditingDescription = ref(false);
const editedDescription = ref('');
const timerRunning = ref(false);
const currentTimer = ref(null);

// Check if card has any timer data (active or completed)
const hasTimerData = computed(() => {
  return (props.card.timerData && props.card.timerData.duration) || activeTimers.value[props.card.id];
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
}

function stopTimerForCard() {
  stopTimer(props.card.id);
  checkTimerStatus();
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

function startEditDescription() {
  isEditingDescription.value = true;
  editedDescription.value = props.card.description;
}

function saveDescription() {
  emit('update-card', props.card.id, { description: editedDescription.value });
  isEditingDescription.value = false;
}

function cancelEditDescription() {
  isEditingDescription.value = false;
  editedDescription.value = '';
}

function onDragStart() {
  emit('drag-start', props.card.id);
}

function onDrop() {
  emit('drop-card', props.card.id);
}

function moveLeft() {
  emit('move-left');
}

function moveRight() {
  emit('move-right');
}

function deleteCard() {
  emit('delete-card', props.card.id);
}
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 18px;
  background: white;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.06);
  cursor: grab;
}

.card:active {
  cursor: grabbing;
}

.card__heading {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
}

.card__heading h3 {
  margin: 0;
  font-size: 1rem;
}

.card__delete {
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 1.2rem;
  line-height: 1;
}

.card__delete:hover {
  color: #1e40af;
}

.card__text {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}

.card__description {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.card__text {
  cursor: pointer;
  flex: 1;
}

.card__text:hover {
  background: rgba(59, 130, 246, 0.08);
  border-radius: 8px;
  padding: 4px 6px;
}

.card__edit-btn {
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition: opacity 0.2s;
}

.card__description:hover .card__edit-btn {
  opacity: 1;
}

.card__edit-btn:hover {
  color: #1e40af;
}

.card__edit-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card__textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #2563eb;
  border-radius: 12px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.card__edit-actions {
  display: flex;
  gap: 8px;
}

.btn-save,
.btn-cancel {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-save {
  background: #10b981;
  color: white;
}

.btn-save:hover {
  background: #059669;
}

.btn-cancel {
  background: #e5e7eb;
  color: #374151;
}

.btn-cancel:hover {
  background: #d1d5db;
}

.card__controls {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.action-btn {
  flex: 1;
  border: 1px solid rgba(148, 163, 184, 0.5);
  border-radius: 999px;
  background: #f8fafc;
  padding: 10px 0;
  color: #0f172a;
  font-weight: 600;
}

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

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
</style>
