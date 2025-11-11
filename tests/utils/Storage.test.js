/**
 * Tests for Storage System
 * Validates localStorage wrapper with error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Storage } from '../../js/utils/Storage.js';

describe('Storage System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('get - Read from Storage', () => {
    it('should retrieve stored value', () => {
      localStorage.setItem('testKey', JSON.stringify({ value: 42 }));

      const result = Storage.get('testKey');

      expect(result).toEqual({ value: 42 });
    });

    it('should return default value when key does not exist', () => {
      const result = Storage.get('nonExistent', 'default');

      expect(result).toBe('default');
    });

    it('should return null as default when not specified', () => {
      const result = Storage.get('missing');

      expect(result).toBe(null);
    });

    it('should handle complex objects', () => {
      const complex = {
        nested: { data: [1, 2, 3] },
        string: 'test',
        number: 123,
        boolean: true
      };

      localStorage.setItem('complex', JSON.stringify(complex));

      expect(Storage.get('complex')).toEqual(complex);
    });

    it('should return default on parse error', () => {
      localStorage.setItem('invalid', 'invalid json {{{');

      const result = Storage.get('invalid', 'fallback');

      expect(result).toBe('fallback');
    });

    it('should handle arrays correctly', () => {
      const array = [1, 2, 3, 4, 5];
      localStorage.setItem('array', JSON.stringify(array));

      expect(Storage.get('array')).toEqual(array);
    });
  });

  describe('set - Write to Storage', () => {
    it('should store value successfully', () => {
      const result = Storage.set('myKey', { data: 'test' });

      expect(result).toBe(true);
      expect(JSON.parse(localStorage.getItem('myKey'))).toEqual({ data: 'test' });
    });

    it('should store primitive values', () => {
      Storage.set('string', 'hello');
      Storage.set('number', 42);
      Storage.set('boolean', true);

      expect(Storage.get('string')).toBe('hello');
      expect(Storage.get('number')).toBe(42);
      expect(Storage.get('boolean')).toBe(true);
    });

    it('should overwrite existing value', () => {
      Storage.set('key', 'first');
      Storage.set('key', 'second');

      expect(Storage.get('key')).toBe('second');
    });

    it('should handle null values', () => {
      Storage.set('nullKey', null);

      expect(Storage.get('nullKey')).toBe(null);
    });

    it('should handle undefined values', () => {
      Storage.set('undefinedKey', undefined);

      expect(Storage.get('undefinedKey')).toBe(null); // JSON.stringify(undefined) = undefined
    });

    it('should return false on storage error', () => {
      // Mock setItem to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });

      const result = Storage.set('key', 'value');

      expect(result).toBe(false);

      // Restore
      localStorage.setItem = originalSetItem;
    });
  });

  describe('remove - Delete from Storage', () => {
    it('should remove existing key', () => {
      Storage.set('toRemove', 'value');

      const result = Storage.remove('toRemove');

      expect(result).toBe(true);
      expect(Storage.get('toRemove')).toBe(null);
    });

    it('should return true even if key does not exist', () => {
      const result = Storage.remove('nonExistent');

      expect(result).toBe(true);
    });

    it('should not affect other keys', () => {
      Storage.set('keep', 'keepValue');
      Storage.set('remove', 'removeValue');

      Storage.remove('remove');

      expect(Storage.get('keep')).toBe('keepValue');
      expect(Storage.get('remove')).toBe(null);
    });

    it('should return false on removal error', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error('Cannot remove');
      });

      const result = Storage.remove('key');

      expect(result).toBe(false);

      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('clear - Clear All Storage', () => {
    it('should clear all stored data', () => {
      Storage.set('key1', 'value1');
      Storage.set('key2', 'value2');
      Storage.set('key3', 'value3');

      const result = Storage.clear();

      expect(result).toBe(true);
      expect(Storage.get('key1')).toBe(null);
      expect(Storage.get('key2')).toBe(null);
      expect(Storage.get('key3')).toBe(null);
    });

    it('should work on empty storage', () => {
      const result = Storage.clear();

      expect(result).toBe(true);
    });

    it('should return false on clear error', () => {
      const originalClear = localStorage.clear;
      localStorage.clear = vi.fn(() => {
        throw new Error('Cannot clear');
      });

      const result = Storage.clear();

      expect(result).toBe(false);

      localStorage.clear = originalClear;
    });
  });

  describe('has - Check Existence', () => {
    it('should return true for existing key', () => {
      Storage.set('exists', 'value');

      expect(Storage.has('exists')).toBe(true);
    });

    it('should return false for non-existing key', () => {
      expect(Storage.has('doesNotExist')).toBe(false);
    });

    it('should return true even for null values', () => {
      Storage.set('nullValue', null);

      expect(Storage.has('nullValue')).toBe(true);
    });

    it('should return false after removal', () => {
      Storage.set('temporary', 'value');
      Storage.remove('temporary');

      expect(Storage.has('temporary')).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle typical game flow', () => {
      // Save high score
      Storage.set('highScore', 1000);
      expect(Storage.get('highScore')).toBe(1000);

      // Update high score
      Storage.set('highScore', 1500);
      expect(Storage.get('highScore')).toBe(1500);

      // Save settings
      Storage.set('settings', { volume: 0.8, difficulty: 'hard' });
      expect(Storage.get('settings').volume).toBe(0.8);

      // Check all keys exist
      expect(Storage.has('highScore')).toBe(true);
      expect(Storage.has('settings')).toBe(true);

      // Clear on game reset
      Storage.clear();
      expect(Storage.has('highScore')).toBe(false);
      expect(Storage.has('settings')).toBe(false);
    });

    it('should handle multiple data types simultaneously', () => {
      const testData = {
        string: 'Rally X',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        object: { nested: 'data' }
      };

      Object.entries(testData).forEach(([key, value]) => {
        Storage.set(key, value);
      });

      Object.entries(testData).forEach(([key, value]) => {
        expect(Storage.get(key)).toEqual(value);
      });
    });
  });
});
