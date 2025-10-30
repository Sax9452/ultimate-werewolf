import { nanoid } from 'nanoid';
import { Game } from './Game.js';

export class GameManager {
  constructor(io) {
    this.io = io;
    this.lobbies = new Map();
    this.games = new Map();
    this.playerToLobby = new Map();
    this.botCounter = 0;
  }

  createLobby(socket, playerName) {
    // สร้างโค้ดห้องเป็นตัวเลข 5 หลัก (10000-99999) และตรวจสอบว่าไม่ซ้ำ
    let lobbyCode;
    do {
      lobbyCode = String(Math.floor(10000 + Math.random() * 90000));
    } while (this.lobbies.has(lobbyCode)); // สร้างใหม่ถ้าโค้ดซ้ำ
    
    const lobby = {
      code: lobbyCode,
      host: socket.id,
      players: [{
        id: socket.id,
        name: playerName,
        ready: true,
        isBot: false
      }],
      maxPlayers: 30, // ⭐ จำกัดที่ 30 คน (สมดุล)
      minPlayers: 3,
      settings: {
        nightDuration: 60,  // วินาที
        dayDuration: 180,   // วินาที
        roleDistribution: {
          'ชาวบ้าน': 0,
          'มนุษย์หมาป่า': 0,
          'หมอดู': 0,
          'บอดี้การ์ด': 0,
          'นักล่า': 0,
          'คิวปิด': 0,
          'ลูกหมาป่า': 0,
          'ผู้ทรยศ': 0,
          'แม่มด': 0,
          'ตัวตลก': 0,
          'อัลฟ่ามนุษย์หมาป่า': 0
        }
      }
    };

    this.lobbies.set(lobbyCode, lobby);
    this.playerToLobby.set(socket.id, lobbyCode);
    socket.join(lobbyCode);

    socket.emit('lobbyCreated', { lobbyCode, lobby });
    console.log(`Lobby created: ${lobbyCode} by ${playerName}`);
  }

  updateLobbySettings(socket, settings) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const lobby = this.lobbies.get(lobbyCode);

    if (!lobby) {
      socket.emit('error', { message: 'ไม่พบห้อง' });
      return;
    }

    if (lobby.host !== socket.id) {
      socket.emit('error', { message: 'เฉพาะผู้สร้างห้องเท่านั้นที่ตั้งค่าได้' });
      return;
    }

    if (this.games.has(lobbyCode)) {
      socket.emit('error', { message: 'ไม่สามารถเปลี่ยนการตั้งค่าระหว่างเกมได้' });
      return;
    }

    lobby.settings = { ...lobby.settings, ...settings };
    this.io.to(lobbyCode).emit('lobbyUpdated', lobby);
    console.log(`Lobby settings updated: ${lobbyCode}`);
  }

  addBot(socket) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const lobby = this.lobbies.get(lobbyCode);

    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' });
      return;
    }

    if (lobby.host !== socket.id) {
      socket.emit('error', { message: 'Only the host can add bots' });
      return;
    }

    if (this.games.has(lobbyCode)) {
      socket.emit('error', { message: 'Cannot add bots during game' });
      return;
    }

    this.botCounter++;
    const botNames = [
      '🤖 บอทอัลฟ่า',
      '🤖 บอทเบต้า',
      '🤖 บอทแกมม่า',
      '🤖 บอทเดลต้า',
      '🤖 บอทโอเมก้า',
      '🤖 บอทฉลาด',
      '🤖 บอทยุทธวิธี',
      '🤖 บอทกลยุทธ์',
      '🤖 บอทเจ้าเล่ห์',
      '🤖 บอทปราชญ์',
      '🤖 บอทเฉลียว',
      '🤖 บอทเก่งกาจ'
    ];

    const botName = botNames[this.botCounter % botNames.length] + ` #${this.botCounter}`;
    const botId = `bot-${nanoid(10)}`;

    const bot = {
      id: botId,
      name: botName,
      ready: true,
      isBot: true
    };

    lobby.players.push(bot);
    this.playerToLobby.set(botId, lobbyCode);

    this.io.to(lobbyCode).emit('lobbyUpdated', lobby);
    console.log(`Bot added: ${botName} to lobby ${lobbyCode}`);
  }

  removeBot(socket, botId) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const lobby = this.lobbies.get(lobbyCode);

    if (!lobby) {
      socket.emit('error', { message: 'Lobby not found' });
      return;
    }

    if (lobby.host !== socket.id) {
      socket.emit('error', { message: 'Only the host can remove bots' });
      return;
    }

    const bot = lobby.players.find(p => p.id === botId && p.isBot);
    if (!bot) {
      socket.emit('error', { message: 'Bot not found' });
      return;
    }

    lobby.players = lobby.players.filter(p => p.id !== botId);
    this.playerToLobby.delete(botId);

    this.io.to(lobbyCode).emit('lobbyUpdated', lobby);
    console.log(`Bot removed: ${botId} from lobby ${lobbyCode}`);
  }

  joinLobby(socket, lobbyCode, playerName) {
    const lobby = this.lobbies.get(lobbyCode);

    if (!lobby) {
      socket.emit('error', { message: 'ไม่พบห้อง' });
      return;
    }

    if (this.games.has(lobbyCode)) {
      socket.emit('error', { message: 'เกมกำลังดำเนินอยู่' });
      return;
    }

    // ⭐ ตรวจสอบจำนวนผู้เล่นเต็ม
    if (lobby.players.length >= lobby.maxPlayers) {
      socket.emit('error', { message: `ห้องเต็มแล้ว (${lobby.maxPlayers} คน)` });
      return;
    }

    // ⭐ ตรวจสอบชื่อซ้ำในห้อง
    const existingPlayer = lobby.players.find(p => 
      !p.isBot && p.name.toLowerCase() === playerName.toLowerCase()
    );

    if (existingPlayer) {
      socket.emit('error', { message: `ชื่อ "${playerName}" ถูกใช้ไปแล้วในห้องนี้ กรุณาใช้ชื่ออื่น` });
      return;
    }

    const player = {
      id: socket.id,
      name: playerName,
      ready: false,
      isBot: false
    };

    lobby.players.push(player);
    this.playerToLobby.set(socket.id, lobbyCode);
    socket.join(lobbyCode);

    this.io.to(lobbyCode).emit('lobbyUpdated', lobby);
    socket.emit('joinedLobby', { lobbyCode, lobby });
    console.log(`${playerName} joined lobby: ${lobbyCode}`);
  }

  startGame(socket) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const lobby = this.lobbies.get(lobbyCode);

    if (!lobby) {
      socket.emit('error', { message: 'ไม่พบห้อง' });
      return;
    }

    if (lobby.host !== socket.id) {
      socket.emit('error', { message: 'เฉพาะผู้สร้างห้องเท่านั้นที่เริ่มเกมได้' });
      return;
    }

    if (lobby.players.length < lobby.minPlayers) {
      socket.emit('error', { message: `ต้องมีผู้เล่นอย่างน้อย ${lobby.minPlayers} คน` });
      return;
    }

    // ⭐ ตรวจสอบ role distribution (ความสมดุล)
    const validation = this.validateRoleDistribution(lobby.settings.roleDistribution, lobby.players.length);
    if (!validation.valid) {
      socket.emit('error', { message: validation.message });
      return;
    }

    // ⭐ สร้างเกมใหม่ (ไม่ต้องส่ง callback แล้ว)
    const game = new Game(lobbyCode, lobby.players, this.io, lobby.settings);
    this.games.set(lobbyCode, game);
    game.start();

    console.log(`Game started in lobby: ${lobbyCode}`);
  }

  handleNightAction(socket, action) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const game = this.games.get(lobbyCode);

    if (game) {
      game.handleNightAction(socket.id, action);
    }
  }

  handleVote(socket, targetId) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const game = this.games.get(lobbyCode);

    if (game) {
      game.handleVote(socket.id, targetId);
    }
  }

  handleSkipVote(socket) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const game = this.games.get(lobbyCode);

    if (game) {
      game.handleSkipVote(socket.id);
    }
  }

  handleHunterShoot(socket, targetId) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const game = this.games.get(lobbyCode);
    
    if (game) {
      game.handleHunterShoot(socket.id, targetId);
    }
  }

  // ⭐ แชทแยกสำหรับหมาป่า
  handleRoleAcknowledge(socket) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const game = this.games.get(lobbyCode);

    if (game) {
      game.acknowledgeRole(socket.id);
    }
  }

  handleWerewolfChat(socket, message) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const game = this.games.get(lobbyCode);

    if (game) {
      const player = game.players.find(p => p.id === socket.id);
      
      // ตรวจสอบว่าเป็นทีมหมาป่า (รวมผู้ทรยศ)
      if (player && game.isWerewolfTeam(player.role)) {
        // ส่งข้อความให้ทีมหมาป่าทุกคน (รวมผู้ทรยศ)
        const werewolfTeam = game.players.filter(p => game.isWerewolfTeam(p.role));
        
        werewolfTeam.forEach(wolf => {
          if (!wolf.isBot) {
            this.io.to(wolf.id).emit('werewolfChatMessage', {
              playerName: player.name,
              playerId: player.id,
              message,
              timestamp: Date.now()
            });
          }
        });
      }
    }
  }

  handleChatMessage(socket, message) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const game = this.games.get(lobbyCode);

    if (game) {
      const player = game.players.find(p => p.id === socket.id);
      if (player) {
        this.io.to(lobbyCode).emit('chatMessage', {
          playerName: player.name,
          playerId: player.id,
          message,
          timestamp: Date.now()
        });
      }
    } else {
      const lobby = this.lobbies.get(lobbyCode);
      if (lobby) {
        const player = lobby.players.find(p => p.id === socket.id);
        if (player) {
          this.io.to(lobbyCode).emit('chatMessage', {
            playerName: player.name,
            playerId: player.id,
            message,
            timestamp: Date.now()
          });
        }
      }
    }
  }

  endGame(lobbyCode) {
    const game = this.games.get(lobbyCode);
    const lobby = this.lobbies.get(lobbyCode);

    if (!game || !lobby) return;

    // ลบเกมที่จบไปแล้ว
    this.games.delete(lobbyCode);

    // รีเซ็ต lobby กลับไปสถานะรอ
    // เอาเฉพาะผู้เล่นจริง (ไม่เอาบอท)
    const humanPlayers = lobby.players.filter(p => !p.isBot);
    
    lobby.players = humanPlayers.map(p => ({
      ...p,
      ready: p.id === lobby.host // host พร้อมอัตโนมัติ
    }));

    // ส่งสัญญาณให้ทุกคนกลับไป lobby
    this.io.to(lobbyCode).emit('backToLobby', { lobby });
    console.log(`Game ended, lobby ${lobbyCode} reset for new game`);
  }

  rejoinLobby(socket) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const lobby = this.lobbies.get(lobbyCode);

    if (!lobby) {
      socket.emit('error', { message: 'ไม่พบห้อง' });
      return;
    }

    // ตรวจสอบว่า player อยู่ในห้องหรือไม่
    const player = lobby.players.find(p => p.id === socket.id);
    
    if (!player) {
      socket.emit('error', { message: 'คุณไม่ได้อยู่ในห้องนี้' });
      return;
    }

    // ส่งข้อมูล lobby กลับไป
    socket.emit('joinedLobby', { lobbyCode, lobby });
    this.io.to(lobbyCode).emit('lobbyUpdated', lobby);
    console.log(`${player.name} rejoined lobby: ${lobbyCode}`);
  }

  returnToLobby(socket) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const lobby = this.lobbies.get(lobbyCode);
    const game = this.games.get(lobbyCode);

    if (!lobby || !lobbyCode) {
      socket.emit('error', { message: 'ไม่พบห้อง' });
      return;
    }

    // ตรวจสอบว่ามีเกมจริงหรือไม่
    if (!game) {
      socket.emit('error', { message: 'ไม่มีเกมที่กำลังเล่นอยู่' });
      return;
    }

    // เรียก endGame เพื่อรีเซ็ต lobby และส่งทุกคนกลับ
    this.endGame(lobbyCode);
    console.log(`✅ Player requested return to lobby ${lobbyCode}`);
  }

  // ⭐ ส่งข้อมูลยาของ Witch ให้ผู้เล่น
  sendWitchPotions(socket) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    const game = this.games.get(lobbyCode);

    if (!game) {
      socket.emit('error', { message: 'ไม่มีเกมที่กำลังเล่นอยู่' });
      return;
    }

    // ดึงข้อมูลยาของ Witch จาก game
    const witchPotions = game.witchPotions?.get(socket.id);
    
    if (witchPotions) {
      socket.emit('witchPotionsUpdate', witchPotions);
    }
  }

  handleDisconnect(socket) {
    const lobbyCode = this.playerToLobby.get(socket.id);
    
    if (lobbyCode) {
      const lobby = this.lobbies.get(lobbyCode);
      const game = this.games.get(lobbyCode);

      if (game) {
        game.handlePlayerDisconnect(socket.id);
      } else if (lobby) {
        lobby.players = lobby.players.filter(p => p.id !== socket.id);
        
        if (lobby.players.length === 0) {
          this.lobbies.delete(lobbyCode);
        } else {
          if (lobby.host === socket.id) {
            lobby.host = lobby.players[0].id;
          }
          this.io.to(lobbyCode).emit('lobbyUpdated', lobby);
        }
      }

      this.playerToLobby.delete(socket.id);
    }
  }

  // ⭐ ตรวจสอบ role distribution
  validateRoleDistribution(roleDistribution, playerCount) {
    let totalRoles = 0;
    let werewolfCount = 0;
    let villagerCount = 0;
    
    Object.entries(roleDistribution).forEach(([role, count]) => {
      if (count > 0) {
        totalRoles += count;
        
        // นับชาวบ้าน
        if (role === 'ชาวบ้าน') {
          villagerCount += count;
        }
        
        // นับหมาป่า
        if (role === 'มนุษย์หมาป่า' || role === 'อัลฟ่ามนุษย์หมาป่า' || 
            role === 'ลูกหมาป่า' || role === 'ผู้ทรยศ') {
          werewolfCount += count;
        }
      }
    });
    
    // ตรวจสอบ 1: จำนวน roles ต้องตรงกับจำนวนผู้เล่น
    if (totalRoles !== playerCount) {
      return {
        valid: false,
        message: `จำนวน role ทั้งหมด (${totalRoles}) ต้องตรงกับจำนวนผู้เล่น (${playerCount})`
      };
    }
    
    // ตรวจสอบ 2: ต้องมีหมาป่าอย่างน้อย 1 ตัว
    if (werewolfCount === 0) {
      return {
        valid: false,
        message: 'ต้องมีมนุษย์หมาป่าอย่างน้อย 1 ตัว'
      };
    }
    
    // ตรวจสอบ 3: หมาป่าต้องไม่เกิน 40% ของจำนวนผู้เล่น (สมดุล)
    const maxWerewolves = Math.ceil(playerCount * 0.4);
    if (werewolfCount > maxWerewolves) {
      return {
        valid: false,
        message: `หมาป่ามากเกินไป (${werewolfCount}/${maxWerewolves}) เกมจะไม่สมดุล`
      };
    }
    
    // ตรวจสอบ 4: ต้องมีชาวบ้านอย่างน้อย 1 คน
    if (villagerCount === 0) {
      return {
        valid: false,
        message: 'ต้องมีชาวบ้านอย่างน้อย 1 คน'
      };
    }
    
    return { valid: true };
  }
}

