export const Typography = {
  display: { fontSize: 36, fontWeight: '700' as const, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.3 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodySm: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, letterSpacing: 0.2 },
  metric: { fontSize: 32, fontWeight: '700' as const, lineHeight: 38, letterSpacing: -0.5 },
  metricLg: { fontSize: 48, fontWeight: '700' as const, lineHeight: 52, letterSpacing: -1 },
} as const;
