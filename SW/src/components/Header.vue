<script setup lang="ts">
import { useRouter } from 'vue-router';
import { LayoutDashboard, Plus, Settings } from 'lucide-vue-next';
import type { TaskStats } from '../types';

defineProps<{ stats: TaskStats }>();
const emit = defineEmits<{ (e: 'openModal'): void }>();
const router = useRouter();
</script>

<template>
  <v-app-bar elevation="1" color="surface" density="default" class="px-2">
    <!-- 左側：Logo -->
    <template v-slot:prepend>
      <div class="d-flex align-center mr-4">
        <v-avatar color="primary" class="mr-3" rounded="lg">
          <LayoutDashboard class="text-white" size="24" />
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold text-grey-darken-3" style="line-height: 1.2;">智慧派工系統</div>
          <div class="text-caption text-grey">Vuetify Edition</div>
        </div>
      </div>
    </template>

    <v-spacer></v-spacer>

    <!-- 右側：統計數據 (大螢幕顯示) -->
    <div class="d-none d-md-flex align-center mr-6 gap-4">
      <div class="text-center px-4 border-e">
        <div class="text-h6 font-weight-bold">{{ stats.pending }}</div>
        <div class="text-caption text-grey">待處理</div>
      </div>
      <div class="text-center px-4 border-e">
        <div class="text-h6 font-weight-bold text-primary">{{ stats.active }}</div>
        <div class="text-caption text-grey">進行中</div>
      </div>
      <div class="text-center px-4">
        <div class="text-h6 font-weight-bold text-success">{{ stats.completed }}</div>
        <div class="text-caption text-grey">已完成</div>
      </div>
    </div>

    <!-- 功能按鈕 -->
    <div class="d-flex align-center gap-2">
      <v-btn color="primary" variant="flat" prepend-icon="" @click="emit('openModal')">
        <template v-slot:prepend>
          <Plus size="18" />
        </template>
        新增工單
      </v-btn>

      <v-btn icon variant="text" color="grey-darken-1" @click="router.push('/settings')">
        <Settings size="24" />
      </v-btn>
    </div>
  </v-app-bar>
</template>