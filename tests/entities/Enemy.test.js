/**
 * Tests for Enemy Entity
 * Validates enemy AI, pathfinding, and behavior
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Enemy } from '../../js/entities/Enemy.js';

// Mock CONFIG
vi.mock('../../js/config.js', () => ({
  CONFIG: {
    ENEMY: {
      SIZE: 28,
      BASE_SPEED: 3,
      CHASE_SPEED: 4,
      CHASE_RANGE: 200,
      SMART_AI: true,
      UPDATE_PATH_INTERVAL: 500,
      COLORS: ['#ff4757', '#ff6348', '#ff7675', '#fd79a8']
    }
  }
}));

describe('Enemy Entity', () => {
  let enemy;
  let mockPlayer;

  beforeEach(() => {
    enemy = new Enemy(100, 100, 0);

    mockPlayer = {
      x: 300,
      y: 300,
      width: 32,
      height: 32
    };
  });

  describe('Initialization', () => {
    it('should initialize at specified position', () => {
      const testEnemy = new Enemy(50, 75, 0);

      expect(testEnemy.x).toBe(50);
      expect(testEnemy.y).toBe(75);
    });

    it('should have correct size', () => {
      expect(enemy.width).toBe(28);
      expect(enemy.height).toBe(28);
    });

    it('should initialize with patrol state', () => {
      expect(enemy.state).toBe('patrol');
    });

    it('should have random initial velocity', () => {
      expect(enemy.vx).toBeDefined();
      expect(enemy.vy).toBeDefined();
    });

    it('should have speed with randomization', () => {
      expect(enemy.speed).toBeGreaterThanOrEqual(3);
      expect(enemy.speed).toBeLessThan(5);
    });

    it('should support different enemy types', () => {
      const enemy1 = new Enemy(0, 0, 0);
      const enemy2 = new Enemy(0, 0, 1);

      expect(enemy1.type).toBe(0);
      expect(enemy2.type).toBe(1);
    });

    it('should assign color based on type', () => {
      const enemy0 = new Enemy(0, 0, 0);
      const enemy1 = new Enemy(0, 0, 1);

      expect(enemy0.color).toBe('#ff4757');
      expect(enemy1.color).toBe('#ff6348');
    });

    it('should initialize target position to current position', () => {
      expect(enemy.targetX).toBe(100);
      expect(enemy.targetY).toBe(100);
    });
  });

  describe('update - AI Behavior', () => {
    it('should patrol when player is far away', () => {
      mockPlayer.x = 500;
      mockPlayer.y = 500;

      enemy.update(1, mockPlayer, 800, 600);

      expect(enemy.state).toBe('patrol');
    });

    it('should chase when player is nearby', () => {
      mockPlayer.x = 150;
      mockPlayer.y = 150;

      enemy.update(1, mockPlayer, 800, 600);

      expect(enemy.state).toBe('chase');
    });

    it('should update target position in chase mode', () => {
      mockPlayer.x = 150;
      mockPlayer.y = 150;

      enemy.pathUpdateTimer = 600; // Force update

      enemy.update(1, mockPlayer, 800, 600);

      expect(enemy.targetX).toBe(150);
      expect(enemy.targetY).toBe(150);
    });

    it('should move toward player in chase mode', () => {
      mockPlayer.x = 150;
      mockPlayer.y = 100;

      const initialX = enemy.x;

      enemy.update(1, mockPlayer, 800, 600);

      expect(enemy.x).toBeGreaterThan(initialX);
    });

    it('should update path timer', () => {
      mockPlayer.x = 150;
      mockPlayer.y = 150;

      enemy.pathUpdateTimer = 0;

      enemy.update(0.1, mockPlayer, 800, 600);

      expect(enemy.pathUpdateTimer).toBeGreaterThan(0);
    });
  });

  describe('getBounds - Collision Bounds', () => {
    it('should return bounding box', () => {
      const bounds = enemy.getBounds();

      expect(bounds).toEqual({
        x: 100,
        y: 100,
        width: 28,
        height: 28
      });
    });

    it('should update with enemy position', () => {
      enemy.x = 200;
      enemy.y = 150;

      const bounds = enemy.getBounds();

      expect(bounds.x).toBe(200);
      expect(bounds.y).toBe(150);
    });
  });

  describe('getCenter - Center Position', () => {
    it('should return center coordinates', () => {
      const center = enemy.getCenter();

      expect(center).toEqual({
        x: 114, // 100 + 28/2
        y: 114
      });
    });

    it('should update with enemy position', () => {
      enemy.x = 50;
      enemy.y = 50;

      const center = enemy.getCenter();

      expect(center.x).toBe(64);
      expect(center.y).toBe(64);
    });
  });

  describe('Integration - AI Behavior Flow', () => {
    it('should transition from patrol to chase', () => {
      // Start far away
      mockPlayer.x = 500;
      mockPlayer.y = 500;

      enemy.update(1, mockPlayer, 800, 600);
      expect(enemy.state).toBe('patrol');

      // Player gets close
      mockPlayer.x = 150;
      mockPlayer.y = 150;

      enemy.update(1, mockPlayer, 800, 600);
      expect(enemy.state).toBe('chase');
    });

    it('should transition from chase to patrol', () => {
      // Start close
      mockPlayer.x = 150;
      mockPlayer.y = 150;

      enemy.update(1, mockPlayer, 800, 600);
      expect(enemy.state).toBe('chase');

      // Player moves away
      mockPlayer.x = 500;
      mockPlayer.y = 500;

      enemy.update(1, mockPlayer, 800, 600);
      expect(enemy.state).toBe('patrol');
    });

    it('should continuously update in chase mode', () => {
      mockPlayer.x = 150;
      mockPlayer.y = 150;

      for (let i = 0; i < 10; i++) {
        enemy.update(0.1, mockPlayer, 800, 600);
      }

      // Enemy should have moved toward player
      const dx = Math.abs(enemy.x - 150);
      const dy = Math.abs(enemy.y - 150);
      const initialDx = Math.abs(100 - 150);
      const initialDy = Math.abs(100 - 150);

      expect(dx).toBeLessThan(initialDx);
      expect(dy).toBeLessThan(initialDy);
    });
  });
});
