/**
 * Tests for Input System
 * Validates keyboard, mouse, and touch input handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Input } from '../../js/utils/Input.js';

describe('Input System', () => {
  let input;

  beforeEach(() => {
    input = new Input();
  });

  describe('Initialization', () => {
    it('should initialize with empty keys object', () => {
      expect(input.keys).toEqual({});
    });

    it('should initialize mouse state', () => {
      expect(input.mouse).toEqual({
        x: 0,
        y: 0,
        down: false
      });
    });

    it('should initialize touch state', () => {
      expect(input.touch).toEqual({
        active: false,
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
      });
    });

    it('should initialize joystick state', () => {
      expect(input.joystick).toEqual({
        active: false,
        x: 0,
        y: 0,
        angle: 0,
        distance: 0
      });
    });
  });

  describe('isKeyDown - Key State Check', () => {
    it('should return false for unpressed key', () => {
      expect(input.isKeyDown('a')).toBeFalsy();
    });

    it('should return true for pressed key', () => {
      input.keys['a'] = true;

      expect(input.isKeyDown('a')).toBe(true);
    });

    it('should check multiple keys with array', () => {
      input.keys['w'] = true;

      expect(input.isKeyDown(['w', 'ArrowUp'])).toBe(true);
    });

    it('should return false if none of the keys in array are pressed', () => {
      expect(input.isKeyDown(['w', 'ArrowUp'])).toBeFalsy();
    });

    it('should return true if any key in array is pressed', () => {
      input.keys['ArrowUp'] = true;

      expect(input.isKeyDown(['w', 'ArrowUp'])).toBe(true);
    });
  });

  describe('getMovement - Movement Vector', () => {
    it('should return zero movement when no input', () => {
      const movement = input.getMovement();

      expect(movement).toEqual({
        dx: 0,
        dy: 0,
        length: 0
      });
    });

    it('should move up with W key', () => {
      input.keys['w'] = true;

      const movement = input.getMovement();

      expect(movement.dx).toBe(0);
      expect(movement.dy).toBe(-1);
    });

    it('should move down with S key', () => {
      input.keys['s'] = true;

      const movement = input.getMovement();

      expect(movement.dx).toBe(0);
      expect(movement.dy).toBe(1);
    });

    it('should move left with A key', () => {
      input.keys['a'] = true;

      const movement = input.getMovement();

      expect(movement.dx).toBe(-1);
      expect(movement.dy).toBe(0);
    });

    it('should move right with D key', () => {
      input.keys['d'] = true;

      const movement = input.getMovement();

      expect(movement.dx).toBe(1);
      expect(movement.dy).toBe(0);
    });

    it('should support arrow keys', () => {
      input.keys['ArrowUp'] = true;

      const movement = input.getMovement();

      expect(movement.dy).toBe(-1);
    });

    it('should support uppercase keys', () => {
      input.keys['W'] = true;

      const movement = input.getMovement();

      expect(movement.dy).toBe(-1);
    });

    it('should normalize diagonal movement', () => {
      input.keys['w'] = true;
      input.keys['d'] = true;

      const movement = input.getMovement();

      const length = Math.sqrt(movement.dx ** 2 + movement.dy ** 2);
      expect(length).toBeCloseTo(1, 10);
    });

    it('should handle all four diagonal directions', () => {
      // Up-Right
      input.keys['w'] = true;
      input.keys['d'] = true;
      let movement = input.getMovement();
      expect(movement.dx).toBeGreaterThan(0);
      expect(movement.dy).toBeLessThan(0);

      // Down-Right
      input.keys = { 's': true, 'd': true };
      movement = input.getMovement();
      expect(movement.dx).toBeGreaterThan(0);
      expect(movement.dy).toBeGreaterThan(0);

      // Down-Left
      input.keys = { 's': true, 'a': true };
      movement = input.getMovement();
      expect(movement.dx).toBeLessThan(0);
      expect(movement.dy).toBeGreaterThan(0);

      // Up-Left
      input.keys = { 'w': true, 'a': true };
      movement = input.getMovement();
      expect(movement.dx).toBeLessThan(0);
      expect(movement.dy).toBeLessThan(0);
    });

    it('should use joystick when active', () => {
      input.joystick.active = true;
      input.joystick.x = 0.5;
      input.joystick.y = 0.8;

      const movement = input.getMovement();

      expect(movement.dx).toBeCloseTo(0.528, 2);
      expect(movement.dy).toBeCloseTo(0.849, 2);
    });

    it('should prioritize joystick over keyboard', () => {
      input.keys['w'] = true; // Keyboard up
      input.joystick.active = true;
      input.joystick.x = 1;
      input.joystick.y = 0;

      const movement = input.getMovement();

      expect(movement.dx).toBe(1);
      expect(movement.dy).toBe(0);
    });
  });

  describe('updateJoystick - Touch Joystick', () => {
    it('should not update when touch is inactive', () => {
      input.touch.active = false;

      input.updateJoystick();

      expect(input.joystick.active).toBe(false);
    });

    it('should calculate angle from touch delta', () => {
      input.touch.active = true;
      input.touch.startX = 100;
      input.touch.startY = 100;
      input.touch.x = 150;
      input.touch.y = 100;

      input.updateJoystick();

      expect(input.joystick.angle).toBeCloseTo(0, 10); // Right = 0 radians
    });

    it('should calculate distance from touch delta', () => {
      input.touch.active = true;
      input.touch.startX = 100;
      input.touch.startY = 100;
      input.touch.x = 130;
      input.touch.y = 140;

      input.updateJoystick();

      const expectedDistance = Math.sqrt(30 ** 2 + 40 ** 2);
      expect(input.joystick.distance).toBe(expectedDistance);
    });

    it('should cap distance at 60 pixels', () => {
      input.touch.active = true;
      input.touch.startX = 0;
      input.touch.startY = 0;
      input.touch.x = 100;
      input.touch.y = 100;

      input.updateJoystick();

      expect(input.joystick.distance).toBe(60);
    });

    it('should activate joystick when distance > 20', () => {
      input.touch.active = true;
      input.touch.startX = 100;
      input.touch.startY = 100;
      input.touch.x = 130;
      input.touch.y = 100;

      input.updateJoystick();

      expect(input.joystick.active).toBe(true);
    });

    it('should not activate joystick when distance <= 20', () => {
      input.touch.active = true;
      input.touch.startX = 100;
      input.touch.startY = 100;
      input.touch.x = 110;
      input.touch.y = 100;

      input.updateJoystick();

      expect(input.joystick.active).toBe(false);
      expect(input.joystick.x).toBe(0);
      expect(input.joystick.y).toBe(0);
    });

    it('should normalize joystick values between -1 and 1', () => {
      input.touch.active = true;
      input.touch.startX = 100;
      input.touch.startY = 100;
      input.touch.x = 160; // 60 pixels right (max distance)
      input.touch.y = 100;

      input.updateJoystick();

      expect(input.joystick.x).toBeCloseTo(1, 5);
      expect(input.joystick.y).toBeCloseTo(0, 5);
    });
  });

  describe('reset - Reset Input State', () => {
    it('should clear all keys', () => {
      input.keys = { 'w': true, 'a': true, 's': true };

      input.reset();

      expect(input.keys).toEqual({});
    });

    it('should reset mouse state', () => {
      input.mouse = { x: 100, y: 200, down: true };

      input.reset();

      expect(input.mouse).toEqual({ x: 0, y: 0, down: false });
    });

    it('should reset touch state', () => {
      input.touch = { active: true, x: 50, y: 50, startX: 20, startY: 20 };

      input.reset();

      expect(input.touch).toEqual({
        active: false,
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
      });
    });

    it('should reset joystick state', () => {
      input.joystick = { active: true, x: 0.5, y: 0.5, angle: 1, distance: 30 };

      input.reset();

      expect(input.joystick).toEqual({
        active: false,
        x: 0,
        y: 0,
        angle: 0,
        distance: 0
      });
    });
  });

  describe('Integration - Full Input Flow', () => {
    it('should handle keyboard movement sequence', () => {
      // Start moving right
      input.keys['d'] = true;
      let movement = input.getMovement();
      expect(movement.dx).toBe(1);

      // Add upward movement
      input.keys['w'] = true;
      movement = input.getMovement();
      expect(movement.dx).toBeCloseTo(0.707, 2);
      expect(movement.dy).toBeCloseTo(-0.707, 2);

      // Release right
      input.keys['d'] = false;
      movement = input.getMovement();
      expect(movement.dx).toBe(0);
      expect(movement.dy).toBe(-1);
    });

    it('should handle touch joystick interaction', () => {
      // Touch start
      input.touch.active = true;
      input.touch.startX = 100;
      input.touch.startY = 100;
      input.touch.x = 100;
      input.touch.y = 100;

      input.updateJoystick();
      expect(input.joystick.active).toBe(false);

      // Drag right
      input.touch.x = 140;
      input.updateJoystick();
      expect(input.joystick.active).toBe(true);

      let movement = input.getMovement();
      expect(movement.dx).toBeGreaterThan(0);

      // Touch end
      input.reset();
      movement = input.getMovement();
      expect(movement.dx).toBe(0);
      expect(movement.dy).toBe(0);
    });
  });
});
