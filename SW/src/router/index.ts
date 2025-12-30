import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';
import SettingsView from '../views/SettingsView.vue';
import TaskDetailView from '../views/TaskDetailView.vue';
import CreateTaskView from '../views/CreateTaskView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'dashboard', component: DashboardView },
    { path: '/settings', name: 'settings', component: SettingsView },
    { path: '/create', name: 'create', component: CreateTaskView, props: true },
    { path: '/task/:id', name: 'task-detail', component: TaskDetailView, props: true }
  ]
});

export default router;
