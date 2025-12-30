<script setup lang="ts">
import { Users } from 'lucide-vue-next';
import type { Engineer, EngineerStatus, Task } from '../types';

defineProps<{ engineers: Engineer[]; tasks: Task[]; }>();

const getStatusColor = (s: EngineerStatus) => {
  switch(s) { case 'Idle': return 'success'; case 'Busy': return 'error'; case 'Offline': return 'grey'; }
};

const getStatusText = (s: EngineerStatus) => {
  switch(s) { case 'Idle': return '閒置'; case 'Busy': return '忙碌'; case 'Offline': return '離線'; }
};
</script>

<template>
  <v-navigation-drawer width="320" permanent border="e">
    <v-toolbar color="transparent" density="compact" title="工程師列表">
      <template v-slot:prepend>
        <Users class="ml-4 text-grey-darken-2" size="20" />
      </template>
    </v-toolbar>

    <v-list class="px-2 bg-grey-lighten-5 h-100">
      <v-card v-for="eng in engineers" :key="eng.id" class="mb-3" elevation="0" border>
        <v-card-text class="pa-3">
          <div class="d-flex align-center mb-2">
            <v-badge dot location="bottom right" :color="getStatusColor(eng.status)" offset-x="2" offset-y="2">
              <v-avatar size="40">
                <v-img :src="eng.avatar" alt="Avatar"></v-img>
              </v-avatar>
            </v-badge>
            
            <div class="ml-3 flex-grow-1">
              <div class="font-weight-medium text-body-2">{{ eng.name }}</div>
              <div class="text-caption text-grey">{{ eng.specialties.join(', ') }}</div>
            </div>

            <v-chip size="x-small" :color="getStatusColor(eng.status)" variant="tonal" class="font-weight-bold">
              {{ getStatusText(eng.status) }}
            </v-chip>
          </div>

          <!-- 當前任務 -->
          <v-sheet v-if="eng.currentTaskId" color="blue-lighten-5" rounded class="pa-2 border border-blue-lighten-4">
            <div class="text-caption font-weight-bold text-blue-darken-3 mb-1">正在執行:</div>
            <div class="text-caption text-blue-darken-2 text-truncate">
              {{ tasks.find(t => t.id === eng.currentTaskId)?.title }}
            </div>
          </v-sheet>
        </v-card-text>
      </v-card>
    </v-list>
  </v-navigation-drawer>
</template>