/**
 * Tests for Player Entity
 * Validates physics, movement, health, power-ups, and collision
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Player } from '../../js/entities/Player.js';

// Mock CONFIG
vi.mock('../../js/config.js', () => ({
  CONFIG: {
    PLAYER: {
      SIZE: 32,
      BASE_SPEED: 5,
      MAX_SPEED: 12,
      ACCELERATION: 0.5,
      FRICTION: 0.9,
      MAX_HEALTH: 3,
      INVINCIBILITY_TIME: 2000,
      COLOR: '#00d4ff',
      TRAIL_COLOR: '#00d4ff'
    },
    PARTICLES: {
      TRAIL: {
        maxLength: 20,
        fadeSpeed: 0.05
      }
    },
    POWERUP: {
      TYPES: {
        SHIELD: {
          color: '#00ff88'
        }
      }
    }
  }
}));

describe('Player Entity', () => {
  let player;
  let mockInput;

  beforeEach(() => {
    player = new Player(100, 100);

    mockInput = {
      getMovement: vi.fn(() => ({ dx: 0, dy: 0 }))
    };
  });

  describe('Initialization', () => {
    it('should initialize at specified position', () => {
      const p = new Player(50, 75);

      expect(p.x).toBe(50);
      expect(p.y).toBe(75);
    });

    it('should have correct size', () => {
      expect(player.width).toBe(32);
      expect(player.height).toBe(32);
    });

    it('should start with zero velocity', () => {
      expect(player.vx).toBe(0);
      expect(player.vy).toBe(0);
    });

    it('should initialize with full health', () => {
      expect(player.health).toBe(3);
      expect(player.maxHealth).toBe(3);
    });

    it('should not be invincible initially', () => {
      expect(player.invincible).toBe(false);
      expect(player.invincibleTimer).toBe(0);
    });

    it('should have empty trail', () => {
      expect(player.trail).toEqual([]);
    });

    it('should initialize power-ups as inactive', () => {
      expect(player.powerups).toEqual({
        speed: false,
        shield: false,
        slowTime: false,
        doublePoints: false,
        magnet: false
      });
    });
  });

  describe('Movement - Physics', () => {
    it('should accelerate when input is provided', () => {
      mockInput.getMovement.mockReturnValue({ dx: 1, dy: 0 });

      player.update(1, mockInput, 800, 600);

      expect(player.vx).toBeGreaterThan(0);
    });

    it('should move in all four directions', () => {
      // Right
      mockInput.getMovement.mockReturnValue({ dx: 1, dy: 0 });
      player.update(1, mockInput, 800, 600);
      expect(player.vx).toBeGreaterThan(0);

      player = new Player(100, 100);

      // Down
      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 1 });
      player.update(1, mockInput, 800, 600);
      expect(player.vy).toBeGreaterThan(0);

      player = new Player(100, 100);

      // Left
      mockInput.getMovement.mockReturnValue({ dx: -1, dy: 0 });
      player.update(1, mockInput, 800, 600);
      expect(player.vx).toBeLessThan(0);

      player = new Player(100, 100);

      // Up
      mockInput.getMovement.mockReturnValue({ dx: 0, dy: -1 });
      player.update(1, mockInput, 800, 600);
      expect(player.vy).toBeLessThan(0);
    });

    it('should apply friction to velocity', () => {
      player.vx = 10;
      player.vy = 10;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      // Friction reduces velocity each frame (0.9 multiplier)
      expect(player.vx).toBeLessThan(10);
      expect(player.vy).toBeLessThan(10);
      expect(player.vx).toBeGreaterThan(0);
      expect(player.vy).toBeGreaterThan(0);
    });

    it('should limit max speed', () => {
      player.speed = 5;

      // Apply continuous acceleration
      mockInput.getMovement.mockReturnValue({ dx: 1, dy: 0 });

      for (let i = 0; i < 20; i++) {
        player.update(1, mockInput, 800, 600);
      }

      const speed = Math.sqrt(player.vx ** 2 + player.vy ** 2);
      expect(speed).toBeLessThanOrEqual(5);
    });

    it('should increase max speed with speed power-up', () => {
      player.powerups.speed = true;

      mockInput.getMovement.mockReturnValue({ dx: 1, dy: 0 });

      for (let i = 0; i < 30; i++) {
        player.update(1, mockInput, 800, 600);
      }

      const speed = Math.sqrt(player.vx ** 2 + player.vy ** 2);
      expect(speed).toBeGreaterThan(5);
      expect(speed).toBeLessThanOrEqual(12);
    });

    it('should update position based on velocity', () => {
      player.vx = 5;
      player.vy = 3;

      const initialX = player.x;
      const initialY = player.y;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      // Position changes based on velocity (with friction applied)
      expect(player.x).toBeGreaterThan(initialX);
      expect(player.y).toBeGreaterThan(initialY);
    });

    it('should calculate movement angle', () => {
      player.vx = 1;
      player.vy = 0;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.angle).toBeCloseTo(0, 1); // Moving right = 0 radians
    });

    it('should not update angle when stationary', () => {
      player.angle = Math.PI / 4;
      player.vx = 0;
      player.vy = 0;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.angle).toBe(Math.PI / 4); // Unchanged
    });
  });

  describe('Boundary Collision', () => {
    it('should stop at left boundary', () => {
      player.x = 5;
      player.vx = -10;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.x).toBe(0);
      // vx gets reset to 0 after collision, but friction is applied first
    });

    it('should stop at right boundary', () => {
      player.x = 790;
      player.vx = 10;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.x).toBe(768); // 800 - 32 (width)
    });

    it('should stop at top boundary', () => {
      player.y = 5;
      player.vy = -10;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.y).toBe(0);
      // vy gets reset to 0 after collision, but friction is applied first
    });

    it('should stop at bottom boundary', () => {
      player.y = 590;
      player.vy = 10;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.y).toBe(568); // 600 - 32 (height)
    });
  });

  describe('Trail System', () => {
    it('should create trail when moving', () => {
      player.vx = 5;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.trail.length).toBeGreaterThan(0);
    });

    it('should not create trail when stationary', () => {
      player.vx = 0;
      player.vy = 0;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.trail.length).toBe(0);
    });

    it('should limit trail length', () => {
      mockInput.getMovement.mockReturnValue({ dx: 1, dy: 0 });

      for (let i = 0; i < 50; i++) {
        player.update(1, mockInput, 800, 600);
      }

      expect(player.trail.length).toBeLessThanOrEqual(20);
    });

    it('should fade trail over time', () => {
      player.vx = 5;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      const initialAlpha = player.trail[0].alpha;

      for (let i = 0; i < 5; i++) {
        player.update(1, mockInput, 800, 600);
      }

      expect(player.trail[0].alpha).toBeLessThan(initialAlpha);
    });

    it('should remove faded trail points', () => {
      player.vx = 5;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      // Wait for trail to fully fade
      for (let i = 0; i < 20; i++) {
        player.update(1, mockInput, 800, 600);
      }

      // No movement = trail should eventually disappear
      player.vx = 0;
      for (let i = 0; i < 20; i++) {
        player.update(1, mockInput, 800, 600);
      }

      expect(player.trail.length).toBe(0);
    });
  });

  describe('Health and Damage', () => {
    it('should take damage when not protected', () => {
      const damaged = player.takeDamage();

      expect(damaged).toBe(true);
      expect(player.health).toBe(2);
    });

    it('should become invincible after taking damage', () => {
      player.takeDamage();

      expect(player.invincible).toBe(true);
      expect(player.invincibleTimer).toBe(2000);
    });

    it('should not take damage when invincible', () => {
      player.invincible = true;

      const damaged = player.takeDamage();

      expect(damaged).toBe(false);
      expect(player.health).toBe(3);
    });

    it('should not take damage with shield power-up', () => {
      player.powerups.shield = true;

      const damaged = player.takeDamage();

      expect(damaged).toBe(false);
      expect(player.health).toBe(3);
    });

    it('should decrease invincibility timer over time', () => {
      player.invincible = true;
      player.invincibleTimer = 2000;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.invincibleTimer).toBe(1000);
    });

    it('should remove invincibility when timer expires', () => {
      player.invincible = true;
      player.invincibleTimer = 500;

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.invincible).toBe(false);
    });

    it('should heal but not exceed max health', () => {
      player.health = 1;

      player.heal(5);

      expect(player.health).toBe(3); // Capped at maxHealth
    });

    it('should heal by specified amount', () => {
      player.health = 1;

      player.heal(1);

      expect(player.health).toBe(2);
    });
  });

  describe('Power-ups', () => {
    it('should activate power-up with timer', () => {
      player.activatePowerup('speed', 5000);

      expect(player.powerups.speed).toBe(true);
      expect(player.powerupTimers.speed).toBe(5000);
    });

    it('should decrease power-up timer over time', () => {
      player.activatePowerup('shield', 3000);

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.powerupTimers.shield).toBe(2000);
    });

    it('should deactivate power-up when timer expires', () => {
      player.activatePowerup('doublePoints', 500);

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.powerups.doublePoints).toBe(false);
      expect(player.powerupTimers.doublePoints).toBeUndefined();
    });

    it('should handle multiple active power-ups', () => {
      player.activatePowerup('speed', 5000);
      player.activatePowerup('shield', 3000);
      player.activatePowerup('magnet', 4000);

      expect(player.powerups.speed).toBe(true);
      expect(player.powerups.shield).toBe(true);
      expect(player.powerups.magnet).toBe(true);
    });

    it('should expire power-ups independently', () => {
      player.activatePowerup('speed', 2000);
      player.activatePowerup('shield', 500);

      mockInput.getMovement.mockReturnValue({ dx: 0, dy: 0 });
      player.update(1, mockInput, 800, 600);

      expect(player.powerups.shield).toBe(false); // Expired
      expect(player.powerups.speed).toBe(true); // Still active
    });
  });

  describe('reset - Player Reset', () => {
    it('should reset position', () => {
      player.x = 500;
      player.y = 300;

      player.reset(100, 100);

      expect(player.x).toBe(100);
      expect(player.y).toBe(100);
    });

    it('should reset velocity', () => {
      player.vx = 10;
      player.vy = -5;

      player.reset(0, 0);

      expect(player.vx).toBe(0);
      expect(player.vy).toBe(0);
    });

    it('should restore full health', () => {
      player.health = 1;

      player.reset(0, 0);

      expect(player.health).toBe(3);
    });

    it('should clear invincibility', () => {
      player.invincible = true;
      player.invincibleTimer = 1000;

      player.reset(0, 0);

      expect(player.invincible).toBe(false);
      expect(player.invincibleTimer).toBe(0);
    });

    it('should clear trail', () => {
      player.trail = [{ x: 0, y: 0, alpha: 1 }];

      player.reset(0, 0);

      expect(player.trail).toEqual([]);
    });

    it('should deactivate all power-ups', () => {
      player.powerups.speed = true;
      player.powerups.shield = true;
      player.powerupTimers.speed = 1000;

      player.reset(0, 0);

      expect(player.powerups.speed).toBe(false);
      expect(player.powerups.shield).toBe(false);
      expect(player.powerupTimers).toEqual({});
    });
  });

  describe('getBounds - Collision Bounds', () => {
    it('should return bounding box', () => {
      player.x = 50;
      player.y = 75;

      const bounds = player.getBounds();

      expect(bounds).toEqual({
        x: 50,
        y: 75,
        width: 32,
        height: 32
      });
    });

    it('should update with player position', () => {
      player.x = 100;
      player.y = 100;

      player.x = 200;
      player.y = 150;

      const bounds = player.getBounds();

      expect(bounds.x).toBe(200);
      expect(bounds.y).toBe(150);
    });
  });

  describe('getCenter - Center Position', () => {
    it('should return center coordinates', () => {
      player.x = 100;
      player.y = 100;

      const center = player.getCenter();

      expect(center).toEqual({
        x: 116, // 100 + 32/2
        y: 116
      });
    });

    it('should update with player position', () => {
      player.x = 50;
      player.y = 50;

      const center = player.getCenter();

      expect(center.x).toBe(66);
      expect(center.y).toBe(66);
    });
  });

  describe('Integration - Full Player Lifecycle', () => {
    it('should handle complete game session', () => {
      // Start game
      expect(player.health).toBe(3);
      expect(player.x).toBe(100);

      // Move player
      mockInput.getMovement.mockReturnValue({ dx: 1, dy: 0 });
      for (let i = 0; i < 10; i++) {
        player.update(0.1, mockInput, 800, 600);
      }

      expect(player.x).toBeGreaterThan(100);
      expect(player.trail.length).toBeGreaterThan(0);

      // Take damage
      player.takeDamage();
      expect(player.health).toBe(2);
      expect(player.invincible).toBe(true);

      // Collect power-up
      player.activatePowerup('shield', 3000);
      expect(player.powerups.shield).toBe(true);

      // Power-up expires
      for (let i = 0; i < 4; i++) {
        player.update(1, mockInput, 800, 600);
      }
      expect(player.powerups.shield).toBe(false);

      // Reset for new level
      player.reset(100, 100);
      expect(player.health).toBe(3);
      expect(player.invincible).toBe(false);
    });
  });
});
