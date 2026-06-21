export const colorPalette = {
  black: '#000',
  white: '#fff',

  'gray-50': '#fdfdfd',
  'gray-100': '#fafafa',
  'gray-200': '#e6e6e6',
  'gray-300': '#d4d4d4',
  'gray-400': '#8b95a1',
  'gray-500': '#6b7685',
  'gray-600': '#515c6b',
  'gray-700': '#3b4453',
  'gray-800': '#272e3b',
  'gray-900': '#181d27',
  'gray-950': '#0e1118',
} as const;

export const spacing = {
  4: '4px',
  6: '6px',
  8: '8px',
  10: '10px',
  12: '12px',
  14: '14px',
  16: '16px',
  24: '24px',
  32: '32px',
  45: '45px',
} as const;

export const radius = {
  s: '3px',
  m: '4px',
  l: '8px',
} as const;

export const fontSize = {
  s: '12px',
  m: '16px',
  l: '20px',
  xl: '26px',
  '2xl': '28px',
} as const;

export const fontWeight = {
  medium: '500',
  bold: '700',
} as const;

export const buttonSize = {
  s: {
    height: '24px',
    fontSize: fontSize.s,
    paddingX: spacing[8],
  },
  m: {
    height: '52px',
    fontSize: fontSize.m,
    paddingX: spacing[14],
  },
} as const;
