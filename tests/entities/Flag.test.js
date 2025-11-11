/**
 * Tests for Flag Entity
 * Validates flag behavior, animation, and collection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Flag } from '../../js/entities/Flag.js';

// Mock CONFIG
vi.mock('../../js/config.js', () => ({
  CONFIG: {
    FLAG: {
      SIZE: 24,
      BASE_POINTS: 100,
      PULSE_SPEED: 3,
      COLORS: {
        NORMAL: '#ffd700',
        BONUS: '#ff00ff',
        RARE: '#00ffff'
      }
    }
  }
}));

describe('Flag Entity', () => {
  let flag;

  beforeEach(() => {
    flag = new Flag(100, 100);
  });

  describe('Initialization', () => {
    it('should initialize at specified position', () => {
      const testFlag = new Flag(50, 75);

      expect(testFlag.x).toBe(50);
      expect(testFlag.y).toBe(75);
    });

    it('should have correct size', () => {
      expect(flag.width).toBe(24);
      expect(flag.height).toBe(24);
    });

    it('should default to normal type', () => {
      expect(flag.type).toBe('normal');
      expect(flag.color).toBe('#ffd700');
    });

    it('should support custom flag types', () => {
      const bonusFlag = new Flag(0, 0, 'bonus');

      expect(bonusFlag.type).toBe('bonus');
      expect(bonusFlag.color).toBe('#ff00ff');
    });

    it('should have base points value', () => {
      expect(flag.points).toBe(100);
    });

    it('should not be collected initially', () => {
      expect(flag.collected).toBe(false);
    });

    it('should initialize animation properties', () => {
      expect(flag.pulsePhase).toBeDefined();
      expect(flag.rotation).toBe(0);
      expect(flag.scale).toBe(1);
    });

    it('should randomize initial pulse phase', () => {
      const flag1 = new Flag(0, 0);
      const flag2 = new Flag(0, 0);

      // Random pulse phases should likely be different
      const phasesAreSame = flag1.pulsePhase === flag2.pulsePhase;
      // This test may occasionally fail due to randomness, but it's unlikely
      expect(phasesAreSame).toBe(false);
    });
  });

  describe('update - Animation', () => {
    it('should update pulse phase over time', () => {
      const initialPhase = flag.pulsePhase;

      flag.update(1);

      expect(flag.pulsePhase).toBeGreaterThan(initialPhase);
    });

    it('should update scale based on pulse', () => {
      flag.update(1);

      // Scale should be 1 ± 0.1 based on sine wave
      expect(flag.scale).toBeGreaterThanOrEqual(0.9);
      expect(flag.scale).toBeLessThanOrEqual(1.1);
    });

    it('should rotate over time', () => {
      const initialRotation = flag.rotation;

      flag.update(1);

      expect(flag.rotation).toBeGreaterThan(initialRotation);
    });

    it('should handle multiple update cycles', () => {
      for (let i = 0; i < 10; i++) {
        flag.update(0.1);
      }

      expect(flag.pulsePhase).toBeGreaterThan(1);
      expect(flag.rotation).toBeGreaterThan(1);
    });

    it('should have smooth animation progression', () => {
      const phases = [];

      for (let i = 0; i < 5; i++) {
        flag.update(0.1);
        phases.push(flag.pulsePhase);
      }

      // Each phase should be greater than the previous
      for (let i = 1; i < phases.length; i++) {
        expect(phases[i]).toBeGreaterThan(phases[i - 1]);
      }
    });
  });

  describe('getBounds - Collision Bounds', () => {
    it('should return bounding box', () => {
      const bounds = flag.getBounds();

      expect(bounds).toEqual({
        x: 100,
        y: 100,
        width: 24,
        height: 24
      });
    });

    it('should update with flag position', () => {
      flag.x = 200;
      flag.y = 150;

      const bounds = flag.getBounds();

      expect(bounds.x).toBe(200);
      expect(bounds.y).toBe(150);
    });
  });

  describe('getCenter - Center Position', () => {
    it('should return center coordinates', () => {
      const center = flag.getCenter();

      expect(center).toEqual({
        x: 112, // 100 + 24/2
        y: 112
      });
    });

    it('should update with flag position', () => {
      flag.x = 50;
      flag.y = 50;

      const center = flag.getCenter();

      expect(center.x).toBe(62);
      expect(center.y).toBe(62);
    });
  });

  describe('collect - Collection Logic', () => {
    it('should mark flag as collected', () => {
      flag.collect();

      expect(flag.collected).toBe(true);
    });

    it('should return points value', () => {
      const points = flag.collect();

      expect(points).toBe(100);
    });

    it('should not change points value after collection', () => {
      const points1 = flag.collect();
      const points2 = flag.collect();

      expect(points1).toBe(points2);
    });
  });

  describe('draw - Rendering', () => {
    let mockCtx;

    beforeEach(() => {
      mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        rotate: vi.fn(),
        scale: vi.fn(),
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        createRadialGradient: vi.fn(() => ({
          addColorStop: vi.fn()
        })),
        shadowBlur: 0,
        shadowColor: '',
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0,
        globalAlpha: 1
      };
    });

    it('should not draw when collected', () => {
      flag.collected = true;
      flag.draw(mockCtx);

      expect(mockCtx.save).not.toHaveBeenCalled();
    });

    it('should draw when not collected', () => {
      flag.draw(mockCtx);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should apply transformations', () => {
      flag.draw(mockCtx);

      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.rotate).toHaveBeenCalledWith(flag.rotation);
      expect(mockCtx.scale).toHaveBeenCalledWith(flag.scale, flag.scale);
    });

    it('should set glow effect', () => {
      flag.draw(mockCtx);

      expect(mockCtx.shadowBlur).toBe(20);
      expect(mockCtx.shadowColor).toBe('#ffd700');
    });

    it('should draw outer ring', () => {
      flag.draw(mockCtx);

      expect(mockCtx.arc).toHaveBeenCalled();
    });
  });

  describe('drawStar - Star Shape', () => {
    let mockCtx;

    beforeEach(() => {
      mockCtx = {
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        fill: vi.fn()
      };
    });

    it('should draw star with specified spikes', () => {
      flag.drawStar(mockCtx, 0, 0, 5, 20, 10);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.lineTo).toHaveBeenCalled();
    });

    it('should draw correct number of points', () => {
      flag.drawStar(mockCtx, 0, 0, 5, 20, 10);

      // 5 spikes = 10 lineTo calls (outer + inner for each spike)
      expect(mockCtx.lineTo.mock.calls.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Integration - Full Flag Lifecycle', () => {
    it('should animate until collection', () => {
      expect(flag.collected).toBe(false);

      // Animate for a while
      for (let i = 0; i < 10; i++) {
        flag.update(0.1);
      }

      expect(flag.rotation).toBeGreaterThan(0);
      expect(flag.scale).not.toBe(1);

      // Collect
      const points = flag.collect();

      expect(points).toBe(100);
      expect(flag.collected).toBe(true);
    });

    it('should handle different flag types', () => {
      const normalFlag = new Flag(0, 0, 'normal');
      const bonusFlag = new Flag(0, 0, 'bonus');
      const rareFlag = new Flag(0, 0, 'rare');

      expect(normalFlag.color).toBe('#ffd700');
      expect(bonusFlag.color).toBe('#ff00ff');
      expect(rareFlag.color).toBe('#00ffff');

      // All should be collectable
      expect(normalFlag.collect()).toBe(100);
      expect(bonusFlag.collect()).toBe(100);
      expect(rareFlag.collect()).toBe(100);
    });

    it('should maintain position throughout lifecycle', () => {
      const initialX = flag.x;
      const initialY = flag.y;

      flag.update(1);
      flag.update(1);
      flag.update(1);

      expect(flag.x).toBe(initialX);
      expect(flag.y).toBe(initialY);

      flag.collect();

      expect(flag.x).toBe(initialX);
      expect(flag.y).toBe(initialY);
    });
  });
});
