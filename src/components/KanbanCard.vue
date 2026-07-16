<template>
  <article class="card" draggable="true" @dragstart="onDragStart" @dragover.prevent @drop.prevent="onDrop">
    <div class="card__heading">
      <h3>{{ card.title }}</h3>
      <button class="card__delete" type="button" @click.stop="deleteCard" aria-label="Delete task">×</button>
    </div>

    <CardDescriptionEditor
      :description="card.description"
      @update="updateDescription"
    />

    <KanbanTimer
      :card="card"
      :isInProgress="isInProgress"
      @timer-start="handleTimerStart"
      @timer-stop="handleTimerStop"
      @timer-pause="handleTimerPause"
      @timer-resume="handleTimerResume"
      @add-timer="addTimerToCard"
    />

    <div class="card__controls">
      <button class="action-btn" type="button" @click.stop="moveLeft" :disabled="isFirstColumn">←</button>
      <button class="action-btn" type="button" @click.stop="moveRight" :disabled="isLastColumn">→</button>
    </div>
  </article>
</template>

<script setup>
import CardDescriptionEditor from './CardDescriptionEditor.vue';
import KanbanTimer from './KanbanTimer.vue';

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

const emit = defineEmits(['drag-start', 'drop-card', 'move-left', 'move-right', 'delete-card', 'update-card']);

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

function updateDescription(newDescription) {
  emit('update-card', props.card.id, { description: newDescription });
}

function addTimerToCard(timerData) {
  emit('update-card', props.card.id, timerData);
}

function handleTimerStart() {
  // Timer started event handling if needed
}

function handleTimerStop() {
  // Timer stopped event handling if needed
}

function handleTimerPause() {
  // Timer paused event handling if needed
}

function handleTimerResume() {
  // Timer resumed event handling if needed
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
</style>