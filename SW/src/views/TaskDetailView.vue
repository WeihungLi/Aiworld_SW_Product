<script setup lang="ts">
import { computed } from 'vue';
// 1. 導入 Store Hook
import { useTaskStore } from '../store';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// 2. 初始化 Store
const store = useTaskStore();

// 獲取當前任務 ID
const taskId = Number(route.params.id);

// 3. 使用 store (現在可以直接用 store.tasks, store.getTaskById 等)
const task = computed(() => store.getTaskById(taskId));
const engineer = computed(() => store.getEngineerById(task.value?.engineerId));

const handleBack = () => {
  router.push('/');
};

const handleStatusAction = () => {
  if (task.value) {
    store.handleTaskStatusChange(task.value);
  }
};
</script>

<template>
  <div v-if="task" class="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100">
    <!-- 標題區 -->
    <header class="mb-6 flex justify-between items-start">
      <div class="flex-1 min-w-0 pr-4">
        <div class="flex items-center gap-3 mb-2 flex-wrap">
          <span class="px-2.5 py-1 rounded-md text-xs font-medium shrink-0"
            :class="{
              'bg-blue-100 text-blue-700': task.priority === 'Low',
              'bg-yellow-100 text-yellow-700': task.priority === 'Medium',
              'bg-red-100 text-red-700': task.priority === 'High'
            }">
            {{ task.priority }} Priority
          </span>
          <span class="text-slate-400 text-sm shrink-0">#{{ task.id }}</span>
        </div>
        <h1 class="text-2xl font-bold text-slate-800 break-words">{{ task.title }}</h1>
      </div>
      <button @click="handleBack" class="text-slate-400 hover:text-slate-600 shrink-0 p-1">
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>
    </header>

    <!-- 內容區 -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 text-slate-600">
        <i class="fa-solid fa-location-dot w-5 text-center text-slate-400 shrink-0"></i>
        <span class="break-all">{{ task.location }}</span>
      </div>

      <div class="flex items-center gap-3 text-slate-600">
        <i class="fa-regular fa-clock w-5 text-center text-slate-400 shrink-0"></i>
        <span>{{ new Date(task.createdAt).toLocaleString() }}</span>
      </div>

      <!-- 負責工程師 -->
      <div class="border-t border-slate-100 pt-6">
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Assigned Engineer</h3>
        <div v-if="engineer" class="flex items-center gap-4 bg-slate-50 p-4 rounded-lg overflow-hidden">
          <img :src="engineer.avatar" class="w-12 h-12 rounded-full bg-white border border-slate-200 shrink-0 object-cover">
          <div class="min-w-0 flex-1">
            <p class="font-bold text-slate-800 truncate">{{ engineer.name }}</p>
            <p class="text-xs text-slate-500 flex flex-wrap gap-2 mt-1">
              <span v-for="spec in engineer.specialties" :key="spec" class="bg-white px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                {{ spec }}
              </span>
            </p>
          </div>
        </div>
        <div v-else class="text-slate-400 italic bg-slate-50 p-4 rounded-lg text-sm">
          No engineer assigned yet.
        </div>
      </div>

      <!-- 操作按鈕 (根據權限顯示) -->
      <div v-if="store.currentUser" class="pt-6 mt-6 border-t border-slate-100">
        <button 
          @click="handleStatusAction"
          class="w-full py-3 rounded-lg font-bold text-white transition-colors shadow-sm active:scale-[0.99] transform"
          :class="store.currentUser.role === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'"
        >
          {{ store.currentUser.role === 'admin' ? 'Approve & Complete Task' : 'Submit for Approval' }}
        </button>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-12 text-slate-400">
    <p>Task not found.</p>
    <button @click="handleBack" class="mt-4 text-indigo-600 hover:underline">Go Home</button>
  </div>
</template>