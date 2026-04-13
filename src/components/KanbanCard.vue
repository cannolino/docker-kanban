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

    <div class="card__controls">
      <button class="action-btn" type="button" @click.stop="moveLeft" :disabled="isFirstColumn">←</button>
      <button class="action-btn" type="button" @click.stop="moveRight" :disabled="isLastColumn">→</button>
    </div>
  </article>
</template>

<script setup>
import { ref } from 'vue';

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

const emit = defineEmits(['drag-start', 'drop-card', 'move-left', 'move-right', 'delete-card', 'update-card']);

const isEditingDescription = ref(false);
const editedDescription = ref('');

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
</style>
