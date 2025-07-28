// Componentes de Branding - Meu Bolso
export { default as Logo } from './Logo';
export { default as LogoMark } from './LogoMark';
export { default as Branding } from './Branding';

// Tipos
export interface BrandingConfig {
  variant: 'full' | 'mark' | 'text';
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

// Constantes de cores da marca
export const BRAND_COLORS = {
  primary: {
    teal: '#14b8a6',
    cyan: '#0891b2'
  },
  accent: {
    orange: '#f97316',
    blue: '#3b82f6'
  },
  gradient: {
    primary: 'from-teal-500 to-cyan-600',
    hover: 'from-teal-600 to-cyan-700',
    text: 'from-teal-500 to-cyan-600'
  }
} as const;
