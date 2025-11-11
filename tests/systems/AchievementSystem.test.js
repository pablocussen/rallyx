/**
 * Tests for Achievement System
 * Validates achievement unlocking, progress tracking, and notifications
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AchievementSystem } from '../../js/systems/AchievementSystem.js';
import { Storage } from '../../js/utils/Storage.js';

// Mock CONFIG
vi.mock('../../js/config.js', () => ({
  CONFIG: {
    STORAGE_KEYS: {
      ACHIEVEMENTS: 'rallyx_achievements'
    },
    ACHIEVEMENTS: [
      { id: 'first_win', name: 'First Victory', description: 'Complete first level' },
      { id: 'speed_demon', name: 'Speed Demon', description: 'Complete level in under 30s' },
      { id: 'combo_master', name: 'Combo Master', description: 'Achieve 5x combo' },
      { id: 'perfectionist', name: 'Perfectionist', description: 'Complete level without damage' },
      { id: 'collector', name: 'Collector', description: 'Collect 100 flags' },
      { id: 'survivor', name: 'Survivor', description: 'Dodge 50 enemies' },
      { id: 'champion', name: 'Champion', description: 'Beat all levels' },
      { id: 'high_scorer', name: 'High Scorer', description: 'Score 50,000 points' }
    ],
    LEVELS: {
      1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {} // 6 levels
    }
  }
}));

describe('AchievementSystem', () => {
  let achievementSystem;

  beforeEach(() => {
    localStorage.clear();
    achievementSystem = new AchievementSystem();
  });

  describe('Initialization', () => {
    it('should load achievements from config', () => {
      expect(achievementSystem.achievements.length).toBe(8);
    });

    it('should initialize all achievements as locked', () => {
      achievementSystem.achievements.forEach(ach => {
        expect(ach.unlocked).toBe(false);
        expect(ach.progress).toBe(0);
        expect(ach.unlockedAt).toBe(null);
      });
    });

    it('should initialize notifications array', () => {
      expect(achievementSystem.notifications).toEqual([]);
    });

    it('should load saved achievements from storage', () => {
      Storage.set('rallyx_achievements', [
        { id: 'first_win', unlocked: true, progress: 100, unlockedAt: 1234567890 }
      ]);

      const newSystem = new AchievementSystem();
      const achievement = newSystem.achievements.find(a => a.id === 'first_win');

      expect(achievement.unlocked).toBe(true);
      expect(achievement.progress).toBe(100);
      expect(achievement.unlockedAt).toBe(1234567890);
    });

    it('should handle missing saved data gracefully', () => {
      const newSystem = new AchievementSystem();

      expect(newSystem.achievements).toBeDefined();
      expect(newSystem.achievements.length).toBe(8);
    });
  });

  describe('unlock - Unlock Achievement', () => {
    it('should unlock achievement by ID', () => {
      const result = achievementSystem.unlock('first_win');

      expect(result).toBeTruthy();
      expect(result.unlocked).toBe(true);
      expect(result.id).toBe('first_win');
    });

    it('should set unlockedAt timestamp', () => {
      const before = Date.now();
      achievementSystem.unlock('first_win');
      const after = Date.now();

      const achievement = achievementSystem.achievements.find(a => a.id === 'first_win');

      expect(achievement.unlockedAt).toBeGreaterThanOrEqual(before);
      expect(achievement.unlockedAt).toBeLessThanOrEqual(after);
    });

    it('should save achievements to storage', () => {
      achievementSystem.unlock('first_win');

      const saved = Storage.get('rallyx_achievements');
      const savedAch = saved.find(a => a.id === 'first_win');

      expect(savedAch.unlocked).toBe(true);
    });

    it('should add notification on unlock', () => {
      achievementSystem.unlock('first_win');

      expect(achievementSystem.notifications.length).toBe(1);
      expect(achievementSystem.notifications[0].achievement.id).toBe('first_win');
    });

    it('should not unlock already unlocked achievement', () => {
      achievementSystem.unlock('first_win');
      const result = achievementSystem.unlock('first_win');

      expect(result).toBe(null);
    });

    it('should not add duplicate notification', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.unlock('first_win');

      expect(achievementSystem.notifications.length).toBe(1);
    });

    it('should return null for invalid achievement ID', () => {
      const result = achievementSystem.unlock('invalid_id');

      expect(result).toBe(null);
    });
  });

  describe('isUnlocked - Check Unlock Status', () => {
    it('should return false for locked achievement', () => {
      expect(achievementSystem.isUnlocked('first_win')).toBe(false);
    });

    it('should return true for unlocked achievement', () => {
      achievementSystem.unlock('first_win');

      expect(achievementSystem.isUnlocked('first_win')).toBe(true);
    });

    it('should return false for invalid achievement ID', () => {
      expect(achievementSystem.isUnlocked('invalid')).toBe(false);
    });
  });

  describe('checkAchievements - Auto-Unlock Logic', () => {
    it('should unlock First Victory after completing level 1', () => {
      achievementSystem.checkAchievements({
        level: 2,
        score: 0,
        stats: {},
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('first_win')).toBe(true);
    });

    it('should unlock Speed Demon for fast level completion', () => {
      achievementSystem.checkAchievements({
        level: 2,
        score: 0,
        stats: { levelTime: 25 },
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('speed_demon')).toBe(true);
    });

    it('should not unlock Speed Demon if time >= 30s', () => {
      achievementSystem.checkAchievements({
        level: 2,
        score: 0,
        stats: { levelTime: 35 },
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('speed_demon')).toBe(false);
    });

    it('should unlock Combo Master for 5x combo', () => {
      achievementSystem.checkAchievements({
        level: 1,
        score: 0,
        stats: { maxCombo: 5 },
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('combo_master')).toBe(true);
    });

    it('should unlock Perfectionist for no-damage level completion', () => {
      achievementSystem.checkAchievements({
        level: 2,
        score: 0,
        stats: { levelComplete: true },
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('perfectionist')).toBe(true);
    });

    it('should not unlock Perfectionist if damaged', () => {
      achievementSystem.checkAchievements({
        level: 2,
        score: 0,
        stats: { levelComplete: true },
        health: 2,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('perfectionist')).toBe(false);
    });

    it('should unlock Collector for 100 flags', () => {
      achievementSystem.checkAchievements({
        level: 1,
        score: 0,
        stats: { totalFlags: 100 },
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('collector')).toBe(true);
    });

    it('should unlock Survivor for 50 enemy dodges', () => {
      achievementSystem.checkAchievements({
        level: 1,
        score: 0,
        stats: { enemiesDodged: 50 },
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('survivor')).toBe(true);
    });

    it('should unlock Champion for beating all levels', () => {
      achievementSystem.checkAchievements({
        level: 7, // More than 6 levels
        score: 0,
        stats: {},
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('champion')).toBe(true);
    });

    it('should unlock High Scorer for 50,000 points', () => {
      achievementSystem.checkAchievements({
        level: 1,
        score: 50000,
        stats: {},
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('high_scorer')).toBe(true);
    });

    it('should not re-unlock already unlocked achievements', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.notifications = [];

      achievementSystem.checkAchievements({
        level: 2,
        score: 0,
        stats: {},
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.notifications.length).toBe(0);
    });

    it('should unlock multiple achievements at once', () => {
      achievementSystem.checkAchievements({
        level: 2,
        score: 50000,
        stats: {
          levelTime: 25,
          maxCombo: 5,
          totalFlags: 100,
          enemiesDodged: 50,
          levelComplete: true
        },
        health: 3,
        maxHealth: 3
      });

      const unlockedCount = achievementSystem.getUnlockedCount();
      expect(unlockedCount).toBeGreaterThan(1);
    });
  });

  describe('getUnlockedCount - Count Unlocked', () => {
    it('should return 0 initially', () => {
      expect(achievementSystem.getUnlockedCount()).toBe(0);
    });

    it('should return correct count after unlocking', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.unlock('speed_demon');
      achievementSystem.unlock('combo_master');

      expect(achievementSystem.getUnlockedCount()).toBe(3);
    });

    it('should not double-count duplicate unlocks', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.unlock('first_win');

      expect(achievementSystem.getUnlockedCount()).toBe(1);
    });
  });

  describe('getTotalCount - Total Achievements', () => {
    it('should return total number of achievements', () => {
      expect(achievementSystem.getTotalCount()).toBe(8);
    });
  });

  describe('getProgress - Completion Percentage', () => {
    it('should return 0% initially', () => {
      expect(achievementSystem.getProgress()).toBe(0);
    });

    it('should return 50% when half unlocked', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.unlock('speed_demon');
      achievementSystem.unlock('combo_master');
      achievementSystem.unlock('perfectionist');

      expect(achievementSystem.getProgress()).toBe(50);
    });

    it('should return 100% when all unlocked', () => {
      achievementSystem.achievements.forEach(ach => {
        achievementSystem.unlock(ach.id);
      });

      expect(achievementSystem.getProgress()).toBe(100);
    });

    it('should calculate correct percentage for partial completion', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.unlock('speed_demon');

      expect(achievementSystem.getProgress()).toBe(25); // 2/8 = 25%
    });
  });

  describe('getNotifications - Notification Management', () => {
    it('should return empty array initially', () => {
      expect(achievementSystem.getNotifications()).toEqual([]);
    });

    it('should return active notifications', () => {
      achievementSystem.unlock('first_win');

      const notifications = achievementSystem.getNotifications();

      expect(notifications.length).toBe(1);
      expect(notifications[0].achievement.id).toBe('first_win');
    });

    it('should filter expired notifications', () => {
      vi.useFakeTimers();

      achievementSystem.unlock('first_win');
      expect(achievementSystem.getNotifications().length).toBe(1);

      vi.advanceTimersByTime(3500); // 3.5 seconds > 3 second duration

      expect(achievementSystem.getNotifications().length).toBe(0);

      vi.useRealTimers();
    });

    it('should keep recent notifications', () => {
      vi.useFakeTimers();

      achievementSystem.unlock('first_win');
      vi.advanceTimersByTime(1000);
      achievementSystem.unlock('speed_demon');

      const notifications = achievementSystem.getNotifications();

      expect(notifications.length).toBe(2);

      vi.useRealTimers();
    });

    it('should auto-clean notifications array', () => {
      vi.useFakeTimers();

      achievementSystem.unlock('first_win');
      achievementSystem.unlock('speed_demon');

      vi.advanceTimersByTime(3500);

      achievementSystem.getNotifications();

      expect(achievementSystem.notifications.length).toBe(0);

      vi.useRealTimers();
    });
  });

  describe('getAllAchievements - Get All', () => {
    it('should return all achievements', () => {
      const all = achievementSystem.getAllAchievements();

      expect(all.length).toBe(8);
    });

    it('should include unlock status', () => {
      achievementSystem.unlock('first_win');

      const all = achievementSystem.getAllAchievements();
      const firstWin = all.find(a => a.id === 'first_win');

      expect(firstWin.unlocked).toBe(true);
    });

    it('should return reference to internal array', () => {
      const all = achievementSystem.getAllAchievements();

      expect(all).toBe(achievementSystem.achievements);
    });
  });

  describe('saveAchievements - Persistence', () => {
    it('should save achievements to storage', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.saveAchievements();

      const saved = Storage.get('rallyx_achievements');

      expect(saved).toBeTruthy();
      expect(saved.length).toBe(8);
    });

    it('should persist unlock status', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.saveAchievements();

      const saved = Storage.get('rallyx_achievements');
      const savedAch = saved.find(a => a.id === 'first_win');

      expect(savedAch.unlocked).toBe(true);
    });
  });

  describe('reset - Reset All', () => {
    it('should reset all achievements to locked', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.unlock('speed_demon');

      achievementSystem.reset();

      expect(achievementSystem.getUnlockedCount()).toBe(0);
    });

    it('should reset progress and timestamps', () => {
      achievementSystem.unlock('first_win');

      achievementSystem.reset();

      achievementSystem.achievements.forEach(ach => {
        expect(ach.unlocked).toBe(false);
        expect(ach.progress).toBe(0);
        expect(ach.unlockedAt).toBe(null);
      });
    });

    it('should save reset state to storage', () => {
      achievementSystem.unlock('first_win');
      achievementSystem.reset();

      const saved = Storage.get('rallyx_achievements');
      const savedAch = saved.find(a => a.id === 'first_win');

      expect(savedAch.unlocked).toBe(false);
    });
  });

  describe('Integration - Full Achievement Flow', () => {
    it('should track complete game session', () => {
      // Level 1 complete
      achievementSystem.checkAchievements({
        level: 2,
        score: 1000,
        stats: { levelTime: 45 },
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('first_win')).toBe(true);
      expect(achievementSystem.getProgress()).toBe(12.5); // 1/8

      // Level 2 - fast and perfect
      achievementSystem.checkAchievements({
        level: 3,
        score: 5000,
        stats: {
          levelTime: 25,
          maxCombo: 6,
          levelComplete: true
        },
        health: 3,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('speed_demon')).toBe(true);
      expect(achievementSystem.isUnlocked('combo_master')).toBe(true);
      expect(achievementSystem.isUnlocked('perfectionist')).toBe(true);

      // Continue playing - collect many flags
      achievementSystem.checkAchievements({
        level: 5,
        score: 50000,
        stats: {
          totalFlags: 100,
          enemiesDodged: 50
        },
        health: 2,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('collector')).toBe(true);
      expect(achievementSystem.isUnlocked('survivor')).toBe(true);
      expect(achievementSystem.isUnlocked('high_scorer')).toBe(true);

      // Beat all levels
      achievementSystem.checkAchievements({
        level: 7,
        score: 60000,
        stats: {},
        health: 1,
        maxHealth: 3
      });

      expect(achievementSystem.isUnlocked('champion')).toBe(true);
      expect(achievementSystem.getProgress()).toBe(100);
    });
  });
});
