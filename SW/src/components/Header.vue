<script setup lang="ts">
import { useRouter } from 'vue-router';
import { LayoutDashboard, Plus, Settings, Users, CircleUser, LogOut } from 'lucide-vue-next';
import { useTaskStore, type Task, type Engineer } from '../store';
import type { TaskStats } from '../types';

defineProps<{ stats: TaskStats }>();

const emit = defineEmits<{ 
  (e: 'openModal'): void;
  (e: 'toggleDrawer'): void;
}>();

const router = useRouter();
const store = useTaskStore();

const handleLogout = () => {
  // 這裡可以加入 store 的登出邏輯
  router.push('/login');
};
</script>

<template>
  <v-app-bar elevation="1" color="surface" density="default" class="px-2" >
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

    <!-- 功能按鈕區 -->
    <div class="d-flex align-center gap-2">
      
      <!-- 只有管理員才顯示的操作 -->
      <template v-if="store.currentUser?.role === 'admin'">
        <v-btn color="primary" variant="flat" class="mr-1" @click="emit('openModal')">
          <template v-slot:prepend>
            <Plus size="18" />
          </template>
          新增工單
        </v-btn>

        <v-tooltip text="工程師列表" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn 
              icon 
              variant="text" 
              color="grey-darken-1" 
              v-bind="props"
              @click="emit('toggleDrawer')"
            >
              <Users size="24" />
            </v-btn>
          </template>
        </v-tooltip>
      </template>

      <v-btn icon variant="text" color="grey-darken-1" @click="router.push('/settings')">
        <Settings size="24" />
      </v-btn>

      <!-- 新增：使用者顯示與選單 -->
      <v-menu min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="ml-1">
            <v-avatar color="primary" variant="tonal" size="36">
              <span class="text-h6 font-weight-medium">{{ store.currentUser?.name?.charAt(0).toUpperCase() || 'U' }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-list-item class="px-4 pt-4 pb-2">
            <template v-slot:prepend>
               <v-avatar color="primary" variant="tonal" size="40" class="mr-2">
                 {{ store.currentUser?.name?.charAt(0).toUpperCase() }}
               </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold">{{ store.currentUser?.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ store.currentUser?.role === 'admin' ? '系統管理員' : '工程師' }}</v-list-item-subtitle>
          </v-list-item>
          
          <v-divider class="my-2"></v-divider>

          <v-list density="compact" nav>
            <v-list-item value="profile">
               <template v-slot:prepend><CircleUser size="18" class="mr-2"/></template>
               個人檔案
            </v-list-item>
            <v-list-item value="logout" color="error" @click="handleLogout">
               <template v-slot:prepend><LogOut size="18" class="mr-2"/></template>
               登出系統
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>

    </div>
  </v-app-bar>
</template>