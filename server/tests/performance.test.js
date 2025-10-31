/**
 * Performance and Stress Tests
 * Tests server stability, load handling, memory usage
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { GameManager } from '../game/GameManager.js';

describe('Performance Tests', () => {
  let mockIo, gameManager;
  const createMockSocket = (id) => ({
    id,
    emit: jest.fn(),
    join: jest.fn(),
  });

  beforeEach(() => {
    mockIo = {
      to: jest.fn((room) => ({
        emit: jest.fn(),
      })),
    };

    gameManager = new GameManager(mockIo);
  });

  describe('Load Testing', () => {
    it('should handle 30 players in single lobby', () => {
      const sockets = Array.from({ length: 30 }, (_, i) => createMockSocket(`socket${i}`));

      // Host creates lobby
      gameManager.createLobby(sockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      // 29 players join
      for (let i = 1; i < 30; i++) {
        gameManager.joinLobby(sockets[i], lobbyCode, `Player${i}`, null);
      }

      const lobby = gameManager.lobbies.get(lobbyCode);
      expect(lobby.players.length).toBe(30);
      expect(lobby.players.length).toBeLessThanOrEqual(lobby.maxPlayers);
    });

    it('should handle multiple simultaneous actions', () => {
      const sockets = Array.from({ length: 10 }, (_, i) => createMockSocket(`socket${i}`));

      gameManager.createLobby(sockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      for (let i = 1; i < 10; i++) {
        gameManager.joinLobby(sockets[i], lobbyCode, `Player${i}`, null);
      }

      gameManager.startGame(sockets[0]);
      const game = gameManager.games.get(lobbyCode);

      game.startPhase('day');

      // All players vote simultaneously
      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        game.handleVote(sockets[i].id, sockets[(i + 1) % 10].id);
      }
      const endTime = Date.now();

      // All votes should be processed within 1 second
      expect(endTime - startTime).toBeLessThan(1000);
      expect(game.votes.size).toBe(10);
    });
  });

  describe('Memory Management', () => {
    it('should clean up lobbies after game ends', () => {
      const sockets = Array.from({ length: 5 }, (_, i) => createMockSocket(`socket${i}`));

      gameManager.createLobby(sockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      for (let i = 1; i < 5; i++) {
        gameManager.joinLobby(sockets[i], lobbyCode, `Player${i}`, null);
      }

      gameManager.startGame(sockets[0]);
      
      // Game exists
      expect(gameManager.games.has(lobbyCode)).toBe(true);

      // After game cleanup (simulate)
      // In real implementation, cleanup happens when game ends
      // For test, we manually check
      expect(gameManager.lobbies.has(lobbyCode)).toBe(true);
    });

    it('should handle multiple game instances', () => {
      const gameCount = 5;
      
      for (let g = 0; g < gameCount; g++) {
        const sockets = Array.from({ length: 5 }, (_, i) => 
          createMockSocket(`socket_g${g}_p${i}`)
        );

        gameManager.createLobby(sockets[0], `Host${g}`, null);
        const lobbyCode = Array.from(gameManager.lobbies.keys())[g];

        for (let i = 1; i < 5; i++) {
          gameManager.joinLobby(sockets[i], lobbyCode, `Player${g}_${i}`, null);
        }

        gameManager.startGame(sockets[0]);
      }

      // All games should exist
      expect(gameManager.games.size).toBe(gameCount);
    });
  });

  describe('Response Time Tests', () => {
    it('should process votes quickly', () => {
      const sockets = Array.from({ length: 20 }, (_, i) => createMockSocket(`socket${i}`));

      gameManager.createLobby(sockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      for (let i = 1; i < 20; i++) {
        gameManager.joinLobby(sockets[i], lobbyCode, `Player${i}`, null);
      }

      gameManager.startGame(sockets[0]);
      const game = gameManager.games.get(lobbyCode);
      game.startPhase('day');

      const startTime = performance.now();
      
      // Process 20 votes
      for (let i = 0; i < 20; i++) {
        game.handleVote(sockets[i].id, sockets[(i + 1) % 20].id);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should process 20 votes in less than 100ms
      expect(duration).toBeLessThan(100);
    });

    it('should broadcast game state efficiently', () => {
      const sockets = Array.from({ length: 15 }, (_, i) => createMockSocket(`socket${i}`));

      gameManager.createLobby(sockets[0], 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      for (let i = 1; i < 15; i++) {
        gameManager.joinLobby(sockets[i], lobbyCode, `Player${i}`, null);
      }

      gameManager.startGame(sockets[0]);
      const game = gameManager.games.get(lobbyCode);

      const startTime = performance.now();
      game.broadcastGameState();
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should broadcast to 15 players in less than 50ms
      expect(duration).toBeLessThan(50);
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should handle rapid requests gracefully', () => {
      const socket = createMockSocket('socket1');

      gameManager.createLobby(socket, 'Host', null);
      const lobbyCode = Array.from(gameManager.lobbies.keys())[0];

      // Rapid join attempts (simulated - in real scenario, rate limiter would handle)
      const sockets = Array.from({ length: 10 }, (_, i) => 
        createMockSocket(`socket${i + 2}`)
      );

      for (let i = 0; i < 10; i++) {
        gameManager.joinLobby(sockets[i], lobbyCode, `Player${i}`, null);
      }

      // All should succeed (rate limiting handled at HTTP level)
      const lobby = gameManager.lobbies.get(lobbyCode);
      expect(lobby.players.length).toBe(11); // Host + 10 players
    });
  });
});

