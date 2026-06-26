import type { APIResponse } from './types';

export const formatWon = (amount: number) => `${amount.toLocaleString()}원`;

export const isAPIResponse = <T>(value: unknown): value is APIResponse<T> => {
  if (typeof value !== 'object' || value === null || !('status' in value)) return false;

  if (value.status === 'success') return 'data' in value;
  if (value.status === 'fail') return 'data' in value;
  if (value.status === 'error') return 'message' in value;

  return false;
};

export const formatDate = (date: string) => {
  const [year, month, day] = date.split('-');

  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
};

export const formatTime = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  const meridiem = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 || 12;

  if (minute === 0) return `${meridiem} ${hour12}시`;

  return `${meridiem} ${hour12}시 ${minute}분`;
};
