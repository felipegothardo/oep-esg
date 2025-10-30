/**
 * Utilitários para formatação de datas no padrão brasileiro
 */

/**
 * Formata uma data para DD/MM/AA
 * @param date - Data em qualquer formato válido (Date, string YYYY-MM-DD, etc)
 * @returns String no formato DD/MM/AA
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

/**
 * Formata uma data para DD/MM/AAAA
 * @param date - Data em qualquer formato válido (Date, string YYYY-MM-DD, etc)
 * @returns String no formato DD/MM/AAAA
 */
export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formata uma string de mês (YYYY-MM ou MM/YYYY) para MM/AA
 * @param monthString - String no formato YYYY-MM ou MM/YYYY
 * @returns String no formato MM/AA
 */
export function formatMonthYear(monthString: string): string {
  if (!monthString) return '';
  
  // Se está no formato MM/YYYY
  if (monthString.includes('/')) {
    const [month, year] = monthString.split('/');
    return `${month}/${year.slice(-2)}`;
  }
  
  // Se está no formato YYYY-MM
  const [year, month] = monthString.split('-');
  return `${month}/${year.slice(-2)}`;
}

/**
 * Converte MM/YYYY para YYYY-MM
 * @param monthYear - String no formato MM/YYYY
 * @returns String no formato YYYY-MM
 */
export function convertToISO(monthYear: string): string {
  if (!monthYear) return '';
  const [month, year] = monthYear.split('/');
  return `${year}-${month}`;
}

/**
 * Converte YYYY-MM para MM/YYYY
 * @param isoMonth - String no formato YYYY-MM
 * @returns String no formato MM/YYYY
 */
export function convertFromISO(isoMonth: string): string {
  if (!isoMonth) return '';
  const [year, month] = isoMonth.split('-');
  return `${month}/${year}`;
}

/**
 * Valida se uma data está no formato DD/MM/AA ou DD/MM/AAAA
 * @param date - String de data
 * @returns true se válida
 */
export function isValidDateFormat(date: string): boolean {
  const regexShort = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{2}$/;
  const regexFull = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  return regexShort.test(date) || regexFull.test(date);
}

/**
 * Valida se um mês está no formato MM/AAAA
 * @param monthYear - String de mês/ano
 * @returns true se válido
 */
export function isValidMonthFormat(monthYear: string): boolean {
  const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(monthYear);
}
