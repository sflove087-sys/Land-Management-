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

export function toBn(num: string | number): string {
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, d => bnNums[parseInt(d)]);
}

export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const csvContent = `\uFEFF${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
