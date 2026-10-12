/**
 * Centralized design token constants.
 * Use these in components when Tailwind classes aren't sufficient (e.g., in React Flow node styles).
 * These values mirror tailwind.config.ts exactly.
 */

export const colors = {
  canvas: '#0B0E12',
  surfacePrimary: '#11161D',
  surfaceElevated: '#171E27',
  surfaceHover: '#1D2732',
  border: '#2A3441',
  borderSubtle: 'rgba(42, 52, 65, 0.4)',

  textPrimary: '#E8EDF5',
  textSecondary: '#A2ADBD',
  textMuted: '#737F90',

  accentBlue: '#5B8CFF',
  accentBlueDim: '#B2C5FF',
  accentEmerald: '#39D6A0',
  accentAmber: '#F4BD58',
  accentViolet: '#A78BFA',
  accentTeal: '#43C9D9',
  accentSlate: '#8190A5',
  accentUtil: '#9099A6',
  accentError: '#F07178',

  outline: '#8D909F',
  outlineVariant: '#434653',
} as const;

/**
 * Category → color mapping for graph nodes, badges, and legends.
 * Each category has a primary color and a background alpha variant.
 */
export const categoryColors = {
  entry_point: { color: '#5B8CFF', bg: 'rgba(91, 140, 255, 0.12)', border: 'rgba(91, 140, 255, 0.3)', label: 'ENTRY', badgeClass: 'badge-entry' },
  route: { color: '#39D6A0', bg: 'rgba(57, 214, 160, 0.12)', border: 'rgba(57, 214, 160, 0.3)', label: 'ROUTE', badgeClass: 'badge-route' },
  model: { color: '#F4BD58', bg: 'rgba(244, 189, 88, 0.12)', border: 'rgba(244, 189, 88, 0.3)', label: 'MODEL', badgeClass: 'badge-model' },
  component: { color: '#A78BFA', bg: 'rgba(167, 139, 250, 0.12)', border: 'rgba(167, 139, 250, 0.3)', label: 'COMPONENT', badgeClass: 'badge-component' },
  config: { color: '#8190A5', bg: 'rgba(129, 144, 165, 0.12)', border: 'rgba(129, 144, 165, 0.3)', label: 'CONFIG', badgeClass: 'badge-config' },
  utility: { color: '#9099A6', bg: 'rgba(144, 153, 166, 0.12)', border: 'rgba(144, 153, 166, 0.3)', label: 'UTIL', badgeClass: 'badge-utility' },
  test: { color: '#43C9D9', bg: 'rgba(67, 201, 217, 0.12)', border: 'rgba(67, 201, 217, 0.3)', label: 'TEST', badgeClass: 'badge-test' },
  unknown: { color: '#737F90', bg: 'rgba(115, 127, 144, 0.12)', border: 'rgba(115, 127, 144, 0.3)', label: 'UNKNOWN', badgeClass: 'badge-unknown' },
} as const;

export type CategoryColorKey = keyof typeof categoryColors;
