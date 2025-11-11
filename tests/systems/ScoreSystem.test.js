/**
 * Tests for Score System
 * Validates scoring, combos, multipliers, and statistics
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScoreSystem } from '../../js/systems/ScoreSystem.js';
import { Storage } from '../../js/utils/Storage.js';

// Mock CONFIG
vi.mock('../../js/config.js', () => ({
  CONFIG: {
    STORAGE_KEYS: {
      HIGH_SCORE: 'rallyx_high_score',
      STATS: 'rallyx_stats'
    },
    FLAG: {
      COMBO_TIME_WINDOW: 3000
    },
    SCORE: {
      FLAG_BASE: 100,
      ENEMY_DODGE: 25,
      TIME_BONUS_PER_SECOND: 10,
      PERFECT_LEVEL: 500,
      COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3, 4, 5]
    }
  }
}));

describe('ScoreSystem', () => {
  let scoreSystem;

  beforeEach(() => {
    localStorage.clear();
    scoreSystem = new ScoreSystem();
  });

  describe('Initialization', () => {
    it('should initialize with zero score', () => {
      expect(scoreSystem.score).toBe(0);
    });

    it('should load high score from storage', () => {
      Storage.set('rallyx_high_score', 5000);
      const newSystem = new ScoreSystem();

      expect(newSystem.highScore).toBe(5000);
    });

    it('should initialize stats object', () => {
      expect(scoreSystem.stats).toEqual({
        flagsCollected: 0,
        enemiesDodged: 0,
        powerupsUsed: 0,
        perfectLevels: 0,
        totalPlayTime: 0
      });
    });

    it('should start with combo at 0', () => {
      expect(scoreSystem.combo).toBe(0);
      expect(scoreSystem.multiplier).toBe(1);
    });
  });

  describe('addScore - Basic Scoring', () => {
    it('should add points to score', () => {
      scoreSystem.addScore(100);

      expect(scoreSystem.score).toBe(100);
    });

    it('should apply multiplier to points', () => {
      scoreSystem.multiplier = 2;

      const result = scoreSystem.addScore(100);

      expect(result.points).toBe(200);
      expect(scoreSystem.score).toBe(200);
    });

    it('should update high score when exceeded', () => {
      scoreSystem.highScore = 500;
      scoreSystem.addScore(600);

      expect(scoreSystem.highScore).toBe(600);
    });

    it('should save high score to storage', () => {
      scoreSystem.addScore(1000);

      expect(Storage.get('rallyx_high_score')).toBe(1000);
    });

    it('should not update high score if not exceeded', () => {
      scoreSystem.highScore = 1000;
      scoreSystem.addScore(500);

      expect(scoreSystem.highScore).toBe(1000);
    });

    it('should return scoring details', () => {
      scoreSystem.multiplier = 1.5;
      scoreSystem.combo = 2;

      const result = scoreSystem.addScore(100);

      expect(result).toEqual({
        points: 150,
        multiplier: 1.5,
        combo: 2
      });
    });
  });

  describe('flagCollected - Combo System', () => {
    it('should increment combo on flag collection', () => {
      scoreSystem.flagCollected();

      expect(scoreSystem.combo).toBe(1);
      expect(scoreSystem.stats.flagsCollected).toBe(1);
    });

    it('should build combo multiplier', () => {
      scoreSystem.flagCollected(); // combo 1, multiplier 1
      expect(scoreSystem.multiplier).toBe(1);

      scoreSystem.flagCollected(); // combo 2, multiplier 1.5
      expect(scoreSystem.multiplier).toBe(1.5);

      scoreSystem.flagCollected(); // combo 3, multiplier 2
      expect(scoreSystem.multiplier).toBe(2);
    });

    it('should cap multiplier at max combo', () => {
      // Collect 10 flags (more than COMBO_MULTIPLIERS length)
      for (let i = 0; i < 10; i++) {
        scoreSystem.flagCollected();
      }

      expect(scoreSystem.multiplier).toBe(5); // Max multiplier from config
    });

    it('should reset combo timer on each flag', () => {
      scoreSystem.flagCollected();
      expect(scoreSystem.comboTimer).toBe(3000);

      scoreSystem.comboTimer = 1000;
      scoreSystem.flagCollected();
      expect(scoreSystem.comboTimer).toBe(3000);
    });

    it('should add flag base score with multiplier', () => {
      scoreSystem.flagCollected(); // 100 * 1 = 100
      scoreSystem.flagCollected(); // 100 * 1.5 = 150

      expect(scoreSystem.score).toBe(250);
    });
  });

  describe('update - Combo Timer', () => {
    it('should decrease combo timer over time', () => {
      scoreSystem.flagCollected();
      scoreSystem.comboTimer = 3000;

      scoreSystem.update(1); // 1 second

      expect(scoreSystem.comboTimer).toBe(2000);
    });

    it('should reset combo when timer expires', () => {
      scoreSystem.combo = 5;
      scoreSystem.multiplier = 3;
      scoreSystem.comboTimer = 500;

      scoreSystem.update(1); // Timer expires (500 - 1000 = -500)

      expect(scoreSystem.combo).toBe(0);
      expect(scoreSystem.multiplier).toBe(1);
      expect(scoreSystem.comboTimer).toBe(0);
    });

    it('should not decrease timer when combo is 0', () => {
      scoreSystem.combo = 0;
      scoreSystem.comboTimer = 0;

      scoreSystem.update(1);

      expect(scoreSystem.comboTimer).toBe(0);
    });

    it('should handle fractional deltaTime', () => {
      scoreSystem.flagCollected();
      scoreSystem.comboTimer = 3000;

      scoreSystem.update(0.016); // ~16ms frame

      expect(scoreSystem.comboTimer).toBeCloseTo(2984, 0);
    });
  });

  describe('enemyDodged - Enemy Dodging', () => {
    it('should add dodge score', () => {
      const result = scoreSystem.enemyDodged();

      expect(result.points).toBe(25);
      expect(scoreSystem.score).toBe(25);
    });

    it('should increment dodge stat', () => {
      scoreSystem.enemyDodged();
      scoreSystem.enemyDodged();

      expect(scoreSystem.stats.enemiesDodged).toBe(2);
    });

    it('should apply multiplier to dodge score', () => {
      scoreSystem.multiplier = 2;

      scoreSystem.enemyDodged();

      expect(scoreSystem.score).toBe(50); // 25 * 2
    });
  });

  describe('powerupCollected - Power-up Collection', () => {
    it('should add powerup score', () => {
      scoreSystem.powerupCollected();

      expect(scoreSystem.score).toBe(50);
    });

    it('should increment powerup stat', () => {
      scoreSystem.powerupCollected();
      scoreSystem.powerupCollected();

      expect(scoreSystem.stats.powerupsUsed).toBe(2);
    });

    it('should apply multiplier to powerup score', () => {
      scoreSystem.multiplier = 3;

      scoreSystem.powerupCollected();

      expect(scoreSystem.score).toBe(150); // 50 * 3
    });
  });

  describe('levelComplete - Level Completion', () => {
    it('should add time bonus', () => {
      const result = scoreSystem.levelComplete(30); // 30 seconds remaining

      expect(result.points).toBe(300); // 30 * 10
    });

    it('should add perfect level bonus', () => {
      const result = scoreSystem.levelComplete(20, true);

      expect(result.points).toBe(700); // (20 * 10) + 500
      expect(scoreSystem.stats.perfectLevels).toBe(1);
    });

    it('should not add perfect bonus when not perfect', () => {
      const result = scoreSystem.levelComplete(15, false);

      expect(result.points).toBe(150);
      expect(scoreSystem.stats.perfectLevels).toBe(0);
    });

    it('should apply multiplier to level bonus', () => {
      scoreSystem.multiplier = 2;

      scoreSystem.levelComplete(10, false);

      expect(scoreSystem.score).toBe(200); // (10 * 10) * 2
    });
  });

  describe('resetCombo - Manual Reset', () => {
    it('should reset combo and multiplier', () => {
      scoreSystem.combo = 5;
      scoreSystem.multiplier = 3;
      scoreSystem.comboTimer = 2000;

      scoreSystem.resetCombo();

      expect(scoreSystem.combo).toBe(0);
      expect(scoreSystem.multiplier).toBe(1);
      expect(scoreSystem.comboTimer).toBe(0);
    });
  });

  describe('setMultiplier - Temporary Multiplier', () => {
    it('should set multiplier value', () => {
      scoreSystem.setMultiplier(2.5);

      expect(scoreSystem.multiplier).toBe(2.5);
    });

    it('should reset multiplier after duration', async () => {
      vi.useFakeTimers();

      scoreSystem.setMultiplier(3, 1000);
      expect(scoreSystem.multiplier).toBe(3);

      vi.advanceTimersByTime(1000);
      expect(scoreSystem.multiplier).toBe(1);

      vi.useRealTimers();
    });

    it('should not reset if duration is 0', () => {
      scoreSystem.setMultiplier(2, 0);

      expect(scoreSystem.multiplier).toBe(2);
    });
  });

  describe('reset - Game Reset', () => {
    it('should reset score and combo', () => {
      scoreSystem.score = 1000;
      scoreSystem.combo = 5;
      scoreSystem.multiplier = 3;

      scoreSystem.reset();

      expect(scoreSystem.score).toBe(0);
      expect(scoreSystem.combo).toBe(0);
      expect(scoreSystem.multiplier).toBe(1);
    });

    it('should not reset high score', () => {
      scoreSystem.highScore = 5000;

      scoreSystem.reset();

      expect(scoreSystem.highScore).toBe(5000);
    });

    it('should not reset stats', () => {
      scoreSystem.stats.flagsCollected = 10;

      scoreSystem.reset();

      expect(scoreSystem.stats.flagsCollected).toBe(10);
    });
  });

  describe('getComboPercentage - UI Helper', () => {
    it('should return percentage of combo time remaining', () => {
      scoreSystem.comboTimeWindow = 3000;
      scoreSystem.comboTimer = 1500;

      expect(scoreSystem.getComboPercentage()).toBe(0.5);
    });

    it('should return 0 when timer is 0', () => {
      scoreSystem.comboTimer = 0;

      expect(scoreSystem.getComboPercentage()).toBe(0);
    });

    it('should return 1 when timer is full', () => {
      scoreSystem.comboTimeWindow = 3000;
      scoreSystem.comboTimer = 3000;

      expect(scoreSystem.getComboPercentage()).toBe(1);
    });
  });

  describe('getStats - Statistics Retrieval', () => {
    it('should return all game statistics', () => {
      scoreSystem.score = 1500;
      scoreSystem.highScore = 2000;
      scoreSystem.combo = 3;
      scoreSystem.multiplier = 2;
      scoreSystem.stats.flagsCollected = 10;

      const stats = scoreSystem.getStats();

      expect(stats).toEqual({
        score: 1500,
        highScore: 2000,
        combo: 3,
        multiplier: 2,
        flagsCollected: 10,
        enemiesDodged: 0,
        powerupsUsed: 0,
        perfectLevels: 0,
        totalPlayTime: 0
      });
    });
  });

  describe('saveStats / loadStats - Persistence', () => {
    it('should save stats to storage', () => {
      scoreSystem.stats.flagsCollected = 20;
      scoreSystem.stats.perfectLevels = 3;

      scoreSystem.saveStats();

      const saved = Storage.get('rallyx_stats');
      expect(saved.flagsCollected).toBe(20);
      expect(saved.perfectLevels).toBe(3);
    });

    it('should load stats from storage', () => {
      Storage.set('rallyx_stats', {
        flagsCollected: 15,
        enemiesDodged: 50,
        powerupsUsed: 8
      });

      scoreSystem.loadStats();

      expect(scoreSystem.stats.flagsCollected).toBe(15);
      expect(scoreSystem.stats.enemiesDodged).toBe(50);
      expect(scoreSystem.stats.powerupsUsed).toBe(8);
    });

    it('should handle missing stats gracefully', () => {
      scoreSystem.loadStats(); // No saved stats

      expect(scoreSystem.stats).toBeTruthy();
    });
  });

  describe('Integration - Full Game Flow', () => {
    it('should track complete game session', () => {
      // Collect flags with building combo
      scoreSystem.flagCollected(); // 100 * 1 = 100
      scoreSystem.flagCollected(); // 100 * 1.5 = 150
      scoreSystem.flagCollected(); // 100 * 2 = 200

      expect(scoreSystem.score).toBe(450);
      expect(scoreSystem.combo).toBe(3);

      // Dodge enemies
      scoreSystem.enemyDodged(); // 25 * 2 = 50
      expect(scoreSystem.score).toBe(500);

      // Complete level with perfect
      scoreSystem.levelComplete(30, true); // (30*10 + 500) * 2 = 1600
      expect(scoreSystem.score).toBe(2100);

      // Verify stats
      expect(scoreSystem.stats.flagsCollected).toBe(3);
      expect(scoreSystem.stats.enemiesDodged).toBe(1);
      expect(scoreSystem.stats.perfectLevels).toBe(1);
    });

    it('should handle combo timeout during gameplay', () => {
      scoreSystem.flagCollected();
      scoreSystem.flagCollected();

      expect(scoreSystem.combo).toBe(2);
      expect(scoreSystem.multiplier).toBe(1.5);

      // Time passes, combo expires
      scoreSystem.update(4); // 4 seconds > 3 second window

      expect(scoreSystem.combo).toBe(0);
      expect(scoreSystem.multiplier).toBe(1);

      // Next flag starts new combo
      scoreSystem.flagCollected();
      expect(scoreSystem.combo).toBe(1);
    });
  });
});
