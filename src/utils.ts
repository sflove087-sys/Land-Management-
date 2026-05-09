import { User, StatusFilter } from './types';

export function getDaysLeft(dateStr: string): number {
  const expire = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((expire.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getTimeRemaining(dateStr: string) {
  const total = Date.parse(dateStr) - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return {
    total,
    days,
    hours,
    minutes,
    seconds
  };
}

export function getStatus(daysLeft: number): 'active' | 'warning' | 'expired' {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'warning';
  return 'active';
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('bn-BD');
}

export function loadUsers(): User[] {
  const stored = localStorage.getItem('landManagementSystem');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse users from localStorage", e);
    }
  }
  return [];
}

export function saveUsers(users: User[]) {
  localStorage.setItem('landManagementSystem', JSON.stringify(users));
}
