<template>
  <section class="board">
    <div class="board__toolbar">
      <div>
        <p class="board__summary">Manage tasks with a lightweight Kanban flow. Drag cards between columns, add new tasks, and keep state in local storage.</p>
      </div>
      <button class="btn btn-secondary" type="button" @click="resetBoard">Reset board</button>
    </div>

    <div class="board-grid">
      <KanbanColumn
        v-for="(column, index) in state.columns"
        :key="column.id"
        :column="column"
        :column-index="index"
        :columns-count="state.columns.length"
        @add-card="addCard"
        @drag-start="handleDragStart"
        @drop-card="handleDrop"
        @move-card="moveCard"
        @delete-card="deleteCard"
        @update-card="updateCard"
      />
    </div>

    <div class="toast">Your board is saved automatically in local storage.</div>
  </section>
</template>

<script setup>
import { provide } from 'vue';
import KanbanColumn from './KanbanColumn.vue';
import { useBoardState } from '../composables/boardState';
import { createTimerService } from '../composables/timerService';

const {
  state,
  dragCard,
  getColumn,
  addCard,
  deleteCard,
  updateCard,
  handleDragStart,
  handleDrop,
  moveCard,
  resetBoard
} = useBoardState();

const timerService = createTimerService();
// Provide timer functions to child components
provide('timerFunctions', {
  ...timerService,
  // Add wrapper for stopTimer that also updates card data
  stopTimer: (cardId) => {
    const timerData = timerService.stopTimer(cardId);
    if (timerData) {
      const inProgressColumn = getColumn('inprogress');
      if (inProgressColumn) {
        const card = inProgressColumn.cards.find(c => c.id === cardId);
        if (card) {
          card.timerData = timerData;
        }
      }
    }
  }
});

function handleMoveCard(columnId, cardId, direction) {
  const { source, destination, card } = moveCard(columnId, cardId, direction);
  // Stop timer if card is moved out of In Progress
  if (source.id === 'inprogress' && timerService.activeTimers.value[cardId]) {
    timerService.stopTimer(cardId);
  }
}

function handleDeleteCard(columnId, cardId) {
  deleteCard(columnId, cardId);
  timerService.cleanupTimer(cardId);
}
</script>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.board__toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 20px 22px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 22px;
  box-shadow: 0 10px 35px rgba(15, 23, 42, 0.06);
}

.board__summary {
  margin: 0;
  color: #475569;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.toast {
  padding: 14px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: #475569;
  font-size: 0.95rem;
}

.btn {
  border: none;
  border-radius: 999px;
  padding: 11px 18px;
  font-weight: 600;
}

.btn-secondary {
  background: #1d4ed8;
  color: #ffffff;
  transition: background 0.2s ease;
}

.btn-secondary:hover {
  background: #1e40af;
}
</style>

