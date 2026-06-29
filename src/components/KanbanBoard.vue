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
import { reactive, ref, watch, provide } from 'vue';
import KanbanColumn from './KanbanColumn.vue';

const STORAGE_KEY = 'docker-kanban-state';

// Timer state
const activeTimers = ref({});
const timerInterval = ref(null);

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(date) {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function startTimer(cardId) {
  if (activeTimers.value[cardId]) return;

  const startTime = new Date();
  activeTimers.value[cardId] = {
    startTime: startTime.getTime(),
    startTimeFormatted: formatDate(startTime),
    elapsed: 0,
    running: true
  };

    // Start interval to update timer
  if (!timerInterval.value) {
    timerInterval.value = setInterval(() => {
      Object.keys(activeTimers.value).forEach(cardId => {
        if (activeTimers.value[cardId].running) {
          activeTimers.value[cardId].elapsed = Math.floor((Date.now() - activeTimers.value[cardId].startTime) / 1000);
        }
      });
    }, 1000);
  }
}

function stopTimer(cardId) {
  if (!activeTimers.value[cardId]) return;

  const timer = activeTimers.value[cardId];
  timer.running = false;
  timer.endTime = new Date();
  timer.endTimeFormatted = formatDate(timer.endTime);
  timer.duration = timer.elapsed;

  // Update card with timer data
  const inProgressColumn = state.columns.find(col => col.id === 'inprogress');
  if (inProgressColumn) {
    const card = inProgressColumn.cards.find(c => c.id === cardId);
    if (card) {
      card.timerData = {
        startTime: timer.startTime,
        startTimeFormatted: timer.startTimeFormatted,
        endTime: timer.endTime.getTime(),
        endTimeFormatted: timer.endTimeFormatted,
        duration: timer.duration,
        durationFormatted: formatTime(timer.duration)
      };
    }
  }

    // Clean up if no timers are running
  if (Object.values(activeTimers.value).every(t => !t.running)) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
}

function getTimerInfo(cardId) {
  const timer = activeTimers.value[cardId];
  if (!timer) return null;

  return {
    ...timer,
    formattedTime: formatTime(timer.elapsed)
  };
}

const defaultState = {
  columns: [
    {
      id: 'todo',
      title: 'To Do',
      color: '#eff6ff',
      cards: [
        {
          id: 'task-1',
          title: 'Plan the board layout',
          description: 'Define columns, cards, and drag behavior before implementation.',
        },
        {
          id: 'task-2',
          title: 'Capture work items',
          description: 'Add tasks, bugs, and improvements to the backlog column.',
        },
      ],
    },
    {
      id: 'inprogress',
      title: 'In Progress',
      color: '#eef2ff',
      cards: [
        {
          id: 'task-3',
          title: 'Develop Vue board',
          description: 'Build the drag-and-drop UI with local storage persistence.',
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: '#ecfdf5',
      cards: [
        {
          id: 'task-4',
          title: 'Launch with Docker',
          description: 'Serve the static app using nginx inside a container.',
        },
      ],
    },
  ],
};

function loadState() {
  if (typeof localStorage === 'undefined') {
    return JSON.parse(JSON.stringify(defaultState));
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState));
    const parsed = JSON.parse(raw);
    if (parsed?.columns && Array.isArray(parsed.columns)) {
      return parsed;
    }
  } catch {
    // ignore malformed data and fall back to defaults
  }

  return JSON.parse(JSON.stringify(defaultState));
}

const state = reactive(loadState());
const dragCard = ref(null);

// Provide timer functions to child components
provide('timerFunctions', {
  startTimer,
  stopTimer,
  getTimerInfo,
  activeTimers,
  timerInterval
});

watch(
  () => state.columns,
  () => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  { deep: true }
);

function getColumn(columnId) {
  return state.columns.find((item) => item.id === columnId);
}

function addCard(columnId, title, description) {
  const column = getColumn(columnId);
  if (!column || !title?.trim()) return;

  column.cards.unshift({
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    description: description?.trim() || 'Click edit to add a description',
  });
}

function deleteCard(columnId, cardId) {
  const column = getColumn(columnId);
  if (!column) return;
  const index = column.cards.findIndex((card) => card.id === cardId);
  if (index !== -1) column.cards.splice(index, 1);

    // Clean up timer if card is deleted
  if (activeTimers.value[cardId]) {
    delete activeTimers.value[cardId];
    if (Object.keys(activeTimers.value).length === 0 && timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  }
}

function updateCard(columnId, cardId, updates) {
  const column = getColumn(columnId);
  if (!column) return;
  const card = column.cards.find((item) => item.id === cardId);
  if (!card) return;
  Object.assign(card, updates);
}

function handleDragStart(cardId, fromColumnId) {
  dragCard.value = { cardId, fromColumnId };
}

function handleDrop(toColumnId, targetCardId = null) {
  if (!dragCard.value) return;

  const source = getColumn(dragCard.value.fromColumnId);
  const destination = getColumn(toColumnId);
  if (!source || !destination) return;

  const cardIndex = source.cards.findIndex((card) => card.id === dragCard.value.cardId);
  if (cardIndex === -1) return;

  const [card] = source.cards.splice(cardIndex, 1);
  const targetIndex = targetCardId
    ? destination.cards.findIndex((item) => item.id === targetCardId)
    : destination.cards.length;

  if (targetIndex === -1) {
    destination.cards.push(card);
  } else {
    destination.cards.splice(targetIndex, 0, card);
  }

  dragCard.value = null;
}

function moveCard(columnId, cardId, direction) {
  const currentColumnIndex = state.columns.findIndex((column) => column.id === columnId);
  const targetColumnIndex = direction === 'left' ? currentColumnIndex - 1 : currentColumnIndex + 1;
  if (targetColumnIndex < 0 || targetColumnIndex >= state.columns.length) return;

  const source = state.columns[currentColumnIndex];
  const destination = state.columns[targetColumnIndex];
  const cardIndex = source.cards.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) return;

  const [card] = source.cards.splice(cardIndex, 1);
  destination.cards.unshift(card);

  // Stop timer if card is moved out of In Progress
  if (source.id === 'inprogress' && activeTimers.value[cardId]) {
    stopTimer(cardId);
  }
}

function resetBoard() {
  localStorage.removeItem(STORAGE_KEY);
  state.columns = JSON.parse(JSON.stringify(defaultState.columns));
  activeTimers.value = {};
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
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
