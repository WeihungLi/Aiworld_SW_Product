<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '../store';
import type { Task, Engineer, Priority, TaskStats } from '../types';
import Header from '../components/Header.vue';
import EngineerList from '../components/EngineerList.vue';
import TaskBoard from '../components/TaskBoard.vue';
import NewTaskModal from '../components/NewTaskModal.vue';
import { ClipboardList, MapPin, Check, FileText } from 'lucide-vue-next';

const router = useRouter();
const store = useTaskStore();
const isModalOpen = ref(false);

// 檢查是否已登入
onMounted(() => {
  if (!store.currentUser) {
    router.push('/login');
  }
});

// Admin 視圖的計算屬性
const unassignedTasks = computed(() => store.tasks.filter(t => t.status === 'Pending' && !t.engineerId));
// Admin 看到所有進行中 + 待簽核
const activeTasks = computed(() => store.tasks.filter(t => t.status === 'In Progress' || t.status === 'Pending Approval'));

const stats = computed<TaskStats>(() => ({
  total: store.tasks.length,
  pending: store.tasks.filter(t => t.status === 'Pending').length,
  active: store.tasks.filter(t => t.status === 'In Progress' || t.status === 'Pending Approval').length,
  completed: store.tasks.filter(t => t.status === 'Completed').length
}));

// Engineer 視圖的計算屬性 (只看自己的)
const myTasks = computed(() => {
  if (!store.currentUser) return [];
  return store.tasks.filter(t => t.engineerId === store.currentUser?.id && t.status !== 'Completed');
});

// Actions
const handleAddTask = (data: any) => {
  store.addTask({ id: Date.now(), ...data, status: 'Pending', createdAt: new Date() });
  isModalOpen.value = false;
};

const handleAssign = (task: Task, eng: Engineer) => {
  task.engineerId = eng.id; task.status = 'In Progress';
  const e = store.engineers.find(e => e.id === eng.id);
  if (e) { e.status = 'Busy'; e.currentTaskId = task.id; }
};

const handleAction = (task: Task) => {
  // 統一使用 store 的邏輯處理狀態變更 (送審 or 核准)
  store.handleTaskStatusChange(task);
};

const handleUnassign = (task: Task) => {
  const e = store.engineers.find(e => e.id === task.engineerId);
  if (e) { e.status = 'Idle'; e.currentTaskId = undefined; }
  task.engineerId = undefined; task.status = 'Pending';
};
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header: 傳入統計數據 (如果是工程師，Header 內部可再做簡化，這裡先共用) -->
    <Header :stats="stats" @open-modal="isModalOpen = true" />

    <main class="flex-1 overflow-hidden bg-grey-lighten-4">
      
      <!-- =========================== -->
      <!-- SCENARIO A: Admin View      -->
      <!-- =========================== -->
      <div v-if="store.currentUser?.role === 'admin'" class="d-flex h-100">
        <EngineerList :engineers="store.engineers" :tasks="store.tasks" />
        
        <!-- 管理員看到完整的 TaskBoard，包含待簽核 -->
        <TaskBoard 
          :unassigned-tasks="unassignedTasks" 
          :active-tasks="activeTasks" 
          :engineers="store.engineers"
          @assign="handleAssign" 
          @unassign="handleUnassign" 
          @complete="handleAction" 
          @view="(t) => router.push(`/task/${t.id}`)" 
        />
      </div>

      <!-- =========================== -->
      <!-- SCENARIO B: Engineer View   -->
      <!-- =========================== -->
      <div v-else class="h-100 overflow-y-auto pa-6">
        <v-container class="max-width-800">
          <div class="d-flex align-center mb-6">
            <v-avatar color="primary" class="mr-4">
              <ClipboardList class="text-white" />
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold text-grey-darken-3">我的任務清單</div>
              <div class="text-body-2 text-grey">你好，{{ store.currentUser?.name }}，這是指派給你的工作。</div>
            </div>
          </div>

          <v-row>
            <v-col cols="12" v-for="task in myTasks" :key="task.id">
              <v-card border elevation="1" class="rounded-lg">
                <div class="d-flex flex-column flex-sm-row">
                  <!-- 左側狀態條 -->
                  <div 
                    class="d-flex align-center justify-center py-2 py-sm-0 px-sm-4 bg-grey-lighten-5 border-e-sm"
                    style="min-width: 120px;"
                  >
                    <v-chip 
                      :color="task.status === 'Pending Approval' ? 'warning' : 'primary'" 
                      label 
                      size="small" 
                      class="font-weight-bold"
                    >
                      {{ task.status === 'Pending Approval' ? '待簽核' : '進行中' }}
                    </v-chip>
                  </div>

                  <!-- 內容區 -->
                  <div class="flex-grow-1 pa-4">
                    <div class="d-flex justify-space-between align-start mb-2">
                      <div class="text-h6 font-weight-bold text-grey-darken-3">{{ task.title }}</div>
                      <v-chip size="x-small" :color="task.priority === 'High' ? 'error' : 'grey'" variant="outlined">
                        {{ task.priority }} Priority
                      </v-chip>
                    </div>

                    <div class="d-flex align-center text-body-2 text-grey-darken-1 mb-4">
                      <MapPin size="16" class="mr-2" /> {{ task.location }}
                    </div>

                    <div class="d-flex align-center gap-3">
                      <!-- 查看詳情按鈕 -->
                      <v-btn 
                        variant="outlined" 
                        color="primary" 
                        size="small" 
                        @click="router.push(`/task/${task.id}`)"
                      >
                        <template v-slot:prepend><FileText size="16" /></template>
                        查看詳情
                      </v-btn>

                      <!-- 完成按鈕 (送審) -->
                      <v-btn 
                        v-if="task.status === 'In Progress'"
                        color="success" 
                        variant="flat" 
                        size="small" 
                        @click="handleAction(task)"
                      >
                        <template v-slot:prepend><Check size="16" /></template>
                        完成任務 (送審)
                      </v-btn>
                      
                      <div v-if="task.status === 'Pending Approval'" class="text-caption text-warning d-flex align-center">
                        <span class="mr-1">⏳</span> 等待管理員核准中...
                      </div>
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- 無任務狀態 -->
            <v-col cols="12" v-if="myTasks.length === 0">
              <v-sheet class="pa-12 text-center rounded-lg border border-dashed bg-transparent">
                <div class="text-h6 text-grey">目前沒有指派給您的任務</div>
                <div class="text-caption text-grey-lighten-1">請等待管理員派工</div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-container>
      </div>

    </main>

    <!-- 只有 Admin 可以開新工單 -->
    <NewTaskModal 
      v-if="store.currentUser?.role === 'admin'"
      :is-open="isModalOpen" 
      @close="isModalOpen = false" 
      @create="handleAddTask" 
    />
  </div>
</template>

<style scoped>
.max-width-800 {
  max-width: 800px;
  margin: 0 auto;
}
</style>