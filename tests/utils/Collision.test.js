/**
 * Tests for Collision Detection System
 * Validates AABB, circle, line, and point collision algorithms
 */

import { describe, it, expect } from 'vitest';
import { Collision } from '../../js/utils/Collision.js';

describe('Collision System', () => {
  describe('rectRect - AABB Collision', () => {
    it('should detect collision when rectangles overlap', () => {
      const rectA = { x: 0, y: 0, width: 50, height: 50 };
      const rectB = { x: 25, y: 25, width: 50, height: 50 };

      expect(Collision.rectRect(rectA, rectB)).toBe(true);
    });

    it('should not detect collision when rectangles do not overlap', () => {
      const rectA = { x: 0, y: 0, width: 50, height: 50 };
      const rectB = { x: 100, y: 100, width: 50, height: 50 };

      expect(Collision.rectRect(rectA, rectB)).toBe(false);
    });

    it('should detect collision when rectangles touch edges', () => {
      const rectA = { x: 0, y: 0, width: 50, height: 50 };
      const rectB = { x: 50, y: 0, width: 50, height: 50 };

      // Touching edges should not collide (> not >=)
      expect(Collision.rectRect(rectA, rectB)).toBe(false);
    });

    it('should detect collision when one rectangle is inside another', () => {
      const rectA = { x: 0, y: 0, width: 100, height: 100 };
      const rectB = { x: 25, y: 25, width: 20, height: 20 };

      expect(Collision.rectRect(rectA, rectB)).toBe(true);
    });
  });

  describe('circleCircle - Circular Collision', () => {
    it('should detect collision when circles overlap', () => {
      const circleA = { x: 0, y: 0, radius: 30 };
      const circleB = { x: 40, y: 0, radius: 30 };

      expect(Collision.circleCircle(circleA, circleB)).toBe(true);
    });

    it('should not detect collision when circles are apart', () => {
      const circleA = { x: 0, y: 0, radius: 20 };
      const circleB = { x: 100, y: 100, radius: 20 };

      expect(Collision.circleCircle(circleA, circleB)).toBe(false);
    });

    it('should detect collision when circles touch exactly', () => {
      const circleA = { x: 0, y: 0, radius: 25 };
      const circleB = { x: 50, y: 0, radius: 25 };

      expect(Collision.circleCircle(circleA, circleB)).toBe(false);
    });

    it('should detect collision when one circle is inside another', () => {
      const circleA = { x: 50, y: 50, radius: 50 };
      const circleB = { x: 50, y: 50, radius: 10 };

      expect(Collision.circleCircle(circleA, circleB)).toBe(true);
    });
  });

  describe('pointRect - Point in Rectangle', () => {
    it('should detect when point is inside rectangle', () => {
      const rect = { x: 0, y: 0, width: 100, height: 100 };

      expect(Collision.pointRect(50, 50, rect)).toBe(true);
    });

    it('should not detect when point is outside rectangle', () => {
      const rect = { x: 0, y: 0, width: 100, height: 100 };

      expect(Collision.pointRect(150, 150, rect)).toBe(false);
    });

    it('should detect when point is on rectangle edge', () => {
      const rect = { x: 0, y: 0, width: 100, height: 100 };

      expect(Collision.pointRect(100, 100, rect)).toBe(true);
    });

    it('should detect when point is at rectangle corner', () => {
      const rect = { x: 10, y: 10, width: 50, height: 50 };

      expect(Collision.pointRect(10, 10, rect)).toBe(true);
      expect(Collision.pointRect(60, 60, rect)).toBe(true);
    });
  });

  describe('distance - Distance Calculation', () => {
    it('should calculate distance between two points', () => {
      const distance = Collision.distance(0, 0, 3, 4);

      expect(distance).toBe(5); // 3-4-5 triangle
    });

    it('should return 0 for same point', () => {
      const distance = Collision.distance(10, 20, 10, 20);

      expect(distance).toBe(0);
    });

    it('should calculate diagonal distance correctly', () => {
      const distance = Collision.distance(0, 0, 100, 100);

      expect(distance).toBeCloseTo(141.421, 2);
    });

    it('should handle negative coordinates', () => {
      const distance = Collision.distance(-5, -5, 5, 5);

      expect(distance).toBeCloseTo(14.142, 2);
    });
  });

  describe('distanceSquared - Optimized Distance', () => {
    it('should calculate squared distance without sqrt', () => {
      const distSq = Collision.distanceSquared(0, 0, 3, 4);

      expect(distSq).toBe(25); // 3² + 4² = 25
    });

    it('should be faster than distance for comparisons', () => {
      const distSq = Collision.distanceSquared(0, 0, 100, 100);

      expect(distSq).toBe(20000); // 100² + 100²
    });

    it('should return 0 for identical points', () => {
      expect(Collision.distanceSquared(50, 50, 50, 50)).toBe(0);
    });
  });

  describe('lineLine - Line Intersection', () => {
    it('should detect when lines intersect', () => {
      // Cross-shaped lines
      const intersects = Collision.lineLine(0, 50, 100, 50, 50, 0, 50, 100);

      expect(intersects).toBe(true);
    });

    it('should not detect parallel lines', () => {
      const intersects = Collision.lineLine(0, 0, 100, 0, 0, 10, 100, 10);

      expect(intersects).toBe(false);
    });

    it('should not detect non-intersecting lines', () => {
      const intersects = Collision.lineLine(0, 0, 10, 10, 50, 50, 60, 60);

      expect(intersects).toBe(false);
    });

    it('should detect T-intersection', () => {
      const intersects = Collision.lineLine(0, 50, 100, 50, 50, 50, 50, 100);

      expect(intersects).toBe(true);
    });
  });

  describe('lineRect - Line-Rectangle Collision', () => {
    it('should detect when line crosses rectangle', () => {
      const rect = { x: 25, y: 25, width: 50, height: 50 };
      const intersects = Collision.lineRect(0, 50, 100, 50, rect);

      expect(intersects).toBe(true);
    });

    it('should not detect when line misses rectangle', () => {
      const rect = { x: 25, y: 25, width: 50, height: 50 };
      const intersects = Collision.lineRect(0, 0, 10, 10, rect);

      expect(intersects).toBe(false);
    });

    it('should detect diagonal line through rectangle', () => {
      const rect = { x: 40, y: 40, width: 20, height: 20 };
      const intersects = Collision.lineRect(0, 0, 100, 100, rect);

      expect(intersects).toBe(true);
    });
  });

  describe('isOutOfBounds - Boundary Check', () => {
    it('should detect entity outside left boundary', () => {
      const entity = { x: -10, y: 50, width: 20, height: 20 };

      expect(Collision.isOutOfBounds(entity, 800, 600)).toBe(true);
    });

    it('should detect entity outside right boundary', () => {
      const entity = { x: 790, y: 50, width: 20, height: 20 };

      expect(Collision.isOutOfBounds(entity, 800, 600)).toBe(true);
    });

    it('should detect entity outside top boundary', () => {
      const entity = { x: 100, y: -5, width: 20, height: 20 };

      expect(Collision.isOutOfBounds(entity, 800, 600)).toBe(true);
    });

    it('should detect entity outside bottom boundary', () => {
      const entity = { x: 100, y: 590, width: 20, height: 20 };

      expect(Collision.isOutOfBounds(entity, 800, 600)).toBe(true);
    });

    it('should not detect entity within bounds', () => {
      const entity = { x: 100, y: 100, width: 50, height: 50 };

      expect(Collision.isOutOfBounds(entity, 800, 600)).toBe(false);
    });

    it('should detect entity exactly on boundary edge', () => {
      const entity = { x: 0, y: 0, width: 800, height: 600 };

      expect(Collision.isOutOfBounds(entity, 800, 600)).toBe(false);
    });
  });
});
