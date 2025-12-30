<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTaskStore } from '../store';

const router = useRouter();
const store = useTaskStore();

// 表單資料
const title = ref('');
const location = ref('');
const priority = ref<'High' | 'Medium' | 'Low'>('Medium');
const loading = ref(false);

const isValid = computed(() => {
  return title.value.trim() !== '' && location.value.trim() !== '';
});

// 建立任務
const handleSubmit = async () => {
  if (!isValid.value) return;
  
  loading.value = true;
  
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 500));
  
  store.addTask({
    id: Date.now(),
    title: title.value,
    location: location.value,
    priority: priority.value,
    status: 'Pending',
    createdAt: new Date()
  });
  
  loading.value = false;
  router.push('/'); // 返回 Dashboard
};

const handleCancel = () => {
  router.back();
};

// 選項設定
const priorityOptions = [
  { title: '高優先級 (High)', value: 'High', color: 'error', icon: 'fa-solid fa-circle-exclamation' },
  { title: '中優先級 (Medium)', value: 'Medium', color: 'orange', icon: 'fa-solid fa-circle' },
  { title: '低優先級 (Low)', value: 'Low', color: 'success', icon: 'fa-solid fa-circle-arrow-down' },
];
</script>

<template>
  <v-container class="fill-height bg-grey-lighten-4" fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        
        <v-card class="rounded-xl" elevation="3">
          <!-- 卡片標題 -->
          <v-toolbar color="white" flat class="border-b px-4">
            <v-toolbar-title class="font-weight-bold text-h6 text-grey-darken-3">
              新增維修工單
            </v-toolbar-title>
            <v-btn icon @click="handleCancel">
              <v-icon icon="fa-solid fa-xmark" color="grey"></v-icon>
            </v-btn>
          </v-toolbar>

          <v-card-text class="pa-6">
            <p class="text-body-2 text-grey mb-6">
              請填寫以下資訊以建立新的維修請求。建立後任務將進入待指派狀態。
            </p>

            <v-form @submit.prevent="handleSubmit">
              <!-- 標題欄位 -->
              <div class="mb-4">
                <label class="text-caption font-weight-bold text-grey-darken-1 mb-1 d-block">工單標題 *</label>
                <v-text-field
                  v-model="title"
                  placeholder="例如：會議室冷氣故障"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  bg-color="grey-lighten-5"
                  prepend-inner-icon="fa-solid fa-pen"
                ></v-text-field>
              </div>

              <!-- 地點欄位 -->
              <div class="mb-4">
                <label class="text-caption font-weight-bold text-grey-darken-1 mb-1 d-block">維修地點 *</label>
                <v-text-field
                  v-model="location"
                  placeholder="例如：A棟 3F 301室"
                  variant="outlined"
                  density="comfortable"
                  hide-details="auto"
                  bg-color="grey-lighten-5"
                  prepend-inner-icon="fa-solid fa-location-dot"
                ></v-text-field>
              </div>

              <!-- 優先級選擇 -->
              <div class="mb-6">
                <label class="text-caption font-weight-bold text-grey-darken-1 mb-1 d-block">優先級別</label>
                <v-item-group v-model="priority" mandatory>
                  <v-row dense>
                    <v-col cols="4" v-for="opt in priorityOptions" :key="opt.value">
                      <v-item v-slot="{ isSelected, toggle }" :value="opt.value">
                        <v-card
                          :color="isSelected ? opt.color : 'white'"
                          :variant="isSelected ? 'flat' : 'outlined'"
                          class="d-flex flex-column align-center justify-center pa-3 rounded-lg cursor-pointer transition-swing"
                          height="80"
                          @click="toggle"
                          :class="{'border-grey-lighten-2': !isSelected}"
                        >
                          <v-icon :icon="opt.icon" :color="isSelected ? 'white' : opt.color" class="mb-1"></v-icon>
                          <div class="text-caption font-weight-bold" :class="isSelected ? 'text-white' : 'text-grey-darken-1'">
                            {{ opt.value }}
                          </div>
                        </v-card>
                      </v-item>
                    </v-col>
                  </v-row>
                </v-item-group>
              </div>

              <!-- 底部按鈕 -->
              <div class="d-flex gap-3 mt-6">
                <v-btn
                  size="large"
                  variant="outlined"
                  color="grey"
                  class="flex-1-0"
                  @click="handleCancel"
                >
                  取消
                </v-btn>
                <v-btn
                  type="submit"
                  size="large"
                  color="primary"
                  variant="flat"
                  class="flex-1-0 font-weight-bold"
                  :loading="loading"
                  :disabled="!isValid"
                >
                  <v-icon start icon="fa-solid fa-paper-plane"></v-icon>
                  建立工單
                </v-btn>
              </div>

            </v-form>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.flex-1-0 {
  flex: 1 0 auto;
}
.gap-3 {
  gap: 12px;
}
</style>