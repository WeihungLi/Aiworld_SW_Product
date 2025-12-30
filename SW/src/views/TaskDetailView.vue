<script setup lang="ts">
import { computed } from 'vue';
import { useTaskStore, type Task } from '../store';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const store = useTaskStore();

// 獲取當前任務 ID
const taskId = Number(route.params.id);

// 使用 store 獲取資料
const task = computed(() => store.getTaskById(taskId));
const engineer = computed(() => store.getEngineerById(task.value?.engineerId));

// 導航動作
const handleBack = () => {
  router.push('/');
};

// 狀態變更動作 (工程師完成 / 管理員核准)
const handleStatusAction = () => {
  if (task.value) {
    store.handleTaskStatusChange(task.value);
  }
};

// 管理員指派任務 (新增功能)
const handleAssign = (engineerId: number) => {
  if (!task.value || !engineerId) return;
  
  // 更新任務狀態
  task.value.engineerId = engineerId;
  task.value.status = 'In Progress';
  
  // 更新工程師狀態 (模擬 Store 的邏輯)
  const eng = store.engineers.find(e => e.id === engineerId);
  if (eng) {
    eng.status = 'Busy';
    eng.currentTaskId = task.value.id;
  }
};

// 樣式輔助函式
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High': return 'error';
    case 'Medium': return 'orange';
    case 'Low': return 'success';
    default: return 'grey';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'success';
    case 'Pending Approval': return 'warning';
    case 'In Progress': return 'primary';
    default: return 'grey-lighten-1';
  }
};

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'Pending': '待指派',
    'In Progress': '進行中',
    'Pending Approval': '待簽核',
    'Completed': '已完成'
  };
  return map[status] || status;
};
</script>

<template>
  <v-container class="fill-height bg-grey-lighten-4 py-8" fluid>
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        
        <!-- 任務存在時顯示 -->
        <v-card v-if="task" class="rounded-xl overflow-visible" elevation="3">
          
          <!-- 頂部工具列 -->
          <v-toolbar color="white" density="comfortable" flat class="border-b px-2 rounded-t-xl">
            <v-btn icon @click="handleBack" color="grey-darken-1">
              <v-icon icon="fa-solid fa-arrow-left"></v-icon>
            </v-btn>
            <v-toolbar-title class="text-subtitle-1 font-weight-bold text-grey">
              任務詳情 #{{ task.id }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-chip :color="getStatusColor(task.status)" label size="small" class="font-weight-bold mr-2">
              {{ getStatusText(task.status) }}
            </v-chip>
          </v-toolbar>

          <v-card-text class="pa-6">
            <!-- 標題與優先級 -->
            <div class="d-flex align-start justify-space-between mb-4">
              <h1 class="text-h4 font-weight-bold text-grey-darken-3 text-wrap" style="line-height: 1.3;">
                {{ task.title }}
              </h1>
            </div>
            
            <div class="d-flex gap-2 mb-6">
              <v-chip :color="getPriorityColor(task.priority)" variant="outlined" size="small" class="font-weight-medium">
                {{ task.priority }} Priority
              </v-chip>
              <v-chip variant="outlined" color="grey" size="small">
                <v-icon start icon="fa-regular fa-clock" size="x-small"></v-icon>
                {{ new Date(task.createdAt).toLocaleString() }}
              </v-chip>
            </div>

            <!-- 地點資訊 -->
            <v-sheet color="grey-lighten-5" class="rounded-lg pa-4 mb-6 border border-dashed d-flex align-center">
              <v-avatar color="primary" variant="tonal" class="mr-4">
                <v-icon icon="fa-solid fa-location-dot"></v-icon>
              </v-avatar>
              <div>
                <div class="text-caption text-grey">維修地點</div>
                <div class="text-subtitle-1 font-weight-bold text-grey-darken-3">{{ task.location }}</div>
              </div>
            </v-sheet>

            <v-divider class="mb-6"></v-divider>

            <!-- 負責工程師區塊 (修正：與 Dashboard 資訊一致) -->
            <div class="d-flex justify-space-between align-center mb-3">
              <div class="text-subtitle-2 font-weight-bold text-grey text-uppercase ls-1">負責工程師</div>
              
              <!-- Admin 指派按鈕 (如果未結案) -->
              <v-menu v-if="store.currentUser?.role === 'admin' && task.status !== 'Completed'">
                <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" size="small" variant="text" color="primary" class="px-0">
                    {{ engineer ? '重新指派' : '指派工程師' }}
                    <v-icon end icon="fa-solid fa-chevron-down"></v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item 
                    v-for="eng in store.engineers" 
                    :key="eng.id" 
                    @click="handleAssign(eng.id)"
                    :disabled="eng.status !== 'Idle' && eng.id !== task.engineerId"
                  >
                    <template v-slot:prepend>
                      <v-badge dot inline :color="eng.status === 'Busy' ? 'error' : (eng.status === 'Idle' ? 'success' : 'grey')" class="mr-2"></v-badge>
                    </template>
                    <v-list-item-title>{{ eng.name }}</v-list-item-title>
                    <template v-slot:append v-if="eng.status === 'Busy'">
                       <span class="text-caption text-error">忙碌</span>
                    </template>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
            
            <v-card v-if="engineer" variant="outlined" class="rounded-lg border-opacity-50" :color="engineer.status === 'Busy' ? 'primary' : 'grey'">
              <v-list-item lines="two" class="py-3">
                <template v-slot:prepend>
                  <!-- 狀態燈號 (新增) -->
                  <v-badge
                    dot
                    location="bottom end"
                    :color="engineer.status === 'Busy' ? 'error' : (engineer.status === 'Idle' ? 'success' : 'grey')"
                    offset-x="3"
                    offset-y="3"
                  >
                    <v-avatar size="56" class="mr-3 border">
                      <v-img :src="engineer.avatar"></v-img>
                    </v-avatar>
                  </v-badge>
                </template>
                
                <v-list-item-title class="text-h6 font-weight-bold d-flex align-center flex-wrap gap-2">
                  {{ engineer.name }}
                  <!-- 狀態文字 (新增) -->
                  <v-chip 
                    size="x-small" 
                    :color="engineer.status === 'Busy' ? 'error' : (engineer.status === 'Idle' ? 'success' : 'grey')" 
                    label
                    variant="flat"
                  >
                    {{ engineer.status === 'Busy' ? '忙碌中' : (engineer.status === 'Idle' ? '閒置中' : '離線') }}
                  </v-chip>
                </v-list-item-title>
                
                <v-list-item-subtitle class="mt-2">
                  <v-chip 
                    v-for="spec in engineer.specialties" 
                    :key="spec" 
                    size="x-small" 
                    class="mr-1 mb-1" 
                    variant="tonal" 
                    color="grey-darken-2"
                  >
                    {{ spec }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
            </v-card>
            
            <!-- 未指派工程師 (改進顯示) -->
            <v-sheet v-else class="rounded-lg pa-6 text-center bg-grey-lighten-5 border border-dashed d-flex flex-column align-center justify-center">
              <v-avatar color="grey-lighten-2" class="mb-3" size="48">
                <v-icon icon="fa-solid fa-user-plus" color="white"></v-icon>
              </v-avatar>
              <div class="text-body-1 font-weight-bold text-grey-darken-1">尚未指派工程師</div>
              <div class="text-caption text-grey mt-1">
                {{ store.currentUser?.role === 'admin' ? '點擊上方按鈕進行派工' : '等待管理員指派' }}
              </div>
            </v-sheet>

          </v-card-text>

          <!-- 底部操作區 -->
          <v-card-actions class="pa-6 pt-0" v-if="store.currentUser">
            <template v-if="store.currentUser.role === 'engineer' && task.status === 'In Progress'">
              <v-btn 
                block 
                color="success" 
                size="x-large" 
                variant="flat" 
                class="rounded-lg font-weight-bold"
                @click="handleStatusAction"
              >
                <v-icon start icon="fa-solid fa-check-circle"></v-icon>
                任務完成 (送出簽核)
              </v-btn>
            </template>

            <template v-else-if="store.currentUser.role === 'admin' && task.status === 'Pending Approval'">
              <v-btn 
                block 
                color="primary" 
                size="x-large" 
                variant="flat" 
                class="rounded-lg font-weight-bold"
                @click="handleStatusAction"
              >
                <v-icon start icon="fa-solid fa-file-signature"></v-icon>
                核准並結案
              </v-btn>
            </template>
            
            <div v-else-if="task.status === 'Completed'" class="w-100 text-center text-success font-weight-bold py-2 bg-green-lighten-5 rounded-lg border-success border-thin">
              <v-icon icon="fa-solid fa-circle-check" class="mr-2"></v-icon>
              此任務已結案
            </div>
            
             <div v-else-if="task.status === 'Pending Approval' && store.currentUser.role === 'engineer'" class="w-100 text-center text-warning font-weight-bold py-2 bg-amber-lighten-5 rounded-lg border-warning border-thin">
              <v-icon icon="fa-solid fa-hourglass" class="mr-2"></v-icon>
              等待管理員審核中
            </div>
          </v-card-actions>
        </v-card>

        <!-- 找不到任務時 -->
        <div v-else class="text-center mt-12">
          <v-icon icon="fa-regular fa-folder-open" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
          <div class="text-h6 text-grey mb-4">找不到此任務</div>
          <v-btn variant="outlined" color="primary" @click="handleBack">返回首頁</v-btn>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.gap-2 {
  gap: 8px;
}
.ls-1 {
  letter-spacing: 1px;
}
.border-dashed {
  border-style: dashed !important;
}
</style>