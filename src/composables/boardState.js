import { reactive, watch, ref } from 'vue';

const STORAGE_KEY = 'docker-kanban-state';

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

export function useBoardState() {
  const state = reactive(loadState());
  const dragCard = ref(null);

  // Save state to local storage whenever it changes
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

    return { source, destination, card };
  }

  function resetBoard() {
    localStorage.removeItem(STORAGE_KEY);
    state.columns = JSON.parse(JSON.stringify(defaultState.columns));
  }

  return {
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
  };
}