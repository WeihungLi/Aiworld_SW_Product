import { defineStore } from 'pinia';
import { ref } from 'vue';

// --- Type Definitions (整合至此檔案以確保無需額外檔案即可運作) ---
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'engineer';
  avatar: string;
}

export interface Engineer {
  id: number;
  name: string;
  avatar: string;
  status: 'Idle' | 'Busy' | 'Offline';
  specialties: string[];
  currentTaskId?: number;
}

export interface Task {
  id: number;
  title: string;
  location: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Pending Approval' | 'Completed';
  createdAt: Date;
  engineerId?: number;
}

export const useTaskStore = defineStore('task', () => {
  
  // --- Auth State ---
  const currentUser = ref<User | null>(null);

  // --- Data State ---
  const engineers = ref<Engineer[]>([
    { id: 101, name: '陳大文', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', status: 'Idle', specialties: ['水電', '空調'] },
    { id: 102, name: '林小美', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', status: 'Busy', specialties: ['網絡', '監視器'], currentTaskId: 2 },
    { id: 103, name: '張志明', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack', status: 'Offline', specialties: ['消防', '機電'] },
  ]);

  const tasks = ref<Task[]>([
    { id: 1, title: 'A棟 301 會議室冷氣不冷', location: 'A棟 3F', priority: 'High', status: 'Pending', createdAt: new Date() },
    { id: 2, title: 'B棟 Server 室網路斷線', location: 'B棟 B1', priority: 'High', status: 'In Progress', engineerId: 102, createdAt: new Date() },
    { id: 3, title: 'C棟 大廳燈泡更換', location: 'C棟 1F', priority: 'Low', status: 'Pending', createdAt: new Date() },
    { id: 4, title: '地下停車場閘門故障', location: '停車場入口', priority: 'Medium', status: 'Pending', createdAt: new Date() },
  ]);

  // --- Actions ---

  // 模擬登入
  function login(username: string): boolean {
    if (username === 'admin') {
      currentUser.value = { 
        id: 1, username: 'admin', name: '系統管理員', email: 'admin@company.com', role: 'admin', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' 
      };
      return true;
    } else if (username === 'ming') {
      // 模擬工程師登入 (對應 ID 101 陳大文)
      currentUser.value = { 
        id: 101, username: 'ming', name: '陳大文', email: 'ming@company.com', role: 'engineer', 
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' 
      };
      return true;
    }
    return false;
  }

  function logout() {
    currentUser.value = null;
  }

  function addTask(task: Task) {
    tasks.value.push(task);
  }

  function getEngineerById(id?: number) {
    return engineers.value.find(e => e.id === id);
  }

  function getTaskById(id: number) {
    return tasks.value.find(t => t.id === id);
  }

  // 處理任務完成/簽核邏輯
  function handleTaskStatusChange(task: Task) {
    if (!currentUser.value) return;

    if (currentUser.value.role === 'engineer') {
      // 工程師點擊 -> 送出簽核
      task.status = 'Pending Approval';
    } else if (currentUser.value.role === 'admin') {
      // 管理員點擊 -> 核准完成
      task.status = 'Completed';
      
      // 釋放工程師
      if (task.engineerId) {
        const eng = engineers.value.find(e => e.id === task.engineerId);
        if (eng) {
          eng.status = 'Idle';
          eng.currentTaskId = undefined;
        }
      }
    }
  }

  return {
    currentUser,
    engineers,
    tasks,
    login,
    logout,
    addTask,
    getEngineerById,
    getTaskById,
    handleTaskStatusChange
  };
});