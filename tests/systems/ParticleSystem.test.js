/**
 * Tests for Particle System
 * Validates particle lifecycle, emission, and special effects
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ParticleSystem } from '../../js/systems/ParticleSystem.js';

describe('ParticleSystem', () => {
  let particleSystem;

  beforeEach(() => {
    particleSystem = new ParticleSystem();
  });

  describe('Initialization', () => {
    it('should initialize with empty particle array', () => {
      expect(particleSystem.particles).toEqual([]);
      expect(particleSystem.getCount()).toBe(0);
    });

    it('should have max particles limit', () => {
      expect(particleSystem.maxParticles).toBe(500);
    });
  });

  describe('emit - Particle Emission', () => {
    it('should create particles at specified position', () => {
      particleSystem.emit(100, 200, { count: 5 });

      expect(particleSystem.getCount()).toBe(5);
    });

    it('should apply default configuration', () => {
      particleSystem.emit(50, 50, { count: 1 });

      const particle = particleSystem.particles[0];

      expect(particle.x).toBe(50);
      expect(particle.y).toBe(50);
      expect(particle.color).toBe('#ffffff');
      expect(particle.life).toBe(1);
      expect(particle.alpha).toBe(1);
    });

    it('should merge custom config with defaults', () => {
      particleSystem.emit(0, 0, {
        count: 1,
        color: '#ff0000',
        speed: 10,
        size: 8,
        life: 2
      });

      const particle = particleSystem.particles[0];

      expect(particle.color).toBe('#ff0000');
      expect(particle.size).toBeGreaterThan(4); // size 8 * (0.5-1.0 random)
      expect(particle.life).toBe(2);
      expect(particle.maxLife).toBe(2);
    });

    it('should randomize particle properties', () => {
      particleSystem.emit(0, 0, { count: 10, speed: 5 });

      const speeds = particleSystem.particles.map(p =>
        Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      );

      // Check that not all speeds are identical (randomized)
      const uniqueSpeeds = new Set(speeds.map(s => s.toFixed(2)));
      expect(uniqueSpeeds.size).toBeGreaterThan(1);
    });

    it('should spread particles based on spread angle', () => {
      particleSystem.emit(0, 0, {
        count: 20,
        spread: Math.PI // 180 degrees
      });

      const angles = particleSystem.particles.map(p =>
        Math.atan2(p.vy, p.vx)
      );

      // All angles should be within -PI/2 to PI/2
      angles.forEach(angle => {
        expect(angle).toBeGreaterThanOrEqual(-Math.PI / 2);
        expect(angle).toBeLessThanOrEqual(Math.PI / 2);
      });
    });

    it('should respect max particles limit', () => {
      particleSystem.maxParticles = 50;

      particleSystem.emit(0, 0, { count: 100 });

      expect(particleSystem.getCount()).toBe(50);
    });

    it('should not exceed max when adding multiple emissions', () => {
      particleSystem.maxParticles = 100;

      particleSystem.emit(0, 0, { count: 60 });
      particleSystem.emit(0, 0, { count: 60 });

      expect(particleSystem.getCount()).toBe(100);
    });
  });

  describe('update - Particle Lifecycle', () => {
    beforeEach(() => {
      particleSystem.emit(100, 100, {
        count: 5,
        life: 1,
        speed: 2,
        gravity: 0.1
      });
    });

    it('should update particle positions based on velocity', () => {
      const initialX = particleSystem.particles[0].x;
      const initialY = particleSystem.particles[0].y;
      const vx = particleSystem.particles[0].vx;
      const vy = particleSystem.particles[0].vy;

      particleSystem.update(0.1); // Use smaller deltaTime so particle doesn't die

      // Particle should still exist
      expect(particleSystem.particles.length).toBeGreaterThan(0);
      expect(particleSystem.particles[0].x).toBe(initialX + vx);
      expect(particleSystem.particles[0].y).toBeCloseTo(initialY + vy, 1);
    });

    it('should apply gravity to velocity', () => {
      const initialVy = particleSystem.particles[0].vy;
      const gravity = particleSystem.particles[0].gravity;

      particleSystem.update(0.1); // Use smaller deltaTime so particle doesn't die

      expect(particleSystem.particles.length).toBeGreaterThan(0);
      expect(particleSystem.particles[0].vy).toBe(initialVy + gravity);
    });

    it('should decrease particle life over time', () => {
      particleSystem.update(0.5);

      particleSystem.particles.forEach(p => {
        expect(p.life).toBe(0.5);
      });
    });

    it('should update alpha based on remaining life', () => {
      particleSystem.update(0.5); // life: 0.5 / maxLife: 1

      particleSystem.particles.forEach(p => {
        expect(p.alpha).toBeCloseTo(0.5, 1);
      });
    });

    it('should remove dead particles', () => {
      expect(particleSystem.getCount()).toBe(5);

      particleSystem.update(1.5); // life: 1, so 1.5 kills all

      expect(particleSystem.getCount()).toBe(0);
    });

    it('should remove particles in reverse order', () => {
      // Add particles with different lifespans
      particleSystem.clear();
      particleSystem.emit(0, 0, { count: 1, life: 0.5 });
      particleSystem.emit(0, 0, { count: 1, life: 1.5 });

      particleSystem.update(1); // First dies, second survives

      expect(particleSystem.getCount()).toBe(1);
      expect(particleSystem.particles[0].maxLife).toBe(1.5);
    });

    it('should handle multiple update cycles', () => {
      for (let i = 0; i < 10; i++) {
        particleSystem.update(0.05);
      }

      particleSystem.particles.forEach(p => {
        expect(p.life).toBeCloseTo(0.5, 1);
        expect(p.alpha).toBeCloseTo(0.5, 1);
      });
    });
  });

  describe('draw - Particle Rendering', () => {
    it('should call draw methods for each particle', () => {
      const mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        globalAlpha: 1,
        fillStyle: ''
      };

      particleSystem.emit(0, 0, { count: 3 });
      particleSystem.draw(mockCtx);

      expect(mockCtx.save).toHaveBeenCalledTimes(3);
      expect(mockCtx.restore).toHaveBeenCalledTimes(3);
      expect(mockCtx.arc).toHaveBeenCalledTimes(3);
      expect(mockCtx.fill).toHaveBeenCalledTimes(3);
    });

    it('should set alpha and color for each particle', () => {
      const mockCtx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        globalAlpha: 1,
        fillStyle: ''
      };

      particleSystem.emit(0, 0, { count: 1, color: '#ff0000' });
      particleSystem.draw(mockCtx);

      expect(mockCtx.globalAlpha).toBe(1);
      expect(mockCtx.fillStyle).toBe('#ff0000');
    });
  });

  describe('explosion - Special Effect', () => {
    it('should create explosion particles', () => {
      particleSystem.explosion(100, 100);

      expect(particleSystem.getCount()).toBe(30);
    });

    it('should use red color by default', () => {
      particleSystem.explosion(0, 0);

      const particle = particleSystem.particles[0];
      expect(particle.color).toBe('#ff4757');
    });

    it('should allow custom color', () => {
      particleSystem.explosion(0, 0, '#0000ff');

      expect(particleSystem.particles[0].color).toBe('#0000ff');
    });

    it('should have high speed and gravity', () => {
      particleSystem.explosion(0, 0);

      const particle = particleSystem.particles[0];
      expect(particle.gravity).toBe(0.15);

      const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
      expect(speed).toBeGreaterThan(2); // speed 5 * random factor
    });

    it('should spread in all directions', () => {
      particleSystem.explosion(0, 0);

      const angles = particleSystem.particles.map(p =>
        Math.atan2(p.vy, p.vx)
      );

      // Check distribution across quadrants
      const quadrants = angles.map(a => Math.floor(((a + Math.PI) / (Math.PI / 2)) % 4));
      const uniqueQuadrants = new Set(quadrants);
      expect(uniqueQuadrants.size).toBeGreaterThan(2); // Spread across multiple quadrants
    });
  });

  describe('collect - Collection Effect', () => {
    it('should create collect particles', () => {
      particleSystem.collect(50, 50);

      expect(particleSystem.getCount()).toBe(20);
    });

    it('should use gold color by default', () => {
      particleSystem.collect(0, 0);

      expect(particleSystem.particles[0].color).toBe('#ffd700');
    });

    it('should have negative gravity (float up)', () => {
      particleSystem.collect(0, 0);

      expect(particleSystem.particles[0].gravity).toBe(-0.1);
    });

    it('should allow custom color', () => {
      particleSystem.collect(0, 0, '#00ff00');

      expect(particleSystem.particles[0].color).toBe('#00ff00');
    });
  });

  describe('trail - Trail Effect', () => {
    it('should create small trail particles', () => {
      particleSystem.trail(75, 75);

      expect(particleSystem.getCount()).toBe(3);
    });

    it('should use cyan color by default', () => {
      particleSystem.trail(0, 0);

      expect(particleSystem.particles[0].color).toBe('rgba(0, 212, 255, 0.6)');
    });

    it('should have low speed and no gravity', () => {
      particleSystem.trail(0, 0);

      const particle = particleSystem.particles[0];
      expect(particle.gravity).toBe(0);

      const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
      expect(speed).toBeLessThan(1);
    });

    it('should have short lifespan', () => {
      particleSystem.trail(0, 0);

      expect(particleSystem.particles[0].life).toBe(0.5);
    });
  });

  describe('powerupAura - Power-up Effect', () => {
    it('should create aura particles', () => {
      particleSystem.powerupAura(60, 60);

      expect(particleSystem.getCount()).toBe(5);
    });

    it('should use green color by default', () => {
      particleSystem.powerupAura(0, 0);

      expect(particleSystem.particles[0].color).toBe('#00ff88');
    });

    it('should float upward slowly', () => {
      particleSystem.powerupAura(0, 0);

      const particle = particleSystem.particles[0];
      expect(particle.gravity).toBe(-0.05);
      expect(particle.life).toBe(1.5);
    });
  });

  describe('clear - Reset System', () => {
    it('should remove all particles', () => {
      particleSystem.emit(0, 0, { count: 50 });
      expect(particleSystem.getCount()).toBe(50);

      particleSystem.clear();

      expect(particleSystem.getCount()).toBe(0);
      expect(particleSystem.particles).toEqual([]);
    });

    it('should allow new emissions after clear', () => {
      particleSystem.emit(0, 0, { count: 10 });
      particleSystem.clear();
      particleSystem.emit(0, 0, { count: 5 });

      expect(particleSystem.getCount()).toBe(5);
    });
  });

  describe('getCount - Particle Count', () => {
    it('should return correct particle count', () => {
      expect(particleSystem.getCount()).toBe(0);

      particleSystem.emit(0, 0, { count: 15 });
      expect(particleSystem.getCount()).toBe(15);

      particleSystem.emit(0, 0, { count: 10 });
      expect(particleSystem.getCount()).toBe(25);
    });

    it('should reflect count after updates remove particles', () => {
      particleSystem.emit(0, 0, { count: 10, life: 0.5 });

      particleSystem.update(1); // All die

      expect(particleSystem.getCount()).toBe(0);
    });
  });

  describe('Integration - Full Particle Lifecycle', () => {
    it('should handle complete particle lifecycle', () => {
      // Emit explosion
      particleSystem.explosion(100, 100);
      expect(particleSystem.getCount()).toBe(30);

      // Update particles for half their life
      particleSystem.update(0.4);
      expect(particleSystem.getCount()).toBe(30);

      // Check particles are fading
      particleSystem.particles.forEach(p => {
        expect(p.alpha).toBeLessThan(1);
        expect(p.life).toBeCloseTo(0.4, 1);
      });

      // Update until death
      particleSystem.update(0.5);
      expect(particleSystem.getCount()).toBe(0);
    });

    it('should handle mixed particle types', () => {
      particleSystem.explosion(50, 50); // 30 particles, life 0.8
      particleSystem.collect(100, 100); // 20 particles, life 1.0
      particleSystem.trail(150, 150); // 3 particles, life 0.5

      expect(particleSystem.getCount()).toBe(53);

      // Trail dies first (0.5s)
      particleSystem.update(0.6);
      expect(particleSystem.getCount()).toBe(50);

      // Explosion dies second (0.8s)
      particleSystem.update(0.3);
      expect(particleSystem.getCount()).toBe(20);

      // Collect dies last (1.0s)
      particleSystem.update(0.2);
      expect(particleSystem.getCount()).toBe(0);
    });

    it('should handle rapid emissions', () => {
      for (let i = 0; i < 10; i++) {
        particleSystem.trail(i * 10, i * 10);
      }

      expect(particleSystem.getCount()).toBe(30);

      particleSystem.update(0.1);

      expect(particleSystem.getCount()).toBe(30); // Still alive
    });
  });
});
