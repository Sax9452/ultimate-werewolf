import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './game/GameManager.js';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // ⭐ รับทุก origin (สำหรับให้เพื่อนเข้าได้)
    methods: ["GET", "POST"]
  }
});

const gameManager = new GameManager(io);

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('createLobby', (playerName) => {
    gameManager.createLobby(socket, playerName);
  });

  socket.on('joinLobby', ({ lobbyCode, playerName }) => {
    gameManager.joinLobby(socket, lobbyCode, playerName);
  });

  socket.on('addBot', () => {
    gameManager.addBot(socket);
  });

  socket.on('removeBot', (botId) => {
    gameManager.removeBot(socket, botId);
  });

  socket.on('updateLobbySettings', (settings) => {
    gameManager.updateLobbySettings(socket, settings);
  });

  socket.on('startGame', () => {
    gameManager.startGame(socket);
  });

  socket.on('roleAcknowledged', () => {
    gameManager.handleRoleAcknowledge(socket);
  });

  socket.on('nightAction', (action) => {
    gameManager.handleNightAction(socket, action);
  });

  socket.on('vote', (targetId) => {
    gameManager.handleVote(socket, targetId);
  });

  socket.on('skipVote', () => {
    gameManager.handleSkipVote(socket);
  });

  socket.on('hunterShoot', (targetId) => {
    gameManager.handleHunterShoot(socket, targetId);
  });

  socket.on('chatMessage', (message) => {
    gameManager.handleChatMessage(socket, message);
  });

  socket.on('werewolfChat', (message) => {
    gameManager.handleWerewolfChat(socket, message);
  });

  socket.on('requestWitchPotions', () => {
    gameManager.sendWitchPotions(socket);
  });

  socket.on('rejoinLobby', () => {
    gameManager.rejoinLobby(socket);
  });

  socket.on('returnToLobby', () => {
    gameManager.returnToLobby(socket);
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    gameManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Werewolf Server running on port ${PORT}`);
  console.log(`📡 Accessible from all network interfaces`);
});

