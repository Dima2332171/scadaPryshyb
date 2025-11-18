export function convertUtcToKyiv(
  utc: string | Date,
  format: 'full' | 'short' = 'full'
): string {
  if (!utc) return '-';

  // ВАЖНО: Парсим как UTC!
  let date: Date;
  if (typeof utc === 'string') {
    // Добавляем Z, если нет — это заставляет Date парсить как UTC
    const utcStr = utc.endsWith('Z') || utc.includes('+') ? utc : utc + 'Z';
    date = new Date(utcStr);
  } else {
    date = utc;
  }

  if (isNaN(date.getTime())) {
    console.warn('UtcToKyiv: invalid date', utc);
    return '-';
  }

  const options: Intl.DateTimeFormatOptions = format === 'full'
    ? {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/Kyiv'
    }
    : {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/Kyiv'
    };

  return new Intl.DateTimeFormat('en-CA', options)  // ← en-CA даёт YYYY-MM-DD
    .format(date)
    .replace(/\//g, '-') // ← заменяем / на
    .replace(', ', ' ');// -
}
