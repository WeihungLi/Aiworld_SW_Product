<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore, type Task, type Engineer } from '../store';
import Header from '../components/Header.vue';
import EngineerList from '../components/EngineerList.vue';
import TaskBoard from '../components/TaskBoard.vue';
// 加入 PanelLeftClose, PanelLeftOpen 用於側邊欄切換
import { ClipboardList, MapPin, Check, FileText, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next';

const router = useRouter();
const store = useTaskStore();

// 頁籤控制
const adminTab = ref('active'); // active | completed
const engineerTab = ref('current'); // current | history

// 側邊欄控制 (預設顯示)
const showSidebar = ref(true);

// 檢查是否已登入
onMounted(() => {
  if (!store.currentUser) {
    router.push('/login');
  }
});

// --- Computed Properties ---

// 統計數據
const stats = computed(() => ({
  total: store.tasks.length,
  pending: store.tasks.filter(t => t.status === 'Pending').length,
  active: store.tasks.filter(t => t.status === 'In Progress').length,
  review: store.tasks.filter(t => t.status === 'Pending Approval').length,
  completed: store.tasks.filter(t => t.status === 'Completed').length
}));

// ===========================
// Engineer 視圖計算屬性
// ===========================
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

// ===========================
// Admin 視圖計算屬性
// ===========================
const unassignedTasks = computed(() => store.tasks.filter(t => t.status === 'Pending' && !t.engineerId));

// Admin: 待核准 (獨立分區)
const adminPendingApprovalTasks = computed(() => store.tasks.filter(t => t.status === 'Pending Approval'));

// Admin: 進行中 (排除待核准，避免重複顯示)
const adminInProgressTasks = computed(() => store.tasks.filter(t => t.status === 'In Progress'));

// Admin: 已完成
const allCompletedTasks = computed(() => {
  return store.tasks
    .filter(t => t.status === 'Completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
});

// --- Actions (支援多工邏輯) ---

const handleAssign = (task: Task, eng: Engineer) => {
  // 更新任務
  task.engineerId = eng.id; 
  task.status = 'In Progress';
  
  // 更新工程師狀態
  const e = store.engineers.find(e => e.id === eng.id);
  if (e) { 
    e.status = 'Busy'; 
    e.currentTaskId = task.id; 
  }
};

const handleUnassign = (task: Task) => {
  const oldEngineerId = task.engineerId;
  
  // 先解除任務指派
  task.engineerId = undefined; 
  task.status = 'Pending';

  // 智慧判斷：如果工程師還有其他任務，保持 Busy
  if (oldEngineerId) {
    const e = store.engineers.find(e => e.id === oldEngineerId);
    if (e) {
      const hasOtherTasks = store.tasks.some(t => t.engineerId === e.id && t.status === 'In Progress' && t.id !== task.id);
      if (!hasOtherTasks) {
        e.status = 'Idle';
        e.currentTaskId = undefined;
      } else {
        const other = store.tasks.find(t => t.engineerId === e.id && t.status === 'In Progress');
        if (other) e.currentTaskId = other.id;
      }
    }
  }
};

const handleAction = (task: Task) => {
  if (store.currentUser?.role === 'admin') {
    // 管理員核准
    task.status = 'Completed';
    
    // 檢查該工程師是否還有其他任務
    if (task.engineerId) {
      const e = store.engineers.find(e => e.id === task.engineerId);
      if (e) {
        const hasOtherTasks = store.tasks.some(t => t.engineerId === e.id && t.status === 'In Progress' && t.id !== task.id);
        if (!hasOtherTasks) {
          e.status = 'Idle';
          e.currentTaskId = undefined;
        } else {
          const other = store.tasks.find(t => t.engineerId === e.id && t.status === 'In Progress');
          if (other) e.currentTaskId = other.id;
        }
      }
    }
  } else {
    // 工程師送審
    store.handleTaskStatusChange(task);
  }
};
</script>

<template>
  <div class="h-screen d-flex flex-column bg-white overflow-hidden">
    <!-- Header -->
    <div class="flex-shrink-0">
      <Header :stats="stats" @open-modal="router.push('/create')" />
    </div>

    <main class="flex-grow-1 overflow-hidden d-flex flex-column">
      
      <!-- =========================== -->
      <!-- SCENARIO A: Admin View      -->
      <!-- =========================== -->
      <div v-if="store.currentUser?.role === 'admin'" class="d-flex flex-column h-100">
        
        <!-- Admin Tabs & Toggle Button -->
        <div class="bg-white border-b flex-shrink-0 d-flex align-center px-4 py-2">
          
          <!-- 側邊欄切換按鈕 (已優化：使用 Lucide 圖示) -->
          <v-btn 
            variant="outlined" 
            size="small" 
            color="primary" 
            class="mr-3"
            @click="showSidebar = !showSidebar"
          >
            <!-- 使用 template v-slot:prepend 放置圖示 -->
            <template v-slot:prepend>
                <PanelLeftClose v-if="showSidebar" :size="16" />
                <PanelLeftOpen v-else :size="16" />
            </template>
            {{ showSidebar ? '隱藏列表' : '顯示列表' }}
          </v-btn>

          <v-divider vertical class="mx-2 h-50"></v-divider>

          <v-tabs v-model="adminTab" color="primary" density="comfortable" class="ml-2">
            <v-tab value="active">當前任務看板</v-tab>
            <v-tab value="completed">已完成紀錄</v-tab>
          </v-tabs>
        </div>

        <!-- Tab Content: Active Board -->
        <div v-if="adminTab === 'active'" class="flex-grow-1 overflow-hidden">
            <v-row no-gutters class="fill-height flex-nowrap">
              
              <!-- Left Sidebar: Engineer List -->
              <!-- 使用 transition-width 類別與動態 width/opacity 實現滑動效果 -->
              <div 
                class="flex-shrink-0 border-e d-flex flex-column bg-white h-100 transition-width"
                :style="{ width: showSidebar ? '260px' : '0px', opacity: showSidebar ? 1 : 0 }"
                style="overflow: hidden;"
              >
                <!-- 內部固定寬度容器，防止內容擠壓 -->
                <div style="width: 260px;" class="h-100">
                   <EngineerList :engineers="store.engineers" :tasks="store.tasks" class="h-100" />
                </div>
              </div>
              
              <!-- Right Area: Pending Approval + Task Board -->
              <v-col class="flex-grow-1 overflow-hidden bg-white h-100" style="min-width: 0;">
                
                <!-- 動態置中容器 -->
                <div class="d-flex flex-column h-100 w-100 transition-all" 
                     :class="{'mx-auto': !showSidebar}" 
                     :style="!showSidebar ? 'max-width: 1400px;' : 'width: 100%;'">
                  
                  <!-- Admin: 待核准工單分區 -->
                  <div v-if="adminPendingApprovalTasks.length > 0" class="pa-4 bg-amber-lighten-5 border-b border-warning flex-shrink-0 overflow-y-auto" style="max-height: 250px;">
                    <div class="d-flex align-center text-subtitle-1 font-weight-bold text-warning-darken-2 mb-3">
                      <v-icon icon="fa-solid fa-bell" class="mr-2"></v-icon>
                      待核准工單 ({{ adminPendingApprovalTasks.length }}) - 請審核
                    </div>
                    
                    <v-row dense>
                      <v-col cols="12" md="6" lg="4" v-for="task in adminPendingApprovalTasks" :key="task.id">
                        <v-card border elevation="1" class="rounded-lg">
                          <div class="pa-3 d-flex flex-column h-100">
                            <div class="d-flex justify-space-between align-start mb-2">
                               <div class="font-weight-bold text-truncate text-grey-darken-3">{{ task.title }}</div>
                               <v-chip size="x-small" color="warning" label variant="flat">待簽核</v-chip>
                            </div>
                            
                            <div class="text-caption text-grey mb-3">
                              <div><v-icon icon="fa-solid fa-location-dot" size="10" class="mr-1"></v-icon>{{ task.location }}</div>
                              <div><v-icon icon="fa-solid fa-user-check" size="10" class="mr-1"></v-icon>完成者: {{ store.getEngineerById(task.engineerId)?.name }}</div>
                            </div>

                            <div class="mt-auto d-flex gap-2">
                              <v-btn size="small" variant="outlined" color="primary" class="flex-grow-1" @click="router.push(`/task/${task.id}`)">
                                查看
                              </v-btn>
                              <v-btn size="small" variant="flat" color="success" class="flex-grow-1" @click="handleAction(task)">
                                <v-icon start icon="fa-solid fa-check"></v-icon>核准
                              </v-btn>
                            </div>
                          </div>
                        </v-card>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Task Board (Main) -->
                  <div class="flex-grow-1 overflow-hidden">
                    <TaskBoard 
                      :unassigned-tasks="unassignedTasks" 
                      :active-tasks="adminInProgressTasks" 
                      :engineers="store.engineers"
                      @assign="handleAssign" 
                      @unassign="handleUnassign" 
                      @complete="handleAction" 
                      @view="(t) => router.push(`/task/${t.id}`)" 
                    />
                  </div>
                </div>
              </v-col>
            </v-row>
        </div>

        <!-- Tab Content: Completed List -->
        <div v-else class="flex-grow-1 overflow-y-auto pa-6">
          <v-container class="max-width-1000">
            <div class="text-h6 font-weight-bold mb-4">歷史完成工單</div>
            <v-data-table 
              :items="allCompletedTasks" 
              class="rounded-lg elevation-1"
            >
               <template v-slot:headers>
                 <tr>
                   <th class="text-left">ID</th>
                   <th class="text-left">標題</th>
                   <th class="text-left">地點</th>
                   <th class="text-left">負責人</th>
                   <th class="text-left">操作</th>
                 </tr>
               </template>
               <template v-slot:item="{ item }">
                 <tr>
                   <td>#{{ item.id }}</td>
                   <td class="font-weight-bold">{{ item.title }}</td>
                   <td>{{ item.location }}</td>
                   <td>{{ store.getEngineerById(item.engineerId)?.name || '-' }}</td>
                   <td>
                     <v-btn size="small" variant="text" color="primary" @click="router.push(`/task/${item.id}`)">
                       查看
                     </v-btn>
                   </td>
                 </tr>
               </template>
            </v-data-table>
          </v-container>
        </div>
      </div>

      <!-- =========================== -->
      <!-- SCENARIO B: Engineer View   -->
      <!-- =========================== -->
      <div v-else class="h-100 d-flex flex-column">
        
        <!-- Engineer Tabs -->
        <div class="bg-white border-b px-4 pt-2 flex-shrink-0">
          <div class="max-width-800 mx-auto">
             <div class="d-flex align-center mb-4 mt-2">
              <v-avatar color="primary" class="mr-4">
                <ClipboardList class="text-white" />
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold text-grey-darken-3">我的任務中心</div>
                <div class="text-body-2 text-grey">你好，{{ store.currentUser?.name }}。</div>
              </div>
            </div>

            <v-tabs v-model="engineerTab" color="primary" density="compact">
              <v-tab value="current">當前任務</v-tab>
              <v-tab value="history">歷史紀錄 (已完成)</v-tab>
            </v-tabs>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-grow-1 overflow-y-auto pa-4 pa-md-6">
          <v-container class="max-width-800 pa-0">
            
            <!-- Tab: 當前任務 -->
            <v-window v-model="engineerTab">
              <v-window-item value="current">
                
                <!-- 區塊 1: 待核准 (Pending Approval) -->
                <div v-if="myPendingApprovalTasks.length > 0" class="mb-8">
                  <div class="d-flex align-center text-subtitle-1 font-weight-bold text-warning mb-3">
                    <v-icon icon="fa-solid fa-hourglass-half" class="mr-2"></v-icon>
                    已完工，等待管理員核准 ({{ myPendingApprovalTasks.length }})
                  </div>
                  
                  <v-row>
                    <v-col cols="12" v-for="task in myPendingApprovalTasks" :key="task.id">
                      <v-card border elevation="0" class="rounded-lg bg-amber-lighten-5 border-warning border-opacity-50">
                        <div class="d-flex flex-column flex-sm-row">
                          <div class="pa-4 flex-grow-1">
                            <div class="d-flex justify-space-between align-start mb-2">
                              <div class="text-h6 font-weight-bold text-grey-darken-3">{{ task.title }}</div>
                              <v-chip size="small" color="warning" label>待簽核</v-chip>
                            </div>
                            <div class="d-flex align-center text-body-2 text-grey-darken-2 mb-2">
                              <MapPin :size="16" class="mr-2" /> {{ task.location }}
                            </div>
                            <div class="text-caption text-grey-darken-1">
                              已提交，請等待管理員確認結案。
                            </div>
                          </div>
                          <div class="pa-4 d-flex align-center border-s-sm border-warning border-opacity-25 bg-white">
                             <v-btn 
                                variant="outlined" 
                                color="grey-darken-1" 
                                size="small" 
                                @click="router.push(`/task/${task.id}`)"
                              >
                                查看詳情
                              </v-btn>
                          </div>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>
                </div>

                <!-- 區塊 2: 進行中 (In Progress) -->
                <div>
                  <div class="d-flex align-center text-subtitle-1 font-weight-bold text-primary mb-3">
                    <v-icon icon="fa-solid fa-person-digging" class="mr-2"></v-icon>
                    進行中的任務 ({{ myInProgressTasks.length }})
                  </div>

                  <v-row v-if="myInProgressTasks.length > 0">
                    <v-col cols="12" v-for="task in myInProgressTasks" :key="task.id">
                      <v-card border elevation="2" class="rounded-lg">
                        <div class="d-flex flex-column flex-sm-row">
                          <div class="d-flex align-center justify-center py-2 py-sm-0 px-sm-4 bg-blue-lighten-5 border-e-sm" style="min-width: 100px;">
                             <v-icon icon="fa-solid fa-wrench" color="primary"></v-icon>
                          </div>
                          <div class="flex-grow-1 pa-4">
                            <div class="d-flex justify-space-between align-start mb-2">
                              <div class="text-h6 font-weight-bold text-grey-darken-3">{{ task.title }}</div>
                              <v-chip size="x-small" :color="task.priority === 'High' ? 'error' : 'grey'" variant="outlined">
                                {{ task.priority }} Priority
                              </v-chip>
                            </div>
                            <div class="d-flex align-center text-body-2 text-grey-darken-1 mb-4">
                              <MapPin :size="16" class="mr-2" /> {{ task.location }}
                            </div>
                            <div class="d-flex align-center gap-3">
                              <v-btn variant="outlined" color="primary" size="small" @click="router.push(`/task/${task.id}`)">
                                <template v-slot:prepend><FileText :size="16" /></template> 查看
                              </v-btn>
                              <v-btn color="success" variant="flat" size="small" @click="handleAction(task)">
                                <template v-slot:prepend><Check :size="16" /></template> 完成 (送審)
                              </v-btn>
                            </div>
                          </div>
                        </div>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- 無進行中任務 -->
                  <v-sheet v-else class="pa-8 text-center rounded-lg border border-dashed bg-transparent mt-2">
                    <div class="text-h6 text-grey">目前沒有進行中的工作</div>
                    <div class="text-caption text-grey-lighten-1">若有新任務將顯示於此</div>
                  </v-sheet>
                </div>
              </v-window-item>

              <!-- Tab: 歷史紀錄 -->
              <v-window-item value="history">
                <div class="mb-4 text-subtitle-2 text-grey">顯示您已完成的工單紀錄</div>
                
                <v-row v-if="myCompletedTasks.length > 0">
                  <v-col cols="12" v-for="task in myCompletedTasks" :key="task.id">
                    <v-card border flat class="rounded-lg bg-grey-lighten-5">
                      <div class="pa-4 d-flex justify-space-between align-center">
                        <div>
                          <div class="text-subtitle-1 font-weight-bold text-grey-darken-1 text-decoration-line-through">
                            {{ task.title }}
                          </div>
                          <div class="text-caption text-grey">
                            {{ task.location }} • {{ new Date(task.createdAt).toLocaleDateString() }}
                          </div>
                        </div>
                        <v-chip color="success" size="small" variant="outlined">已結案</v-chip>
                      </div>
                      <v-divider></v-divider>
                      <div class="pa-2 text-right">
                          <v-btn size="small" variant="text" color="grey" @click="router.push(`/task/${task.id}`)">
                           回顧詳情
                          </v-btn>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
                
                <v-sheet v-else class="pa-12 text-center rounded-lg border border-dashed bg-transparent">
                  <v-icon icon="fa-solid fa-box-open" size="40" color="grey-lighten-2" class="mb-3"></v-icon>
                  <div class="text-body-1 text-grey">尚無歷史紀錄</div>
                </v-sheet>
              </v-window-item>
            </v-window>

          </v-container>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
.max-width-800 {
  max-width: 800px;
  margin: 0 auto;
}
.max-width-1000 {
  max-width: 1000px;
  margin: 0 auto;
}
.transition-width {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>