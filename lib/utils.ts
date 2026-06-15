/**
 * Format number as Indian Rupee currency.
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return '₹0';
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return (value < 0 ? '-₹' : '₹') + formatted;
}

/**
 * Format ISO date string to readable format.
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get today's date as YYYY-MM-DD.
 */
export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get CSS class for trade type tag.
 */
export function getTagClass(type: string | undefined): string {
  if (!type) return 'tag-default';
  const t = type.toLowerCase();
  if (t.includes('intraday')) return 'tag-intraday';
  if (t.includes('swing')) return 'tag-swing';
  if (t.includes('positional') || t.includes('delivery')) return 'tag-positional';
  if (t.includes('options') || t.includes('f&o')) return 'tag-fno';
  return 'tag-default';
}

/**
 * Get Tailwind classes for trade type badge.
 */
export function getTagTailwind(type: string | undefined): string {
  if (!type) return 'bg-slate-700 text-slate-300';
  const t = type.toLowerCase();
  if (t.includes('intraday')) return 'bg-indigo-500/20 text-indigo-300';
  if (t.includes('swing')) return 'bg-amber-500/20 text-amber-300';
  if (t.includes('positional') || t.includes('delivery')) return 'bg-emerald-500/20 text-emerald-300';
  if (t.includes('options') || t.includes('f&o')) return 'bg-purple-500/20 text-purple-300';
  return 'bg-slate-700 text-slate-300';
}

/**
 * Escape HTML entities to prevent XSS.
 */
export function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate initials from a name.
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .substring(0, 2) || '??';
}
