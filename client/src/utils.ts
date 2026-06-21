export const formatWon = (amount: number) => `${amount.toLocaleString()}원`;

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
