/**
 * Unit tests for Game logic
 * Tests win conditions, voting, night actions
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Game } from '../game/Game.js';
import { ROLES, GAME_PHASES } from '../game/constants.js';

describe('Game Logic Tests', () => {
  let mockIo, game, players;

  beforeEach(() => {
    // Mock Socket.io
    mockIo = {
      to: jest.fn(() => mockIo),
      emit: jest.fn(),
    };

    // Create test players
    players = [
      { id: 'player1', name: 'Test Player 1', ready: true, isBot: false },
      { id: 'player2', name: 'Test Player 2', ready: true, isBot: false },
      { id: 'player3', name: 'Test Player 3', ready: true, isBot: false },
    ];
  });

  describe('Game Initialization', () => {
    it('should initialize game with players', () => {
      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: {
          'ชาวบ้าน': 1,
          'มนุษย์หมาป่า': 1,
          'หมอดู': 1,
          'บอดี้การ์ด': 0,
        }
      };

      game = new Game('TEST123', players, mockIo, settings);
      
      expect(game.players).toHaveLength(3);
      expect(game.phase).toBe(GAME_PHASES.NIGHT);
      expect(game.day).toBe(1);
    });

    it('should assign roles to players', () => {
      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: {
          'ชาวบ้าน': 1,
          'มนุษย์หมาป่า': 1,
          'หมอดู': 1,
        }
      };

      game = new Game('TEST123', players, mockIo, settings);
      game.start();

      // All players should have a role assigned
      game.players.forEach(player => {
        expect(player.role).toBeDefined();
      });
    });
  });

  describe('Win Conditions', () => {
    it('should detect villagers win when all werewolves eliminated', () => {
      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: {
          'ชาวบ้าน': 2,
          'มนุษย์หมาป่า': 1,
        }
      };

      game = new Game('TEST123', players, mockIo, settings);
      game.start();

      // Kill the werewolf
      const werewolf = game.players.find(p => p.role === ROLES.WEREWOLF);
      if (werewolf) {
        werewolf.isAlive = false;
      }

      // Check win condition
      const winners = game.checkWinCondition();
      expect(winners).toBe(true);
      expect(game.gameState.winner).toBe('villagers');
    });

    it('should detect werewolves win when equal or more than villagers', () => {
      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: {
          'ชาวบ้าน': 1,
          'มนุษย์หมาป่า': 2,
        }
      };

      game = new Game('TEST123', players, mockIo, settings);
      game.start();

      // Kill the villager
      const villager = game.players.find(p => p.role === ROLES.VILLAGER);
      if (villager) {
        villager.isAlive = false;
      }

      // Check win condition
      const winners = game.checkWinCondition();
      expect(winners).toBe(true);
      expect(game.gameState.winner).toBe('werewolves');
    });
  });

  describe('Voting Logic', () => {
    it('should count votes correctly', () => {
      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: {
          'ชาวบ้าน': 1,
          'มนุษย์หมาป่า': 1,
          'หมอดู': 1,
        }
      };

      game = new Game('TEST123', players, mockIo, settings);
      game.start();

      // Start day phase
      game.startPhase(GAME_PHASES.DAY);

      // Players vote
      const targetId = game.players[0].id;
      game.handleVote(game.players[1].id, targetId);
      game.handleVote(game.players[2].id, targetId);

      expect(game.votes.size).toBe(2);
      expect(game.votes.get(game.players[1].id)).toBe(targetId);
      expect(game.votes.get(game.players[2].id)).toBe(targetId);
    });
  });

  describe('Night Actions', () => {
    it('should handle werewolf kill action', () => {
      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: {
          'ชาวบ้าน': 1,
          'มนุษย์หมาป่า': 1,
          'หมอดู': 1,
        }
      };

      game = new Game('TEST123', players, mockIo, settings);
      game.start();

      const werewolf = game.players.find(p => p.role === ROLES.WEREWOLF);
      const victim = game.players.find(p => p.role === ROLES.VILLAGER);

      if (werewolf && victim) {
        game.handleNightAction(werewolf.id, { targetId: victim.id });

        // Check if night action was recorded
        expect(game.nightActions.get('werewolf')).toBe(victim.id);
      }
    });
  });
});

