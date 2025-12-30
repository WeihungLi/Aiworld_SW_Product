<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '../store'; // 引入 Store
import { Wrench, Eye, EyeOff, LogIn } from 'lucide-vue-next';

const router = useRouter();
const store = useTaskStore();

const form = ref(false);
const loading = ref(false);
const showPassword = ref(false);
const errorMsg = ref('');
const showError = ref(false);

const username = ref('admin');
const password = ref('');

const rules = {
  required: (value: string) => !!value || '此欄位為必填',
  min: (v: string) => v.length >= 4 || '長度需至少 4 個字元',
};

const handleLogin = async () => {
  if (!form.value) return;

  loading.value = true;
  errorMsg.value = '';
  showError.value = false;

  setTimeout(() => {
    // 使用 Store 的 login action
    // 預設密碼都是 admin
    if (password.value === 'admin') {
      const success = store.login(username.value);
      if (success) {
        router.push('/');
        return;
      }
    }
    
    errorMsg.value = '帳號或密碼錯誤 (Admin: admin/admin, Engineer: ming/admin)';
    showError.value = true;
    loading.value = false;
  }, 1000);
};
</script>

<template>
  <v-container fluid class="fill-height login-background pa-0">
    <v-row no-gutters align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 rounded-xl" :loading="loading">
          <template v-slot:progress>
            <v-progress-linear color="primary" height="6" indeterminate></v-progress-linear>
          </template>

          <v-row no-gutters>
            <v-col cols="12" class="bg-primary d-flex flex-column align-center justify-center py-8">
              <v-avatar color="white" size="80" class="elevation-5 mb-4">
                <Wrench class="text-primary" size="40" />
              </v-avatar>
              <div class="text-h5 font-weight-bold text-white">智慧派工系統</div>
              <div class="text-subtitle-2 text-blue-lighten-4">Smart Dispatch Platform</div>
            </v-col>

            <v-col cols="12" class="pa-8 bg-white">
              <div class="text-h6 font-weight-bold text-grey-darken-3 mb-1">歡迎回來</div>
              <div class="text-body-2 text-grey mb-6">請輸入帳號資訊以登入</div>

              <v-expand-transition>
                <v-alert
                  v-if="showError"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4 text-caption"
                  closable
                  @click:close="showError = false"
                >
                  {{ errorMsg }}
                </v-alert>
              </v-expand-transition>

              <v-form v-model="form" @submit.prevent="handleLogin">
                <v-text-field
                  v-model="username"
                  :rules="[rules.required]"
                  label="帳號 (admin 或 ming)"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  prepend-inner-icon="mdi-account" 
                  class="mb-2"
                ></v-text-field>

                <v-text-field
                  v-model="password"
                  :rules="[rules.required, rules.min]"
                  :type="showPassword ? 'text' : 'password'"
                  label="密碼 (admin)"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock"
                  @click:append-inner="showPassword = !showPassword"
                >
                  <template v-slot:append-inner>
                    <component :is="showPassword ? EyeOff : Eye" size="20" class="text-grey cursor-pointer" @click="showPassword = !showPassword" />
                  </template>
                </v-text-field>

                <v-btn
                  block
                  color="primary"
                  size="large"
                  type="submit"
                  :disabled="!form || loading"
                  class="text-capitalize font-weight-bold rounded-lg mt-4"
                  elevation="2"
                >
                  <template v-slot:prepend><LogIn size="20" class="mr-1" /></template>
                  {{ loading ? '驗證中...' : '登入系統' }}
                </v-btn>
              </v-form>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-background {
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
}
</style>