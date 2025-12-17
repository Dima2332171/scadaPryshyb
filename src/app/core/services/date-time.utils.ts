export function convertUtcToKyiv(
  utc: string | Date,
  format: 'full' | 'short' = 'full'
): string {
  if (!utc) return '-';

  let date: Date;
  if (typeof utc === 'string') {
    // Парсим строго как UTC
    const utcStr = utc.endsWith('Z') || utc.includes('+') ? utc : utc + 'Z';
    date = new Date(utcStr);
  } else {
    date = utc;
  }

  if (isNaN(date.getTime())) {
    console.warn('utcToKyiv: invalid date', utc);
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
      timeZone: 'Europe/Kyiv',
    }
    : {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/Kyiv',
    };

  // en-CA = YYYY-MM-DD, en-GB = DD/MM/YYYY, en-US = MM/DD/YYYY
  return new Intl.DateTimeFormat('en-CA', options).format(date).replace(', ', ' ');
}

export function convertKyivToUtc(kyiv: string, hasTime: boolean = true): string {
  if (!kyiv) return '-';
  try {
    // Создаем Date в локальном времени Киева
    const kyivDate = new Date(
      new Date(kyiv + (hasTime ? '' : ' 00:00')).toLocaleString('en-US', { timeZone: 'Europe/Kyiv' })
    );

    if (isNaN(kyivDate.getTime())) {
      console.warn('kyivToUtc: invalid date', kyiv);
      return '-';
    }

    return kyivDate.toISOString().split('.')[0] + 'Z';
  } catch (e) {
    console.warn('kyivToUtc error:', e, kyiv);
    return '-';
  }
}
