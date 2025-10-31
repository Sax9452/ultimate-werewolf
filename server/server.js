import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GameManager } from './game/GameManager.js';

const app = express();

// ⭐ Rate Limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Limit JSON payload size

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

  socket.on('createLobby', ({ playerName, spectatorKey }) => {
    gameManager.createLobby(socket, playerName, spectatorKey);
  });

  socket.on('joinLobby', ({ lobbyCode, playerName, spectatorKey }) => {
    gameManager.joinLobby(socket, lobbyCode, playerName, spectatorKey);
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

// ⭐ Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎮 Werewolf Server running on port ${PORT}`);
  console.log(`📡 Accessible from all network interfaces`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

