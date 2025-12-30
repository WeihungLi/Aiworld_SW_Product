<script setup lang="ts">
import { reactive } from 'vue';
import type { Priority } from '../types';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: 'close'): void; (e: 'create', d: any): void; }>();
const form = reactive({ title: '', location: '', priority: 'Medium' as Priority });

const submit = () => {
  if (!form.title) return;
  emit('create', { ...form });
  form.title = ''; form.location = '';
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
    <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
      <h3 class="text-xl font-bold mb-4">建立新工單</h3>
      <div class="space-y-4">
        <input v-model="form.title" class="w-full px-3 py-2 border rounded-lg" placeholder="任務標題">
        <input v-model="form.location" class="w-full px-3 py-2 border rounded-lg" placeholder="地點">
        <select v-model="form.priority" class="w-full px-3 py-2 border rounded-lg"><option>Low</option><option>Medium</option><option>High</option></select>
      </div>
      <div class="flex gap-3 mt-8">
        <button @click="emit('close')" class="flex-1 py-2 border rounded-lg">取消</button>
        <button @click="submit" class="flex-1 py-2 bg-blue-600 text-white rounded-lg">建立</button>
      </div>
    </div>
  </div>
</template>