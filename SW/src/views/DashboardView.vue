<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore, type Task, type Engineer } from '../store';
import Header from '../components/Header.vue';
import EngineerList from '../components/EngineerList.vue';
import TaskBoard from '../components/TaskBoard.vue';
import { ClipboardList, MapPin, Check, FileText, Users, X, LayoutDashboard, History } from 'lucide-vue-next';

const router = useRouter();
const store = useTaskStore();

// 頁籤控制
const adminTab = ref('active'); // active | completed
const engineerTab = ref('current'); // current | history

// 側邊欄控制 (預設為 false = 隱藏)
const showDrawer = ref(false);

// 檢查是否已登入
onMounted(() => {
  if (!store.currentUser) {
    router.push('/login');
  }
});

// --- Computed Properties ---

const stats = computed(() => ({
  total: store.tasks.length,
  pending: store.tasks.filter(t => t.status === 'Pending').length,
  active: store.tasks.filter(t => t.status === 'In Progress').length,
  review: store.tasks.filter(t => t.status === 'Pending Approval').length,
  completed: store.tasks.filter(t => t.status === 'Completed').length
}));

const myInProgressTasks = computed(() => {
  if (!store.currentUser) return [];
  return store.tasks.filter(t => t.engineerId === store.currentUser?.id && t.status === 'In Progress');
});

const myPendingApprovalTasks = computed(() => {
  if (!store.currentUser) return [];
  return store.tasks.filter(t => t.engineerId === store.currentUser?.id && t.status === 'Pending Approval');
});

const myCompletedTasks = computed(() => {
  if (!store.currentUser) return [];
  return store.tasks
    .filter(t => t.engineerId === store.currentUser?.id && t.status === 'Completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

const unassignedTasks = computed(() => store.tasks.filter(t => t.status === 'Pending' && !t.engineerId));
const adminPendingApprovalTasks = computed(() => store.tasks.filter(t => t.status === 'Pending Approval'));
const adminInProgressTasks = computed(() => store.tasks.filter(t => t.status === 'In Progress'));
const allCompletedTasks = computed(() => {
  return store.tasks
    .filter(t => t.status === 'Completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// --- Actions ---

const handleAssign = (task: Task, eng: Engineer) => {
  task.engineerId = eng.id; 
  task.status = 'In Progress';
  const e = store.engineers.find(e => e.id === eng.id);
  if (e) { e.status = 'Busy'; e.currentTaskId = task.id; }
};

const handleUnassign = (task: Task) => {
  const oldEngineerId = task.engineerId;
  task.engineerId = undefined; 
  task.status = 'Pending';
  if (oldEngineerId) {
    const e = store.engineers.find(e => e.id === oldEngineerId);
    if (e) {
      const hasOtherTasks = store.tasks.some(t => t.engineerId === e.id && t.status === 'In Progress' && t.id !== task.id);
      if (!hasOtherTasks) { e.status = 'Idle'; e.currentTaskId = undefined; }
      else { const other = store.tasks.find(t => t.engineerId === e.id && t.status === 'In Progress'); if (other) e.currentTaskId = other.id; }
    }
  }
};

const handleAction = (task: Task) => {
  if (store.currentUser?.role === 'admin') {
    task.status = 'Completed';
    if (task.engineerId) {
      const e = store.engineers.find(e => e.id === task.engineerId);
      if (e) {
        const hasOtherTasks = store.tasks.some(t => t.engineerId === e.id && t.status === 'In Progress' && t.id !== task.id);
        if (!hasOtherTasks) { e.status = 'Idle'; e.currentTaskId = undefined; }
        else { const other = store.tasks.find(t => t.engineerId === e.id && t.status === 'In Progress'); if (other) e.currentTaskId = other.id; }
      }
    }
  } else {
    store.handleTaskStatusChange(task);
  }
};
</script>

<template>
  <div class="root-container">
    
    <!-- 1. Header: 監聽 @toggle-drawer 事件 -->
    <div class="header-section">
      <Header 
        :stats="stats" 
        @open-modal="router.push('/create')" 
        @toggle-drawer="showDrawer = !showDrawer"
      />
    </div>

    <!-- 2. 主要內容區 -->
    <div class="main-content-area">
      
      <!-- ADMIN VIEW -->
      <template v-if="store.currentUser?.role === 'admin'">
        
        <!-- Admin 工具列 -->
        <div class="admin-toolbar">
          <v-tabs v-model="adminTab" color="primary" density="compact" hide-slider>
            <v-tab value="active" class="text-capitalize" rounded="lg">
              <LayoutDashboard :size="16" class="mr-2"/> 看板監控
            </v-tab>
            <v-tab value="completed" class="text-capitalize" rounded="lg">
              <History :size="16" class="mr-2"/> 歷史紀錄
            </v-tab>
          </v-tabs>
        </div>

        <!-- 內容區塊 -->
        <div class="content-wrapper">
          
          <!-- TAB 1: 看板 (Active) -->
          <div v-if="adminTab === 'active'" class="tab-content active-board-layout">
            
            <!-- 看板容器：強制靠左並填滿高度 -->
            <div class="board-container">
              <!-- 待核准提醒 -->
              <div v-if="adminPendingApprovalTasks.length > 0" class="mb-4 w-100">
                <v-alert
                  type="warning"
                  variant="tonal"
                  density="compact"
                  border="start"
                  closable
                  title="待核准項目"
                >
                  目前有 <strong>{{ adminPendingApprovalTasks.length }}</strong> 筆工單等待您的確認。
                  <div class="d-flex overflow-x-auto mt-2 pb-2 gap-2">
                     <v-card v-for="task in adminPendingApprovalTasks" :key="task.id" width="280" flat border class="bg-surface">
                        <div class="pa-3">
                          <div class="font-weight-bold text-truncate">{{ task.title }}</div>
                          <div class="text-caption text-medium-emphasis mb-2">{{ store.getEngineerById(task.engineerId)?.name }}</div>
                          <v-btn size="small" color="success" block variant="tonal" @click="handleAction(task)">立即核准</v-btn>
                        </div>
                     </v-card>
                  </div>
                </v-alert>
              </div>

              <!-- TaskBoard -->
              <TaskBoard 
                :unassigned-tasks="unassignedTasks" 
                :active-tasks="adminInProgressTasks" 
                :engineers="store.engineers"
                @assign="handleAssign" 
                @unassign="handleUnassign" 
                @complete="handleAction" 
                @view="(t) => router.push(`/task/${t.id}`)" 
                class="w-100 h-100"
              />
            </div>

            <!-- Drawer (Engineer List) -->
            <div class="drawer-backdrop" v-if="showDrawer" @click="showDrawer = false"></div>
            
            <div class="drawer-panel" :class="{ 'drawer-open': showDrawer }">
              <div class="drawer-header">
                <div class="font-weight-bold d-flex align-center text-h6">
                  <Users :size="20" class="mr-2 text-primary" /> 工程師狀態
                </div>
                <v-btn icon="fa-solid fa-xmark" variant="text" density="compact" @click="showDrawer = false"></v-btn>
              </div>
              <div class="drawer-body">
                 <EngineerList :engineers="store.engineers" :tasks="store.tasks" />
              </div>
            </div>

          </div>

          <!-- TAB 2: 歷史紀錄 (Completed) -->
          <div v-else class="tab-content scrollable-padding">
             <v-data-table 
                :items="allCompletedTasks" 
                class="border rounded-lg"
                density="comfortable"
              >
                 <template v-slot:headers>
                   <tr class="bg-grey-lighten-4">
                     <th class="text-left font-weight-bold">ID</th>
                     <th class="text-left font-weight-bold">標題</th>
                     <th class="text-left font-weight-bold">地點</th>
                     <th class="text-left font-weight-bold">負責人</th>
                     <th class="text-left font-weight-bold">操作</th>
                   </tr>
                 </template>
                 <template v-slot:item="{ item }">
                   <tr>
                     <td>#{{ item.id }}</td>
                     <td class="font-weight-bold">{{ item.title }}</td>
                     <td>{{ item.location }}</td>
                     <td>{{ store.getEngineerById(item.engineerId)?.name || '-' }}</td>
                     <td>
                       <v-btn size="small" variant="text" color="primary" @click="router.push(`/task/${item.id}`)">查看</v-btn>
                     </td>
                   </tr>
                 </template>
              </v-data-table>
          </div>
        </div>
      </template>

      <!-- ENGINEER VIEW -->
      <template v-else>
         <div class="admin-toolbar justify-center">
            <v-tabs v-model="engineerTab" color="primary" density="compact" align-tabs="center">
              <v-tab value="current">當前任務</v-tab>
              <v-tab value="history">歷史紀錄</v-tab>
            </v-tabs>
         </div>
         <div class="content-wrapper scrollable-padding bg-grey-lighten-5">
           <v-container class="max-width-800 pa-0">
             <v-window v-model="engineerTab">
               <v-window-item value="current">
                  <div v-if="myInProgressTasks.length === 0 && myPendingApprovalTasks.length === 0" class="text-center pa-10 text-grey">
                    <div class="text-h5 mb-2">🎉 目前沒有任務</div>
                    <div>請等待管理員指派</div>
                  </div>
                  <div v-if="myPendingApprovalTasks.length > 0" class="mb-6">
                    <div class="text-subtitle-1 font-weight-bold text-warning mb-2">等待核准</div>
                    <v-card v-for="task in myPendingApprovalTasks" :key="task.id" class="mb-3 border-warning" variant="outlined">
                      <v-card-text>
                        <div class="text-h6">{{ task.title }}</div>
                        <div class="text-caption">{{ task.location }}</div>
                      </v-card-text>
                    </v-card>
                  </div>
                  <div v-if="myInProgressTasks.length > 0">
                    <div class="text-subtitle-1 font-weight-bold text-primary mb-2">進行中</div>
                    <v-card v-for="task in myInProgressTasks" :key="task.id" class="mb-3" elevation="2">
                       <v-card-text>
                          <div class="d-flex justify-space-between">
                            <div class="text-h6">{{ task.title }}</div>
                            <v-chip color="error" size="small" variant="flat">{{ task.priority }}</v-chip>
                          </div>
                          <div class="d-flex gap-2 mt-4">
                            <v-btn block color="primary" variant="outlined" @click="router.push(`/task/${task.id}`)">查看</v-btn>
                            <v-btn block color="success" @click="handleAction(task)">完成</v-btn>
                          </div>
                       </v-card-text>
                    </v-card>
                  </div>
               </v-window-item>
               <v-window-item value="history">
                  <v-card v-for="task in myCompletedTasks" :key="task.id" class="mb-2" flat border>
                    <v-card-text class="d-flex justify-space-between align-center">
                      <div>
                        <div class="text-decoration-line-through">{{ task.title }}</div>
                        <div class="text-caption">{{ new Date(task.createdAt).toLocaleDateString() }}</div>
                      </div>
                      <v-chip color="success" size="small">已結案</v-chip>
                    </v-card-text>
                  </v-card>
               </v-window-item>
             </v-window>
           </v-container>
         </div>
      </template>

    </div>
  </div>
</template>

<style scoped>
.root-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: white;
  overflow: hidden;
}

.header-section {
  flex-shrink: 0;
  z-index: 50;
}

.main-content-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.admin-toolbar {
  height: 50px;
  flex-shrink: 0;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: white;
  z-index: 40;
}

.content-wrapper {
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.tab-content {
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%; /* 確保內容佔滿 */
}

.active-board-layout {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; /* 防止 Flex 子元素溢出 */
}

.board-container {
  flex: 1;
  height: 100%;
  overflow: auto;
  padding: 16px;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 確保內容靠左 */
}

.scrollable-padding {
  overflow-y: auto;
  padding: 24px;
}

/* Drawer 樣式 */
.drawer-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 900;
  animation: fadeIn 0.2s ease;
}

.drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  background-color: white;
  z-index: 910;
  box-shadow: -4px 0 16px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.drawer-open {
  transform: translateX(0);
}

.drawer-header {
  height: 60px;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #fafafa;
}

.drawer-body {
  flex-grow: 1;
  overflow-y: auto;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.max-width-800 {
  max-width: 800px;
  margin: 0 auto;
}
</style>