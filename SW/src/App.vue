<script setup lang="ts">
// App.vue 負責提供 Vuetify 的根節點
</script>

<template>
  <!-- 所有的 Vuetify 應用程式都必須包裹在 v-app 中 -->
  <v-app class="bg-slate-50">
    <router-view></router-view>
  </v-app>
</template>

<style>
/* Reset some basic styles if needed */
html { overflow-y: auto; }
</style>