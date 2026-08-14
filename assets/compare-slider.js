export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getPointerClientX(event) {
  if (typeof event?.clientX === 'number') return event.clientX;
  if (Array.isArray(event?.touches) && event.touches.length > 0) return event.touches[0].clientX;
  if (Array.isArray(event?.changedTouches) && event.changedTouches.length > 0) return event.changedTouches[0].clientX;
  return 0;
}

export function getSplitPercentFromPointer(event, rect) {
  const x = clamp(getPointerClientX(event) - rect.left, 0, rect.width);
  return (x / rect.width) * 100;
}
