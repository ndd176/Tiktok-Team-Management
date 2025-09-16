import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Task {
  id: number;
  title: string;
  description: string;
  type: 'support' | 'media';
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo: {
    id: number;
    name: string;
  };
  shop?: any;
  channel?: any;
  dueDate: Date;
  createdAt: Date;
  progress: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  private nextId = 1;

  constructor() {
    // Initialize with empty array, will be populated by dashboard
    this.tasksSubject.next([]);
  }

  // Get current tasks
  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  // Get current tasks synchronously
  getCurrentTasks(): Task[] {
    return this.tasksSubject.value;
  }

  // Add new task
  addTask(taskData: Omit<Task, 'id' | 'createdAt' | 'progress' | 'status'>): Task {
    const newTask: Task = {
      ...taskData,
      id: this.nextId++,
      status: 'pending',
      progress: 0,
      createdAt: new Date()
    };

    const currentTasks = this.getCurrentTasks();
    const updatedTasks = [...currentTasks, newTask];
    this.tasksSubject.next(updatedTasks);

    return newTask;
  }

  // Update task
  updateTask(taskId: number, updates: Partial<Task>): Task | null {
    const currentTasks = this.getCurrentTasks();
    const taskIndex = currentTasks.findIndex(task => task.id === taskId);
    
    if (taskIndex === -1) {
      return null;
    }

    const updatedTask = { ...currentTasks[taskIndex], ...updates };
    const updatedTasks = [...currentTasks];
    updatedTasks[taskIndex] = updatedTask;
    
    this.tasksSubject.next(updatedTasks);
    return updatedTask;
  }

  // Delete task
  deleteTask(taskId: number): boolean {
    const currentTasks = this.getCurrentTasks();
    const filteredTasks = currentTasks.filter(task => task.id !== taskId);
    
    if (filteredTasks.length !== currentTasks.length) {
      this.tasksSubject.next(filteredTasks);
      return true;
    }
    
    return false;
  }

  // Set tasks (used by dashboard to populate initial data)
  setTasks(tasks: Task[]): void {
    // Update nextId to avoid conflicts
    this.nextId = Math.max(...tasks.map(t => t.id), 0) + 1;
    this.tasksSubject.next(tasks);
  }

  // Get tasks by user
  getTasksByUser(userId: number): Task[] {
    return this.getCurrentTasks().filter(task => task.assignedTo.id === userId);
  }

  // Get tasks by status
  getTasksByStatus(status: Task['status']): Task[] {
    return this.getCurrentTasks().filter(task => task.status === status);
  }

  // Get today's tasks
  getTodayTasks(): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.getCurrentTasks().filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= today && taskDate < tomorrow;
    });
  }

  // Get performance data for users
  getPerformanceData(users: any[]): any[] {
    const tasks = this.getCurrentTasks();
    
    return users.map(user => {
      const userTasks = tasks.filter(task => task.assignedTo.id === user.id);
      const completed = userTasks.filter(task => task.status === 'completed').length;
      const inProgress = userTasks.filter(task => task.status === 'in-progress').length;
      const pending = userTasks.filter(task => task.status === 'pending').length;
      const total = userTasks.length;
      
      return {
        userId: user.id,
        userName: user.name,
        tasksCompleted: completed,
        tasksInProgress: inProgress,
        tasksPending: pending,
        totalTasks: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        avgQuality: Number((Math.random() * 2 + 3).toFixed(1))
      };
    });
  }
}