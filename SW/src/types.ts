export type Priority = 'High' | 'Medium' | 'Low';
// 新增 'Pending Approval' 狀態
export type TaskStatus = 'Pending' | 'In Progress' | 'Pending Approval' | 'Completed';
export type EngineerStatus = 'Idle' | 'Busy' | 'Offline';
export type UserRole = 'admin' | 'engineer';

// 新增使用者介面
export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Task {
  id: number;
  title: string;
  location: string;
  priority: Priority;
  status: TaskStatus;
  engineerId?: number;
  createdAt: Date;
}

export interface Engineer {
  id: number;
  name: string;
  avatar: string;
  status: EngineerStatus;
  specialties: string[];
  currentTaskId?: number;
}

export interface TaskStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
}