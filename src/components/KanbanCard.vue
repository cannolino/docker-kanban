<template>
  <article class="card" draggable="true" @dragstart="onDragStart" @dragover.prevent @drop.prevent="onDrop">
    <div class="card__heading">
      <h3>{{ card.title }}</h3>
      <button class="card__delete" type="button" @click.stop="deleteCard" aria-label="Delete task">×</button>
    </div>

    <p class="card__text">{{ card.description }}</p>

    <div class="card__controls">
      <button class="action-btn" type="button" @click.stop="moveLeft" :disabled="isFirstColumn">←</button>
      <button class="action-btn" type="button" @click.stop="moveRight" :disabled="isLastColumn">→</button>
    </div>
  </article>
</template>

<script setup>
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
});

const emit = defineEmits(['drag-start', 'drop-card', 'move-left', 'move-right', 'delete-card']);

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
