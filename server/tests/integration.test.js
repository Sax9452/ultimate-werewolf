/**
 * Integration Tests for Multiplayer Scenarios
 * Tests multiple players, connections, game flow
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { GameManager } from '../game/GameManager.js';

describe('Multiplayer Integration Tests', () => {
  let mockIo, gameManager;
  let mockSockets = [];

  beforeEach(() => {
    mockIo = {
      to: jest.fn((room) => ({
        emit: jest.fn(),
      })),
    };

    gameManager = new GameManager(mockIo);

    // Create mock sockets
    for (let i = 0; i < 10; i++) {
      mockSockets.push({
        id: `socket${i}`,
        emit: jest.fn(),
        join: jest.fn(),
      });
    }
  });

  afterEach(() => {
    mockSockets = [];
  });

  describe('Lobby Management', () => {
    it('should allow multiple players to join same lobby', () => {
      // Host creates lobby
      gameManager.createLobby(mockSockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      // 5 players join
      for (let i = 1; i <= 5; i++) {
        gameManager.joinLobby(
          mockSockets[i],
          lobbyCode,
          `Player${i}`,
          null
        );
      }

      const lobby = gameManager.lobbies.get(lobbyCode);
      expect(lobby.players.length).toBe(6); // Host + 5 players
    });

    it('should prevent joining when lobby is full', () => {
      // Host creates lobby
      gameManager.createLobby(mockSockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      // Fill lobby to max capacity (30 players)
      for (let i = 1; i <= 29; i++) {
        const socket = {
          id: `socket${i}`,
          emit: jest.fn(),
          join: jest.fn(),
        };
        gameManager.joinLobby(socket, lobbyCode, `Player${i}`, null);
      }

      // Try to join when full
      const fullSocket = {
        id: 'socketFull',
        emit: jest.fn(),
        join: jest.fn(),
      };

      gameManager.joinLobby(fullSocket, lobbyCode, 'FullPlayer', null);

      // Should emit error
      expect(fullSocket.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        message: expect.stringContaining('เต็มแล้ว')
      }));

      const lobby = gameManager.lobbies.get(lobbyCode);
      expect(lobby.players.length).toBe(30); // Max capacity
    });

    it('should prevent duplicate names in lobby', () => {
      gameManager.createLobby(mockSockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      // First player joins
      gameManager.joinLobby(mockSockets[1], lobbyCode, 'Player1', null);

      // Second player tries to join with same name
      const duplicateSocket = {
        id: 'socketDup',
        emit: jest.fn(),
        join: jest.fn(),
      };

      gameManager.joinLobby(duplicateSocket, lobbyCode, 'Player1', null);

      // Should emit error
      expect(duplicateSocket.emit).toHaveBeenCalledWith('error', expect.objectContaining({
        message: expect.stringContaining('ถูกใช้ไปแล้ว')
      }));
    });
  });

  describe('Game Flow with Multiple Players', () => {
    it('should start game with multiple players', () => {
      // Create lobby with 5 players
      gameManager.createLobby(mockSockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      for (let i = 1; i <= 4; i++) {
        gameManager.joinLobby(mockSockets[i], lobbyCode, `Player${i}`, null);
      }

      // Start game
      gameManager.startGame(mockSockets[0]);

      // Check if game was created
      const game = gameManager.games.get(lobbyCode);
      expect(game).toBeDefined();
      expect(game.players.length).toBe(5);
    });

    it('should handle votes from multiple players', () => {
      // Create and start game
      gameManager.createLobby(mockSockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      for (let i = 1; i <= 4; i++) {
        gameManager.joinLobby(mockSockets[i], lobbyCode, `Player${i}`, null);
      }

      gameManager.startGame(mockSockets[0]);
      const game = gameManager.games.get(lobbyCode);

      // Move to day phase
      game.startPhase('day');

      // Multiple players vote
      game.handleVote('socket0', 'socket1');
      game.handleVote('socket1', 'socket2');
      game.handleVote('socket2', 'socket1');
      game.handleVote('socket3', 'socket1');

      // Player 1 should have most votes (2 votes)
      expect(game.votes.get('socket2')).toBe('socket1');
      expect(game.votes.get('socket3')).toBe('socket1');
    });

    it('should handle night actions from multiple players', () => {
      gameManager.createLobby(mockSockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      for (let i = 1; i <= 4; i++) {
        gameManager.joinLobby(mockSockets[i], lobbyCode, `Player${i}`, null);
      }

      gameManager.startGame(mockSockets[0]);
      const game = gameManager.games.get(lobbyCode);

      // Multiple night actions
      game.handleNightAction('socket0', { targetId: 'socket1' }); // Werewolf kills
      game.handleNightAction('socket2', { targetId: 'socket1', type: 'seer' }); // Seer investigates

      expect(game.nightActions.has('werewolf')).toBe(true);
      expect(game.seerVotes.has('socket2')).toBe(true);
    });
  });

  describe('Spectator Mode Integration', () => {
    it('should handle spectator key correctly in multiplayer', () => {
      const SPECTATOR_KEY = 'Sax51821924';

      // Host creates lobby
      gameManager.createLobby(mockSockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      // Regular player joins
      gameManager.joinLobby(mockSockets[1], lobbyCode, 'Player1', null);

      // Spectator joins
      gameManager.joinLobby(mockSockets[2], lobbyCode, 'Spectator', SPECTATOR_KEY);

      const lobby = gameManager.lobbies.get(lobbyCode);
      const spectator = lobby.players.find(p => p.id === 'socket2');

      expect(spectator.spectatorKey).toBe(SPECTATOR_KEY);
    });
  });

  describe('Disconnection Handling', () => {
    it('should handle player disconnection during lobby', () => {
      gameManager.createLobby(mockSockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      gameManager.joinLobby(mockSockets[1], lobbyCode, 'Player1', null);
      gameManager.joinLobby(mockSockets[2], lobbyCode, 'Player2', null);

      const initialCount = gameManager.lobbies.get(lobbyCode).players.length;

      // Player disconnects
      gameManager.handleDisconnect(mockSockets[1]);

      const finalCount = gameManager.lobbies.get(lobbyCode).players.length;
      expect(finalCount).toBe(initialCount - 1);
    });

    it('should handle player disconnection during game', () => {
      gameManager.createLobby(mockSockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      for (let i = 1; i <= 4; i++) {
        gameManager.joinLobby(mockSockets[i], lobbyCode, `Player${i}`, null);
      }

      gameManager.startGame(mockSockets[0]);
      const game = gameManager.games.get(lobbyCode);
      const initialAliveCount = game.players.filter(p => p.isAlive).length;

      // Player disconnects
      game.handlePlayerDisconnect('socket1');

      const finalAliveCount = game.players.filter(p => p.isAlive).length;
      expect(finalAliveCount).toBe(initialAliveCount - 1);
    });
  });

  describe('Stress Testing - Multiple Lobbies', () => {
    it('should handle 10 simultaneous lobbies', () => {
      const lobbies = [];

      for (let i = 0; i < 10; i++) {
        const socket = {
          id: `host${i}`,
          emit: jest.fn(),
          join: jest.fn(),
        };
        gameManager.createLobby(socket, `Host${i}`, null);
        const lobbyCode = Array.from(gameManager.lobbies.keys())[i];
        lobbies.push(lobbyCode);
      }

      expect(gameManager.lobbies.size).toBe(10);

      // Each lobby should have 1 player (host)
      lobbies.forEach(code => {
        const lobby = gameManager.lobbies.get(code);
        expect(lobby.players.length).toBe(1);
      });
    });
  });
});

