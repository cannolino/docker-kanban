<template>
  <section class="column" :style="{ backgroundColor: column.color }" @dragover.prevent @drop.prevent="dropOnColumn">
    <header class="column__header">
      <div>
        <h2>{{ column.title }}</h2>
        <p>{{ column.cards.length }} cards</p>
      </div>
    </header>

    <div class="column__cards">
      <KanbanCard
        v-for="(card, index) in column.cards"
        :key="card.id"
        :card="card"
        :column-id="column.id"
        :index="index"
        :is-first-column="columnIndex === 0"
        :is-last-column="columnIndex === columnsCount - 1"
        @drag-start="emitDragStart"
        @drop-card="emitDropCard"
        @move-left="emitMove('left', card.id)"
        @move-right="emitMove('right', card.id)"
        @delete-card="emitDeleteCard"
      />
    </div>

    <form class="column__form" @submit.prevent="submitNewCard">
      <input
        v-model="newTask"
        type="text"
        placeholder="Add a new task"
        aria-label="New task title"
      />
      <button type="submit">Add card</button>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import KanbanCard from './KanbanCard.vue';

const props = defineProps({
  column: {
    type: Object,
    required: true,
  },
  columnIndex: {
    type: Number,
    required: true,
  },
  columnsCount: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['add-card', 'drag-start', 'drop-card', 'move-card', 'delete-card']);

const newTask = ref('');

function submitNewCard() {
  const trimmed = newTask.value.trim();
  if (!trimmed) return;

  emit('add-card', props.column.id, trimmed);
  newTask.value = '';
}

function emitDragStart(cardId) {
  emit('drag-start', cardId, props.column.id);
}

function emitDropCard(targetCardId) {
  emit('drop-card', props.column.id, targetCardId);
}

function dropOnColumn() {
  emit('drop-card', props.column.id, null);
}

function emitMove(direction, cardId) {
  emit('move-card', props.column.id, cardId, direction);
}

function emitDeleteCard(cardId) {
  emit('delete-card', props.column.id, cardId);
}
</script>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 420px;
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
  transition: transform 0.2s ease;
}

.column:hover {
  transform: translateY(-1px);
}

.column__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.column__header h2 {
  margin: 0;
  font-size: 1.15rem;
}

.column__header p {
  margin: 0;
  color: #334155;
  font-size: 0.95rem;
}

.column__cards {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.column__form {
  display: grid;
  gap: 10px;
}

.column__form input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(148, 163, 184, 0.45);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.9);
}

.column__form button {
  border: none;
  border-radius: 999px;
  padding: 12px 16px;
  font-weight: 600;
  background: #2563eb;
  color: white;
}

.column__form button:hover {
  background: #1d4ed8;
}
</style>
