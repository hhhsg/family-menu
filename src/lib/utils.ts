import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

export function isToday(dateStr: string): boolean {
  const today = new Date();
  const d = new Date(dateStr + 'T00:00:00');
  return d.toDateString() === today.toDateString();
}

export function isTomorrow(dateStr: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(dateStr + 'T00:00:00');
  return d.toDateString() === tomorrow.toDateString();
}

export function getDateLabel(dateStr: string): string {
  if (isToday(dateStr)) return `今天（${formatShortDate(dateStr)}）`;
  if (isTomorrow(dateStr)) return `明天（${formatShortDate(dateStr)}）`;
  return formatDate(dateStr);
}

export function formatShortDate(dateStr: string): string {
  const parts = dateStr.split('-');
  return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
}

export function getMealtimeTheme(hour: number): string {
  if (hour < 10) return 'from-amber-50 to-orange-50';
  if (hour < 14) return 'from-white to-blue-50';
  if (hour < 18) return 'from-orange-50 to-rose-50';
  return 'from-purple-50 to-indigo-50';
}

export function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
