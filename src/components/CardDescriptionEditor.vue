<template>
  <div class="card__description" v-if="!isEditingDescription">
    <p class="card__text" @click="startEditDescription">{{ description }}</p>
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
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  description: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update']);

const isEditingDescription = ref(false);
const editedDescription = ref('');

function startEditDescription() {
  isEditingDescription.value = true;
  editedDescription.value = props.description;
}

function saveDescription() {
  emit('update', editedDescription.value);
  isEditingDescription.value = false;
}

function cancelEditDescription() {
  isEditingDescription.value = false;
  editedDescription.value = '';
}
</script>

<style scoped>
.card__description {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.card__text {
  margin: 0;
  color: #475569;
  line-height: 1.6;
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
</style>