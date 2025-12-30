<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '../store';
import { 
  ArrowLeft, Bell, Moon, LogOut, 
  Shield, ChevronRight, Mail, Smartphone 
} from 'lucide-vue-next';

const router = useRouter();
const store = useTaskStore();

// 設定狀態
const notifications = ref(true);
const emailAlerts = ref(false);
const darkMode = ref(false);
const twoFactor = ref(true);

const handleLogout = () => {
  if(confirm('確定要登出系統嗎？')) {
    store.logout();
    router.push('/login');
  }
};
</script>

<template>
  <v-main class="bg-grey-lighten-5 h-100">
    <v-app-bar flat color="white" border="b">
      <template v-slot:prepend>
        <v-btn icon @click="router.back()">
          <ArrowLeft size="20" class="text-grey-darken-2" />
        </v-btn>
      </template>
      <v-app-bar-title class="text-subtitle-1 font-weight-bold text-grey-darken-3">
        系統設定
      </v-app-bar-title>
    </v-app-bar>

    <v-container class="max-width-800 py-6">
      
      <!-- Profile Section: 動態顯示登入者資料 -->
      <v-card class="mb-6 rounded-lg" elevation="0" border v-if="store.currentUser">
        <v-card-text class="d-flex align-center pa-4">
          <v-avatar size="64" :color="store.currentUser.role === 'admin' ? 'blue-lighten-5' : 'orange-lighten-5'" class="mr-4 border">
            <v-img :src="store.currentUser.avatar" alt="User Avatar"></v-img>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold text-grey-darken-3">{{ store.currentUser.name }}</div>
            <div class="text-body-2 text-grey">{{ store.currentUser.email }}</div>
            <div class="d-flex mt-1">
              <v-chip size="x-small" :color="store.currentUser.role === 'admin' ? 'primary' : 'secondary'" label variant="flat" class="font-weight-bold">
                {{ store.currentUser.role === 'admin' ? '系統管理員' : '現場工程師' }}
              </v-chip>
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn variant="text" size="small" color="primary" class="font-weight-bold">
            編輯資料
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- ... 下方設定選項保持不變 (省略以節省篇幅) ... -->
       <!-- General Settings Group -->
      <div class="text-caption font-weight-bold text-grey-darken-1 mb-2 ml-1 text-uppercase ls-1">一般設定</div>
      <v-card class="mb-6 rounded-lg" elevation="0" border>
        <v-list lines="two" class="pa-0 rounded-lg">
          <v-list-item>
            <template v-slot:prepend><div class="mr-4 pa-2 bg-blue-lighten-5 rounded-circle"><Bell size="20" class="text-blue-darken-2" /></div></template>
            <v-list-item-title class="font-weight-medium">系統通知</v-list-item-title>
            <template v-slot:append><v-switch v-model="notifications" color="primary" hide-details density="compact"></v-switch></template>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <template v-slot:prepend><div class="mr-4 pa-2 bg-grey-lighten-3 rounded-circle"><Moon size="20" class="text-grey-darken-3" /></div></template>
            <v-list-item-title class="font-weight-medium">深色模式</v-list-item-title>
            <template v-slot:append><v-switch v-model="darkMode" color="primary" hide-details density="compact"></v-switch></template>
          </v-list-item>
        </v-list>
      </v-card>

      <v-btn block color="red-lighten-5" height="54" class="text-red-darken-1 font-weight-bold text-body-1" elevation="0" border @click="handleLogout">
        <template v-slot:prepend><LogOut size="20" class="mr-1" /></template>
        登出系統
      </v-btn>

    </v-container>
  </v-main>
</template>

<style scoped>
.max-width-800 { max-width: 800px; margin: 0 auto; }
</style>