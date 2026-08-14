import test from 'node:test';
import assert from 'node:assert/strict';

import {
  clamp,
  getPointerClientX,
  getSplitPercentFromPointer
} from '../assets/compare-slider.js';

test('clamp keeps values inside the valid range', () => {
  assert.equal(clamp(-10, 0, 100), 0);
  assert.equal(clamp(42, 0, 100), 42);
  assert.equal(clamp(150, 0, 100), 100);
});

test('touch events resolve to a valid X position for mobile drag', () => {
  const rect = { left: 80, width: 400 };

  const touchEvent = {
    touches: [{ clientX: 280 }]
  };

  assert.equal(getPointerClientX(touchEvent), 280);
  assert.equal(getSplitPercentFromPointer(touchEvent, rect), 50);
});

test('touch events clamp to the bounds of the comparator', () => {
  const rect = { left: 50, width: 200 };

  const touchEvent = {
    changedTouches: [{ clientX: 10 }]
  };

  assert.equal(getSplitPercentFromPointer(touchEvent, rect), 0);
});
