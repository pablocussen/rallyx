/**
 * Tests for PowerUp Entity
 * Validates power-up behavior, animations, and types
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PowerUp } from '../../js/entities/PowerUp.js';

// Mock CONFIG
vi.mock('../../js/config.js', () => ({
  CONFIG: {
    POWERUP: {
      SIZE: 28,
      DURATION: 5000,
      TYPES: {
        SPEED: {
          color: '#ffdd00',
          duration: 5000
        },
        SHIELD: {
          color: '#00ff88',
          duration: 8000
        },
        SLOWTIME: {
          color: '#00aaff',
          duration: 6000
        },
        DOUBLEPOINTS: {
          color: '#ff00ff',
          duration: 10000
        },
        MAGNET: {
          color: '#ff6600',
          duration: 7000
        }
      }
    }
  }
}));

describe('PowerUp Entity', () => {
  let powerup;

  beforeEach(() => {
    powerup = new PowerUp(100, 100, 'speed');
  });

  describe('Initialization', () => {
    it('should initialize at specified position', () => {
      const testPowerup = new PowerUp(50, 75, 'shield');

      expect(testPowerup.x).toBe(50);
      expect(testPowerup.y).toBe(75);
    });

    it('should have correct size', () => {
      expect(powerup.width).toBe(28);
      expect(powerup.height).toBe(28);
    });

    it('should store power-up type', () => {
      expect(powerup.type).toBe('speed');
    });

    it('should load config for type', () => {
      const shield = new PowerUp(0, 0, 'shield');

      expect(shield.config).toBeDefined();
      expect(shield.config.color).toBe('#00ff88');
      expect(shield.config.duration).toBe(8000);
    });

    it('should set color from config', () => {
      expect(powerup.color).toBe('#ffdd00');
    });

    it('should set duration from config', () => {
      expect(powerup.duration).toBe(5000);
    });

    it('should not be collected initially', () => {
      expect(powerup.collected).toBe(false);
    });

    it('should initialize animation properties', () => {
      expect(powerup.pulsePhase).toBe(0);
      expect(powerup.rotation).toBe(0);
      expect(powerup.floatOffset).toBe(0);
    });

    it('should support all power-up types', () => {
      const speed = new PowerUp(0, 0, 'speed');
      const shield = new PowerUp(0, 0, 'shield');
      const slowTime = new PowerUp(0, 0, 'slowTime');
      const doublePoints = new PowerUp(0, 0, 'doublePoints');
      const magnet = new PowerUp(0, 0, 'magnet');

      expect(speed.type).toBe('speed');
      expect(shield.type).toBe('shield');
      expect(slowTime.type).toBe('slowTime');
      expect(doublePoints.type).toBe('doublePoints');
      expect(magnet.type).toBe('magnet');
    });
  });

  describe('update - Animation', () => {
    it('should update pulse phase over time', () => {
      const initialPhase = powerup.pulsePhase;

      powerup.update(1);

      expect(powerup.pulsePhase).toBeGreaterThan(initialPhase);
    });

    it('should update rotation over time', () => {
      const initialRotation = powerup.rotation;

      powerup.update(1);

      expect(powerup.rotation).toBeGreaterThan(initialRotation);
    });

    it('should update float offset based on sine wave', () => {
      powerup.update(1);

      // Float offset should be within -5 to +5
      expect(powerup.floatOffset).toBeGreaterThanOrEqual(-5);
      expect(powerup.floatOffset).toBeLessThanOrEqual(5);
    });

    it('should not update when collected', () => {
      powerup.collected = true;

      const initialPhase = powerup.pulsePhase;
      const initialRotation = powerup.rotation;

      powerup.update(1);

      expect(powerup.pulsePhase).toBe(initialPhase);
      expect(powerup.rotation).toBe(initialRotation);
    });

    it('should have smooth animation progression', () => {
      const rotations = [];

      for (let i = 0; i < 5; i++) {
        powerup.update(0.1);
        rotations.push(powerup.rotation);
      }

      // Each rotation should be greater than the previous
      for (let i = 1; i < rotations.length; i++) {
        expect(rotations[i]).toBeGreaterThan(rotations[i - 1]);
      }
    });

    it('should handle multiple update cycles', () => {
      for (let i = 0; i < 10; i++) {
        powerup.update(0.1);
      }

      expect(powerup.pulsePhase).toBeGreaterThan(2);
      expect(powerup.rotation).toBeGreaterThan(2);
    });
  });

  describe('getBounds - Collision Bounds', () => {
    it('should return bounding box', () => {
      const bounds = powerup.getBounds();

      expect(bounds).toEqual({
        x: 100,
        y: 100,
        width: 28,
        height: 28
      });
    });

    it('should update with powerup position', () => {
      powerup.x = 200;
      powerup.y = 150;

      const bounds = powerup.getBounds();

      expect(bounds.x).toBe(200);
      expect(bounds.y).toBe(150);
    });
  });

  describe('getCenter - Center Position', () => {
    it('should return center coordinates', () => {
      const center = powerup.getCenter();

      expect(center).toEqual({
        x: 114, // 100 + 28/2
        y: 114
      });
    });

    it('should update with powerup position', () => {
      powerup.x = 50;
      powerup.y = 50;

      const center = powerup.getCenter();

      expect(center.x).toBe(64);
      expect(center.y).toBe(64);
    });
  });

  describe('collect - Collection Logic', () => {
    it('should mark powerup as collected', () => {
      powerup.collect();

      expect(powerup.collected).toBe(true);
    });

    it('should return powerup data', () => {
      const data = powerup.collect();

      expect(data.type).toBe('speed');
      expect(data.duration).toBe(5000);
      expect(data.config).toBeDefined();
    });

    it('should return correct data for each type', () => {
      const shield = new PowerUp(0, 0, 'shield');
      const data = shield.collect();

      expect(data.type).toBe('shield');
      expect(data.duration).toBe(8000);
      expect(data.config.color).toBe('#00ff88');
    });

    it('should maintain collected state', () => {
      powerup.collect();
      powerup.collect();

      expect(powerup.collected).toBe(true);
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
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        quadraticCurveTo: vi.fn(),
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
      powerup.collected = true;
      powerup.draw(mockCtx);

      expect(mockCtx.save).not.toHaveBeenCalled();
    });

    it('should draw when not collected', () => {
      powerup.draw(mockCtx);

      expect(mockCtx.save).toHaveBeenCalled();
      expect(mockCtx.restore).toHaveBeenCalled();
    });

    it('should apply transformations', () => {
      powerup.draw(mockCtx);

      expect(mockCtx.translate).toHaveBeenCalled();
      expect(mockCtx.rotate).toHaveBeenCalledWith(powerup.rotation);
    });

    it('should set glow effect', () => {
      powerup.draw(mockCtx);

      expect(mockCtx.shadowBlur).toBe(25);
      expect(mockCtx.shadowColor).toBe('#ffdd00');
    });

    it('should draw pulsing ring', () => {
      powerup.draw(mockCtx);

      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });
  });

  describe('Draw Methods - Shape Rendering', () => {
    let mockCtx;

    beforeEach(() => {
      mockCtx = {
        beginPath: vi.fn(),
        closePath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        quadraticCurveTo: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 0
      };
    });

    it('should draw lightning for speed', () => {
      powerup.drawLightning(mockCtx);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should draw shield shape', () => {
      powerup.drawShield(mockCtx);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.quadraticCurveTo).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should draw clock for slowTime', () => {
      powerup.drawClock(mockCtx);

      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should draw star for doublePoints', () => {
      powerup.drawStar(mockCtx);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.closePath).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });

    it('should draw magnet shape', () => {
      powerup.drawMagnet(mockCtx);

      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('should draw circle for unknown type', () => {
      powerup.drawCircle(mockCtx);

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.arc).toHaveBeenCalled();
      expect(mockCtx.fill).toHaveBeenCalled();
    });
  });

  describe('Integration - Full PowerUp Lifecycle', () => {
    it('should animate until collection', () => {
      expect(powerup.collected).toBe(false);

      // Animate for a while
      for (let i = 0; i < 10; i++) {
        powerup.update(0.1);
      }

      expect(powerup.rotation).toBeGreaterThan(0);
      expect(powerup.pulsePhase).toBeGreaterThan(0);

      // Collect
      const data = powerup.collect();

      expect(data.type).toBe('speed');
      expect(data.duration).toBe(5000);
      expect(powerup.collected).toBe(true);

      // Should not update after collection
      const finalRotation = powerup.rotation;
      powerup.update(1);
      expect(powerup.rotation).toBe(finalRotation);
    });

    it('should handle all power-up types correctly', () => {
      const types = ['speed', 'shield', 'slowTime', 'doublePoints', 'magnet'];
      const durations = [5000, 8000, 6000, 10000, 7000];

      types.forEach((type, index) => {
        const p = new PowerUp(0, 0, type);

        expect(p.type).toBe(type);
        expect(p.duration).toBe(durations[index]);
        expect(p.config).toBeDefined();

        const data = p.collect();
        expect(data.type).toBe(type);
        expect(data.duration).toBe(durations[index]);
      });
    });

    it('should maintain position throughout lifecycle', () => {
      const initialX = powerup.x;
      const initialY = powerup.y;

      powerup.update(1);
      powerup.update(1);
      powerup.update(1);

      expect(powerup.x).toBe(initialX);
      expect(powerup.y).toBe(initialY);

      powerup.collect();

      expect(powerup.x).toBe(initialX);
      expect(powerup.y).toBe(initialY);
    });

    it('should have unique colors for each type', () => {
      const speed = new PowerUp(0, 0, 'speed');
      const shield = new PowerUp(0, 0, 'shield');
      const slowTime = new PowerUp(0, 0, 'slowTime');
      const doublePoints = new PowerUp(0, 0, 'doublePoints');
      const magnet = new PowerUp(0, 0, 'magnet');

      const colors = [
        speed.color,
        shield.color,
        slowTime.color,
        doublePoints.color,
        magnet.color
      ];

      // All colors should be unique
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(5);
    });
  });
});
