<script setup lang="ts">
import { ClipboardList, MapPin, Activity, Check, User as UserIcon, ArrowRight } from 'lucide-vue-next';
import type { Task, Engineer, Priority } from '../types';

defineProps<{ unassignedTasks: Task[]; activeTasks: Task[]; engineers: Engineer[]; }>();
const emit = defineEmits<{ (e: 'assign', t: Task, eng: Engineer): void; (e: 'unassign', t: Task): void; (e: 'complete', t: Task): void; (e: 'view', t: Task): void; }>();

const getPriorityColor = (p: Priority) => {
  switch(p) {
    case 'High': return 'error';
    case 'Medium': return 'warning';
    case 'Low': return 'success';
    default: return 'grey';
  }
};
</script>

<template>
  <v-main class="bg-grey-lighten-4 h-200 pa-1">
    <v-container fluid class="h-100 d-flex flex-column">
      
      <!-- 待派工區 -->
      <div class="mb-8">
        <div class="d-flex align-center mb-4">
          <ClipboardList class="mr-2 text-grey-darken-1" size="24" />
          <h2 class="text-h6 font-weight-bold text-grey-darken-3">待派工單區</h2>
          <v-chip class="ml-2" size="small" variant="flat" color="grey-lighten-2">{{ unassignedTasks.length }}</v-chip>
        </div>

        <v-row>
          <v-col cols="12" md="6" lg="4" v-for="task in unassignedTasks" :key="task.id">
            <v-card elevation="0" border hover @click="emit('view', task)">
              <v-card-text>
                <div class="d-flex justify-space-between align-center mb-2 ">
                  <v-chip size="x-small" :color="getPriorityColor(task.priority)" variant="outlined" label>
                    {{ task.priority }}
                  </v-chip>
                  <v-btn icon size="x-small" variant="text" color="grey">
                    <ArrowRight size="16" />
                  </v-btn>
                </div>
                
                <div class="text-subtitle-1 font-weight-bold mb-1 text-truncate">{{ task.title }}</div>
                
                <div class="d-flex align-center text-caption text-grey mb-4">
                  <MapPin size="14" class="mr-1" />
                  {{ task.location }}
                </div>

                <v-divider class="mb-3"></v-divider>

                <div class="text-caption text-grey mb-2">指派給:</div>
                <div class="d-flex flex-wrap gap-2">
                  <v-chip 
                    v-for="eng in engineers.filter(e => e.status !== 'Offline')" 
                    :key="eng.id"
                    size="small"
                    pill
                    @click.stop="emit('assign', task, eng)"
                    class="cursor-pointer"
                  >
                    <v-avatar start>
                      <v-img :src="eng.avatar"></v-img>
                    </v-avatar>
                    {{ eng.name }}
                  </v-chip>

                  <div v-if="!engineers.some(e => e.status !== 'Offline')" class="text-caption text-error">
                    目前無空閒工程師
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" v-if="unassignedTasks.length === 0">
            <v-sheet class="pa-8 text-center border border-dashed rounded text-grey" color="transparent">
              目前沒有待派工單
            </v-sheet>
          </v-col>
        </v-row>
      </div>

      <!-- 進行中區 -->
      <div class="mt-8">
        <div class="d-flex align-center mb-4">
          <Activity class="mr-2 text-primary" size="24" />
          <h2 class="text-h6 font-weight-bold text-grey-darken-3">進行中工單</h2>
        </div>

        <v-row>
          <v-col cols="12" v-for="task in activeTasks" :key="task.id">
            <v-card elevation="0" border class="border-s-4 border-opacity-100" style="border-left-color: rgb(var(--v-theme-primary)) !important;" @click="emit('view', task)">
              <div class="d-flex align-center pa-4">
                <v-avatar color="blue-lighten-5" class="text-primary font-weight-bold rounded mr-4" size="48">
                  {{ task.id }}
                </v-avatar>
                
                <div class="flex-grow-1">
                  <div class="text-subtitle-1 font-weight-bold">{{ task.title }}</div>
                  <div class="d-flex align-center text-caption text-grey mt-1">
                    <span class="d-flex align-center mr-3"><MapPin size="14" class="mr-1" /> {{ task.location }}</span>
                    <v-chip size="x-small" color="grey-lighten-3" class="text-grey-darken-2">
                      <UserIcon size="12" class="mr-1" /> 
                      {{ engineers.find(e => e.id === task.engineerId)?.name }}
                    </v-chip>
                  </div>
                </div>

                <div class="d-flex align-center gap-2">
                  <v-btn size="small" variant="text" color="grey" @click.stop="emit('unassign', task)">
                    取消
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>
      
    </v-container>
  </v-main>
</template>