export function pointOnGauge(angle: number, radius: number): { x: number; y: number } {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: 50 + radius * Math.cos(radians), y: 50 + radius * Math.sin(radians) };
}
export function gaugeArc(start: number, sweep: number, radius = 38): string {
  if (sweep <= 0) return '';
  const a = pointOnGauge(start, radius);
  const b = pointOnGauge(start + Math.min(359.999, sweep), radius);
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}
