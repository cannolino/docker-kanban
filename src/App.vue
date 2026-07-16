<template>
  <div id="app">
    <nav>
      <router-link to="/">Kanban</router-link> |
      <router-link to="/about">About</router-link>
      <router-link to="/dashboard">Dashboard</router-link> |
    </nav>
    <router-view/>  <!-- This is where the matched component will be rendered -->
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<!-- <template>

  <div class="app-shell">
    <header class="header">
      <div>
        <h1 class="header__title">Minimal Kanban</h1>
        <p class="header__subtitle">A clean Vue 3 board with drag-and-drop, local storage persistence, and static nginx deployment.</p>
      </div>
    </header>

    <KanbanBoard />
  </div>
</template>

<script setup>
import KanbanBoard from './components/KanbanBoard.vue';
</script> -->
