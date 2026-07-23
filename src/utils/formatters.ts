import { MetricUnit } from '../types/van';

export function formatDimension(mm: number, unit: MetricUnit = 'mm'): string {
  if (unit === 'cm') {
    return `${(mm / 10).toFixed(1)} cm`;
  }
  if (unit === 'm') {
    return `${(mm / 1000).toFixed(3)} m`;
  }
  return `${Math.round(mm)} mm`;
}

export function formatCurrency(euro: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(euro);
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1)} kg`;
}
