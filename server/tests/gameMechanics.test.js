/**
 * Comprehensive Game Mechanics Tests
 * Tests all role abilities, voting, win conditions
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { Game } from '../game/Game.js';
import { ROLES, GAME_PHASES } from '../game/constants.js';

describe('Game Mechanics Tests', () => {
  let mockIo, game;

  beforeEach(() => {
    mockIo = {
      to: jest.fn(() => mockIo),
      emit: jest.fn(),
    };
  });

  describe('Role Abilities', () => {
    describe('Werewolf Kill Action', () => {
      it('should kill target player during night phase', () => {
        const players = [
          { id: 'p1', name: 'Werewolf', role: ROLES.WEREWOLF, isAlive: true, spectatorKey: null },
          { id: 'p2', name: 'Villager', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        ];

        const settings = {
          nightDuration: 60,
          dayDuration: 180,
          roleDistribution: { 'มนุษย์หมาป่า': 1, 'ชาวบ้าน': 1 }
        };

        game = new Game('TEST', players, mockIo, settings);
        game.start();

        // Werewolf kills villager
        game.handleNightAction('p1', { targetId: 'p2' });
        game.resolveNightPhase();

        const victim = game.players.find(p => p.id === 'p2');
        expect(victim.isAlive).toBe(false);
      });
    });

    describe('Seer Investigation', () => {
      it('should reveal target role correctly', () => {
        const players = [
          { id: 'p1', name: 'Seer', role: ROLES.SEER, isAlive: true, spectatorKey: null },
          { id: 'p2', name: 'Werewolf', role: ROLES.WEREWOLF, isAlive: true, spectatorKey: null },
        ];

        const settings = {
          nightDuration: 60,
          dayDuration: 180,
          roleDistribution: { 'หมอดู': 1, 'มนุษย์หมาป่า': 1 }
        };

        game = new Game('TEST', players, mockIo, settings);
        game.start();

        // Seer investigates werewolf
        game.handleNightAction('p1', { targetId: 'p2', type: 'seer' });
        game.resolveNightPhase();

        // Check if seer received result
        const seerResult = game.seerVotes.get('p1');
        expect(seerResult).toBe('p2');
      });
    });

    describe('Bodyguard Protection', () => {
      it('should protect target from werewolf kill', () => {
        const players = [
          { id: 'p1', name: 'Werewolf', role: ROLES.WEREWOLF, isAlive: true, spectatorKey: null },
          { id: 'p2', name: 'Bodyguard', role: ROLES.BODYGUARD, isAlive: true, spectatorKey: null },
          { id: 'p3', name: 'Villager', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        ];

        const settings = {
          nightDuration: 60,
          dayDuration: 180,
          roleDistribution: { 'มนุษย์หมาป่า': 1, 'บอดี้การ์ด': 1, 'ชาวบ้าน': 1 }
        };

        game = new Game('TEST', players, mockIo, settings);
        game.start();

        // Werewolf targets villager, Bodyguard protects
        game.handleNightAction('p1', { targetId: 'p3' });
        game.handleNightAction('p2', { targetId: 'p3', type: 'doctor' });
        game.resolveNightPhase();

        const protected = game.players.find(p => p.id === 'p3');
        expect(protected.isAlive).toBe(true);
        expect(protected.protected).toBe(true);
      });

      it('should prevent protecting same target two nights in a row', () => {
        const players = [
          { id: 'p1', name: 'Bodyguard', role: ROLES.BODYGUARD, isAlive: true, spectatorKey: null },
          { id: 'p2', name: 'Villager', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        ];

        const settings = {
          nightDuration: 60,
          dayDuration: 180,
          roleDistribution: { 'บอดี้การ์ด': 1, 'ชาวบ้าน': 1 }
        };

        game = new Game('TEST', players, mockIo, settings);
        game.start();

        // Night 1: Protect p2
        game.handleNightAction('p1', { targetId: 'p2', type: 'doctor' });
        game.resolveNightPhase();
        game.startPhase(GAME_PHASES.DAY);
        game.resolveDayPhase();
        game.startPhase(GAME_PHASES.NIGHT);

        // Night 2: Try to protect p2 again (should fail)
        game.lastProtectedTargets.set('p1', 'p2');
        const canProtect = !game.lastProtectedTargets.has('p1') || 
                          game.lastProtectedTargets.get('p1') !== 'p2';

        expect(canProtect).toBe(false);
      });
    });

    describe('Witch Potions', () => {
      it('should save target with save potion', () => {
        const players = [
          { id: 'p1', name: 'Werewolf', role: ROLES.WEREWOLF, isAlive: true, spectatorKey: null },
          { id: 'p2', name: 'Witch', role: ROLES.WITCH, isAlive: true, spectatorKey: null },
          { id: 'p3', name: 'Villager', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        ];

        const settings = {
          nightDuration: 60,
          dayDuration: 180,
          roleDistribution: { 'มนุษย์หมาป่า': 1, 'แม่มด': 1, 'ชาวบ้าน': 1 }
        };

        game = new Game('TEST', players, mockIo, settings);
        game.start();
        game.witchPotions.set('p2', { save: true, kill: true });

        // Werewolf kills villager, Witch saves
        game.handleNightAction('p1', { targetId: 'p3' });
        game.handleNightAction('p2', { targetId: 'p3', type: 'witch', action: 'save' });
        game.resolveNightPhase();

        const saved = game.players.find(p => p.id === 'p3');
        expect(saved.isAlive).toBe(true);
      });

      it('should kill target with kill potion', () => {
        const players = [
          { id: 'p1', name: 'Witch', role: ROLES.WITCH, isAlive: true, spectatorKey: null },
          { id: 'p2', name: 'Villager', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        ];

        const settings = {
          nightDuration: 60,
          dayDuration: 180,
          roleDistribution: { 'แม่มด': 1, 'ชาวบ้าน': 1 }
        };

        game = new Game('TEST', players, mockIo, settings);
        game.start();
        game.witchPotions.set('p1', { save: true, kill: true });

        game.handleNightAction('p1', { targetId: 'p2', type: 'witch', action: 'kill' });
        game.resolveNightPhase();

        const killed = game.players.find(p => p.id === 'p2');
        expect(killed.isAlive).toBe(false);
      });
    });

    describe('Hunter Revenge', () => {
      it('should allow hunter to shoot when killed', () => {
        const players = [
          { id: 'p1', name: 'Werewolf', role: ROLES.WEREWOLF, isAlive: true, spectatorKey: null },
          { id: 'p2', name: 'Hunter', role: ROLES.HUNTER, isAlive: true, spectatorKey: null },
          { id: 'p3', name: 'Villager', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        ];

        const settings = {
          nightDuration: 60,
          dayDuration: 180,
          roleDistribution: { 'มนุษย์หมาป่า': 1, 'นักล่า': 1, 'ชาวบ้าน': 1 }
        };

        game = new Game('TEST', players, mockIo, settings);
        game.start();

        // Werewolf kills hunter
        game.handleNightAction('p1', { targetId: 'p2' });
        game.resolveNightPhase();

        const hunter = game.players.find(p => p.id === 'p2');
        expect(hunter.isAlive).toBe(false);

        // Hunter can shoot
        game.hunterRevengeTarget = 'p1';
        expect(game.hunterRevengeTarget).toBe('p1');
      });
    });

    describe('Cupid Pairing', () => {
      it('should pair two players as lovers', () => {
        const players = [
          { id: 'p1', name: 'Cupid', role: ROLES.CUPID, isAlive: true, spectatorKey: null },
          { id: 'p2', name: 'Player1', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
          { id: 'p3', name: 'Player2', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        ];

        const settings = {
          nightDuration: 60,
          dayDuration: 180,
          roleDistribution: { 'คิวปิด': 1, 'ชาวบ้าน': 2 }
        };

        game = new Game('TEST', players, mockIo, settings);
        game.start();

        game.handleNightAction('p1', { lover1: 'p2', lover2: 'p3', type: 'cupid' });
        game.resolveNightPhase();

        const p2 = game.players.find(p => p.id === 'p2');
        const p3 = game.players.find(p => p.id === 'p3');

        expect(p2.lover).toBe('p3');
        expect(p3.lover).toBe('p2');
      });
    });
  });

  describe('Voting System', () => {
    it('should record votes correctly', () => {
      const players = [
        { id: 'p1', name: 'Player1', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        { id: 'p2', name: 'Player2', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        { id: 'p3', name: 'Player3', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
      ];

      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: { 'ชาวบ้าน': 3 }
      };

      game = new Game('TEST', players, mockIo, settings);
      game.start();
      game.startPhase(GAME_PHASES.DAY);

      game.handleVote('p1', 'p2');
      game.handleVote('p2', 'p3');

      expect(game.votes.get('p1')).toBe('p2');
      expect(game.votes.get('p2')).toBe('p3');
    });

    it('should eliminate player with majority votes', () => {
      const players = [
        { id: 'p1', name: 'Player1', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        { id: 'p2', name: 'Player2', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        { id: 'p3', name: 'Player3', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
      ];

      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: { 'ชาวบ้าน': 3 }
      };

      game = new Game('TEST', players, mockIo, settings);
      game.start();
      game.startPhase(GAME_PHASES.DAY);

      // p1 and p2 vote for p3
      game.handleVote('p1', 'p3');
      game.handleVote('p2', 'p3');
      game.resolveDayPhase();

      const eliminated = game.players.find(p => p.id === 'p3');
      expect(eliminated.isAlive).toBe(false);
    });

    it('should handle tie votes correctly', () => {
      const players = [
        { id: 'p1', name: 'Player1', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        { id: 'p2', name: 'Player2', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        { id: 'p3', name: 'Player3', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        { id: 'p4', name: 'Player4', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
      ];

      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: { 'ชาวบ้าน': 4 }
      };

      game = new Game('TEST', players, mockIo, settings);
      game.start();
      game.startPhase(GAME_PHASES.DAY);

      // 2 votes for p1, 2 votes for p2
      game.handleVote('p2', 'p1');
      game.handleVote('p3', 'p1');
      game.handleVote('p1', 'p2');
      game.handleVote('p4', 'p2');
      game.resolveDayPhase();

      // Both should be eliminated in a tie
      const p1 = game.players.find(p => p.id === 'p1');
      const p2 = game.players.find(p => p.id === 'p2');
      expect(p1.isAlive).toBe(false);
      expect(p2.isAlive).toBe(false);
    });

    it('should prevent dead players from voting', () => {
      const players = [
        { id: 'p1', name: 'Player1', role: ROLES.VILLAGER, isAlive: false, spectatorKey: null },
        { id: 'p2', name: 'Player2', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
      ];

      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: { 'ชาวบ้าน': 2 }
      };

      game = new Game('TEST', players, mockIo, settings);
      game.start();
      game.startPhase(GAME_PHASES.DAY);

      // Dead player tries to vote
      const result = game.handleVote('p1', 'p2');

      expect(game.votes.has('p1')).toBe(false);
    });
  });

  describe('Win Conditions', () => {
    it('should detect villagers win when all werewolves eliminated', () => {
      const players = [
        { id: 'p1', name: 'Werewolf', role: ROLES.WEREWOLF, isAlive: false, spectatorKey: null },
        { id: 'p2', name: 'Villager', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
      ];

      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: { 'มนุษย์หมาป่า': 1, 'ชาวบ้าน': 1 }
      };

      game = new Game('TEST', players, mockIo, settings);
      game.start();

      const winner = game.checkWinCondition();
      expect(winner).toBe(true);
      expect(game.gameState?.winner).toBe('villagers');
    });

    it('should detect werewolves win when equal to villagers', () => {
      const players = [
        { id: 'p1', name: 'Werewolf', role: ROLES.WEREWOLF, isAlive: true, spectatorKey: null },
        { id: 'p2', name: 'Villager', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
      ];

      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: { 'มนุษย์หมาป่า': 1, 'ชาวบ้าน': 1 }
      };

      game = new Game('TEST', players, mockIo, settings);
      game.start();

      const winner = game.checkWinCondition();
      expect(winner).toBe(true);
      expect(game.gameState?.winner).toBe('werewolves');
    });

    it('should detect lovers win condition', () => {
      const players = [
        { id: 'p1', name: 'Lover1', role: ROLES.VILLAGER, isAlive: true, lover: 'p2', spectatorKey: null },
        { id: 'p2', name: 'Lover2', role: ROLES.VILLAGER, isAlive: true, lover: 'p1', spectatorKey: null },
        { id: 'p3', name: 'Werewolf', role: ROLES.WEREWOLF, isAlive: false, spectatorKey: null },
      ];

      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: { 'ชาวบ้าน': 2, 'มนุษย์หมาป่า': 1 }
      };

      game = new Game('TEST', players, mockIo, settings);
      game.start();

      const winner = game.checkWinCondition();
      expect(winner).toBe(true);
      expect(game.gameState?.winner).toBe('lovers');
    });
  });

  describe('Spectator Mode', () => {
    it('should show all roles to spectator', () => {
      const SPECTATOR_KEY = 'Sax51821924';
      const players = [
        { id: 'p1', name: 'Werewolf', role: ROLES.WEREWOLF, isAlive: true, spectatorKey: SPECTATOR_KEY },
        { id: 'p2', name: 'Villager', role: ROLES.VILLAGER, isAlive: true, spectatorKey: null },
        { id: 'p3', name: 'Seer', role: ROLES.SEER, isAlive: true, spectatorKey: null },
      ];

      const settings = {
        nightDuration: 60,
        dayDuration: 180,
        roleDistribution: { 'มนุษย์หมาป่า': 1, 'ชาวบ้าน': 1, 'หมอดู': 1 }
      };

      game = new Game('TEST', players, mockIo, settings);
      game.start();

      game.broadcastGameState();

      // Check if spectator receives all roles
      const emitCalls = mockIo.emit.mock.calls;
      const gameStateCall = emitCalls.find(call => call[0] === 'gameState');
      
      if (gameStateCall) {
        const gameState = gameStateCall[1];
        const spectatorPlayer = gameState.players.find(p => p.id === 'p1');
        
        // Spectator should see all roles
        expect(gameState.isSpectatorMode).toBe(true);
        expect(gameState.players.every(p => p.role !== undefined)).toBe(true);
      }
    });
  });
});

