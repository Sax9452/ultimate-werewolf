import { ROLES, GAME_PHASES, ROLE_TEAMS } from './constants.js';
import { assignRoles } from './roleAssignment.js';
import { AIPlayer } from './AIPlayer.js';

export class Game {
  constructor(lobbyCode, lobbyPlayers, io, settings) {
    this.lobbyCode = lobbyCode;
    this.io = io;
    this.settings = settings || {
      nightDuration: 60,
      dayDuration: 180,
      roleDistribution: null
    };
    this.phase = GAME_PHASES.NIGHT;
    this.day = 1;
    this.players = lobbyPlayers.map(p => ({
      ...p,
      role: null,
      isAlive: true,
      hasVoted: false,
      voteTarget: null,
      nightAction: null,
      protected: false,
      lover: null, // สำหรับ Cupid
      hasUsedAbility: false // สำหรับ abilities ที่ใช้ได้ครั้งเดียว
    }));
    this.votes = new Map();
    this.nightActions = new Map();
    this.werewolfVotes = new Map(); // ⭐ เก็บการโหวตของหมาป่าแต่ละตัว
    this.doctorVotes = new Map(); // ⭐ เก็บการโหวตของ Bodyguard แต่ละคน
    this.seerVotes = new Map(); // ⭐ เก็บการโหวตของหมอดูแต่ละคน
    this.witchActions = []; // ⭐ เก็บการใช้ยาของแม่มดทุกคน (แม่มดมียาของตัวเอง)
    this.lastProtectedTargets = new Map(); // ⭐ เก็บว่า Bodyguard แต่ละคนปกป้องใครไปคืนที่แล้ว
    this.phaseTimer = null;
    this.countdownInterval = null; // ⭐ เก็บ countdown interval
    this.gameLog = []; // 📜 เก็บ logs แต่ละคืน/วัน
    this.aiPlayers = new Map();
    this.witchPotions = new Map(); // เก็บยาของแม่มด
    this.hunterRevengeTarget = null;
    this.lovers = []; // เก็บคู่รัก
    this.roleAcknowledgements = new Set(); // เก็บผู้เล่นที่กดยืนยันแล้ว
    this.gameStarted = false; // เกมยังไม่เริ่ม จนกว่าทุกคนจะยืนยัน
    this.wolfCubEffect = false; // ⭐ Wolf Cub effect (ฆ่าได้ 2 คนในคืนถัดไป)
  }

  start() {
    // Assign roles to players
    assignRoles(this.players, this.settings.roleDistribution);

    // Initialize game state flags
    // Wolf Cub effect - ถูกลบออกแล้ว (ใช้ this.wolfCubEffect ตรงๆ)

    // Initialize witch potions
    const witch = this.players.find(p => p.role === ROLES.WITCH);
    if (witch) {
      this.witchPotions.set(witch.id, { heal: true, poison: true });
    }

    // Send role information to each player and initialize AI
    this.players.forEach(player => {
      if (player.isBot) {
        // Initialize AI for bots - บอทยืนยันทันที
        const aiPlayer = new AIPlayer(this, player.id, player.name, player.role);
        this.aiPlayers.set(player.id, aiPlayer);
        this.roleAcknowledgements.add(player.id);
      } else {
        // Send role to human players
        this.io.to(player.id).emit('roleAssigned', {
          role: player.role,
          description: this.getRoleDescription(player.role)
        });
        
        // ⭐ ถ้าเป็นทีมหมาป่า (รวมผู้ทรยศ) ส่งรายชื่อเพื่อนร่วมทีม
        if (this.isWerewolfTeam(player.role)) {
          const teammates = this.getWerewolfTeammates(player.id);
          
          if (teammates.length > 0) {
            this.io.to(player.id).emit('werewolfTeam', {
              teammates: teammates.map(p => ({
                id: p.id,
                name: p.name,
                role: p.role
              }))
            });
          }
        }
      }
    });

    // Broadcast initial game state (แต่ยังไม่เริ่มเฟส)
    this.broadcastGameState();
    
    // ส่งจำนวนคนที่ยืนยันแล้ว
    this.broadcastAcknowledgementStatus();
  }
  
  acknowledgeRole(playerId) {
    this.roleAcknowledgements.add(playerId);
    this.broadcastAcknowledgementStatus();
    
    // ถ้าทุกคนยืนยันแล้ว เริ่มเกม
    if (this.roleAcknowledgements.size === this.players.length && !this.gameStarted) {
      this.gameStarted = true;
      // this.addLog('✅ ทุกคนพร้อมแล้ว!'); // ลบออก
      // this.addLog('🌙 ราตรีมาเยือนหมู่บ้าน...'); // ลบออก
      
      // รอ 1 วินาที แล้วเริ่มเฟสกลางคืน
      setTimeout(() => {
        this.startPhase(GAME_PHASES.NIGHT);
      }, 1000);
    }
  }
  
  broadcastAcknowledgementStatus() {
    const totalPlayers = this.players.length;
    const acknowledgedCount = this.roleAcknowledgements.size;
    
    this.io.to(this.lobbyCode).emit('roleAcknowledgementStatus', {
      total: totalPlayers,
      acknowledged: acknowledgedCount,
      waiting: totalPlayers - acknowledgedCount
    });
  }

  startPhase(phase) {
    this.phase = phase;
    this.votes.clear();
    this.nightActions.clear();
    this.werewolfVotes.clear(); // ⭐ Clear werewolf votes
    this.doctorVotes.clear(); // ⭐ Clear bodyguard votes
    this.seerVotes.clear(); // ⭐ Clear seer votes
    this.witchActions = []; // ⭐ Clear witch actions
    this.cupidActions = []; // ⭐ Clear cupid actions (แต่เก็บ loveNetwork ไว้)
    this.alphaConvertActions = []; // ⭐ Clear alpha convert actions
    // Note: lastProtectedTargets ไม่ clear เพราะต้องจำไว้ข้ามคืน
    // Note: loveNetwork ไม่ clear เพราะเก็บไว้ตลอดเกม
    this.players.forEach(p => {
      p.hasVoted = false;
      p.voteTarget = null;
      p.nightAction = null;
      p.protected = false;
    });

    const duration = phase === GAME_PHASES.NIGHT 
      ? this.settings.nightDuration 
      : this.settings.dayDuration;
    
    this.broadcastGameState();

    if (phase === GAME_PHASES.NIGHT) {
      // ⭐ ตรวจสอบ Wolf Cub effect
      // if (this.wolfCubDied) {
      //   this.addLog(`🌙 คืนที่ ${this.day} เริ่มขึ้น... 🐺💢 หมาป่าโกรธมาก! คืนนี้สามารถฆ่าได้ 2 คน!`);
      // } else {
      //   this.addLog(`🌙 คืนที่ ${this.day} เริ่มขึ้น หมู่บ้านเข้าสู่ความมืด...`);
      // }
      // Trigger AI night actions
      this.triggerAINightActions();
    } else if (phase === GAME_PHASES.DAY) {
      // this.addLog(`☀️ วันที่ ${this.day} เริ่มขึ้น ชาวบ้านมาประชุมกัน...`); // ลบออก
      // Trigger AI voting
      this.triggerAIVoting();
      // Trigger AI chat messages
      this.triggerAIChat();
    }

    // Clear existing timers
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    // Start countdown
    let timeRemaining = duration;
    this.io.to(this.lobbyCode).emit('phaseTimer', { timeRemaining });

    this.countdownInterval = setInterval(() => {
      timeRemaining -= 1;
      this.io.to(this.lobbyCode).emit('phaseTimer', { timeRemaining });

      if (timeRemaining <= 0) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
    }, 1000);

    // Set phase timer
    this.phaseTimer = setTimeout(() => {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      this.endPhase();
    }, duration * 1000);
  }

  // ⭐ Helper function: ตรวจสอบและประมวลผล Love Network deaths
  checkLoveNetworkDeaths(initialKilled) {
    const killedPlayers = [];
    if (!this.loveNetwork || this.loveNetwork.size === 0) {
      return killedPlayers; // ไม่มี Love Network
    }
    
    const toCheck = Array.isArray(initialKilled) ? [...initialKilled] : [initialKilled];
    const alreadyChecked = new Set(toCheck.map(p => p.id));
    
    while (toCheck.length > 0) {
      const killed = toCheck.shift();
      const connections = this.loveNetwork.get(killed.id);
      
      if (connections) {
        // ทุกคนใน Love Network ที่เชื่อมกับคนที่ตาย → ตายตามทันที
        connections.forEach(loverId => {
          if (!alreadyChecked.has(loverId)) {
            const lover = this.players.find(p => p.id === loverId);
            if (lover && lover.isAlive) {
              lover.isAlive = false;
              killedPlayers.push(lover);
              alreadyChecked.add(loverId);
              toCheck.push(lover); // เช็คต่อ (cascade)
              this.addLog(`💘 ${lover.name} ตายตาม (Love Network)`, 'death');
              console.log(`💘 ${lover.name} died due to Love Network (connected to ${killed.name})`);
            }
          }
        });
      }
    }
    
    return killedPlayers;
  }

  triggerAINightActions() {
    this.aiPlayers.forEach((ai, playerId) => {
      const player = this.players.find(p => p.id === playerId);
      if (player && player.isAlive) {
        ai.makeNightAction();
      }
    });
  }

  triggerAIVoting() {
    this.aiPlayers.forEach((ai, playerId) => {
      const player = this.players.find(p => p.id === playerId);
      if (player && player.isAlive) {
        ai.makeVote();
      }
    });
  }

  triggerAIChat() {
    this.aiPlayers.forEach((ai, playerId) => {
      const player = this.players.find(p => p.id === playerId);
      if (player && player.isAlive) {
        ai.sendChatMessage();
      }
    });
  }

  endPhase() {
    if (this.phase === GAME_PHASES.NIGHT) {
      this.resolveNightPhase();
    } else if (this.phase === GAME_PHASES.DAY) {
      this.resolveDayPhase();
    }
  }

  resolveNightPhase() {
    const werewolfKill = this.nightActions.get('werewolf');
    const werewolfKill2 = this.nightActions.get('werewolf2'); // ⭐ Wolf Cub effect
    const alphaConvert = this.nightActions.get('alphaConvert'); // ⭐ Alpha convert
    const bodyguardProtect = this.nightActions.get('bodyguard');
    const seerCheck = this.nightActions.get('seer');
    const witchAction = this.nightActions.get('witch');
    const cupidAction = this.nightActions.get('cupid');

    let killedPlayers = []; // เปลี่ยนเป็น array รองรับหลายคน
    let savedPlayer = null;
    let poisonedPlayer = null;
    let hasRoleConversion = false; // ⭐ เช็คว่ามีคนถูกกัดเป็นหมาป่าหรือไม่

    // 💘 Process Cupid couples - รองรับ Love Network (หลาย Cupid)
    if (this.cupidActions && this.cupidActions.length > 0) {
      // ⭐ สร้าง Love Network: ถ้า Cupid 1 จับ A-B, Cupid 2 จับ A-C → A, B, C เชื่อมกัน
      const loveGraph = new Map(); // playerId -> Set of connected playerIds
      
      this.cupidActions.forEach(action => {
        const { cupidId, lover1, lover2 } = action;
        
        if (!loveGraph.has(lover1)) loveGraph.set(lover1, new Set());
        if (!loveGraph.has(lover2)) loveGraph.set(lover2, new Set());
        
        loveGraph.get(lover1).add(lover2);
        loveGraph.get(lover2).add(lover1);
        
        // ⭐ บันทึก log สำหรับ Cupid (เฉพาะคนที่ยังมีชีวิต)
        const cupid = this.players.find(p => p.id === cupidId);
        const player1 = this.players.find(p => p.id === lover1);
        const player2 = this.players.find(p => p.id === lover2);
        if (cupid && player1 && player2 && player1.isAlive && player2.isAlive) {
          this.addLog(`💘 ${cupid.name} (คิวปิด) จับคู่ ${player1.name} ↔ ${player2.name}`, 'cupid');
        }
        
        console.log(`💘 Cupid paired: ${lover1} ↔ ${lover2}`);
      });
      
      // แจ้งคู่รักทุกคนว่ามีใครบ้างในเครือข่าย (Love Network)
      loveGraph.forEach((connections, playerId) => {
        const player = this.players.find(p => p.id === playerId);
        if (player && !player.isBot) {
          const loverNames = Array.from(connections).map(loverId => {
            const lover = this.players.find(p => p.id === loverId);
            return lover ? lover.name : 'Unknown';
          });
          
          this.io.to(playerId).emit('loverInfo', { 
            loverName: loverNames.join(', '),
            loveNetwork: Array.from(connections)
          });
        }
      });
      
      // บันทึก Love Network ไว้ใน game state
      this.loveNetwork = loveGraph;
      console.log('💘 Love Network created:', Array.from(loveGraph.entries()));
    }

    // 🛡️ Process Bodyguard protection - ปกป้องหลายคนตามจำนวน Bodyguard
    // ⭐ แต่ละ Bodyguard ปกป้องคนของตัวเอง (ถ้าเลือกซ้ำกัน = ปกป้องแค่คนเดียว)
    if (this.doctorVotes.size > 0) {
      const protectedPlayerIds = new Set(this.doctorVotes.values());
      
      // ⭐ บันทึก log สำหรับแต่ละ Bodyguard
      this.doctorVotes.forEach((targetId, bodyguardId) => {
        const bodyguard = this.players.find(p => p.id === bodyguardId);
        const target = this.players.find(p => p.id === targetId);
        
        // ⚠️ Debug: แสดงข้อมูลทั้งหมด
        console.log(`🛡️ Bodyguard Log Debug:`, {
          bodyguardId,
          bodyguardName: bodyguard?.name,
          targetId,
          targetIdType: typeof targetId,
          targetName: target?.name,
          allPlayerIds: this.players.map(p => ({ id: p.id, name: p.name, idType: typeof p.id }))
        });
        
        if (bodyguard && target) {
          this.addLog(`🛡️ ${bodyguard.name} (บอดี้การ์ด) ปกป้อง ${target.name}`, 'protect');
        } else if (bodyguard) {
          // ⚠️ ถ้าหา target ไม่เจอ = แสดง ID
          const targetPlayer = this.players.find(p => p.id == targetId); // ใช้ == (loose comparison)
          if (targetPlayer) {
            this.addLog(`🛡️ ${bodyguard.name} (บอดี้การ์ด) ปกป้อง ${targetPlayer.name}`, 'protect');
          } else {
            this.addLog(`🛡️ ${bodyguard.name} (บอดี้การ์ด) ปกป้อง [ID: ${targetId}]`, 'protect');
          }
        }
      });
      
      protectedPlayerIds.forEach(targetId => {
        const protectedPlayer = this.players.find(p => p.id === targetId);
        if (protectedPlayer) {
          protectedPlayer.protected = true;
          console.log(`🛡️ ${protectedPlayer.name} is protected by Bodyguard(s)`);
        }
      });
    }

    // 🧙‍♀️ Process Witch heal (ปกป้อง) - ก่อนการฆ่า
    if (this.witchActions.length > 0) {
      this.witchActions.forEach(witchAction => {
        if (witchAction.type === 'heal') {
          const witch = this.players.find(p => p.id === witchAction.witchId);
          const healTarget = this.players.find(p => p.id === witchAction.targetId);
          if (healTarget && healTarget.isAlive) {
            healTarget.protected = true;
            console.log(`🧙‍♀️ ${healTarget.name} is protected by Witch`);
            
            // ⭐ บันทึก log สำหรับ Witch heal
            if (witch) {
              this.addLog(`🧙‍♀️ ${witch.name} (แม่มด) ใช้ยารักษา ${healTarget.name}`, 'heal');
            }
            
            // ⭐ ไม่ต้อง update potions ที่นี่แล้ว - update ทันทีตอน submit action
          }
        }
      });
    } else if (witchAction && witchAction.type === 'heal') {
      // Backward compatibility
      const healTarget = this.players.find(p => p.id === witchAction.targetId);
      if (healTarget && healTarget.isAlive) {
        healTarget.protected = true;
        const witch = this.players.find(p => p.role === ROLES.WITCH);
        if (witch) {
          this.addLog(`🧙‍♀️ ${witch.name} (แม่มด) ใช้ยารักษา ${healTarget.name}`, 'heal');
          const potions = this.witchPotions.get(witch.id);
          if (potions) {
            potions.heal = false;
            this.witchPotions.set(witch.id, potions);
          }
        }
      }
    }

    // 👑🐺🔄 Process Alpha Werewolf convert - รองรับหลาย Alpha Wolf
    if (this.alphaConvertActions && this.alphaConvertActions.length > 0) {
      this.alphaConvertActions.forEach(convertAction => {
        const targetPlayer = this.players.find(p => p.id === convertAction.targetId);
        
        if (targetPlayer && targetPlayer.isAlive && ROLE_TEAMS[targetPlayer.role] !== 'werewolves') {
          const oldRole = targetPlayer.role;
          targetPlayer.role = ROLES.WEREWOLF;
          hasRoleConversion = true; // ⭐ มีคนถูกกัด
          
          // แจ้งผู้เล่นที่ถูกแปลงว่าเปลี่ยนเป็นหมาป่าแล้ว
          if (!targetPlayer.isBot) {
            this.io.to(targetPlayer.id).emit('roleChanged', {
              newRole: ROLES.WEREWOLF,
              message: '🐺 คุณถูกกัดโดยอัลฟ่าหมาป่า! ตอนนี้คุณเป็นหมาป่าแล้ว'
            });
            
            // ส่งรายชื่อเพื่อนหมาป่าให้ผู้เล่นที่ถูกแปลง
            const teammates = this.getWerewolfTeammates(targetPlayer.id);
            if (teammates.length > 0) {
              this.io.to(targetPlayer.id).emit('werewolfTeam', {
                teammates: teammates.map(p => ({
                  id: p.id,
                  name: p.name,
                  role: p.role
                }))
              });
            }
          }
          
          // ⭐ แจ้งหมาป่าตัวอื่นๆ ว่ามีสมาชิกใหม่
          const allWerewolves = this.players.filter(p => 
            p.isAlive && 
            this.isWerewolfTeam(p.role) && 
            p.id !== targetPlayer.id
          );
          
          allWerewolves.forEach(wolf => {
            if (!wolf.isBot) {
              const updatedTeammates = this.getWerewolfTeammates(wolf.id);
              this.io.to(wolf.id).emit('werewolfTeam', {
                teammates: updatedTeammates.map(p => ({
                  id: p.id,
                  name: p.name,
                  role: p.role
                }))
              });
            }
          });
          
          const alpha = this.players.find(p => p.id === convertAction.alphaId);
          if (alpha) {
            this.addLog(`👑🐺 ${alpha.name} (อัลฟ่าหมาป่า) กัด ${targetPlayer.name} → กลายเป็นหมาป่า (เดิม: ${oldRole})`, 'convert');
          } else {
            this.addLog(`🐺 ${targetPlayer.name} ถูกกัดและกลายเป็นหมาป่า...`, 'convert');
          }
          console.log(`👑🐺 ${targetPlayer.name} converted from ${oldRole} to ${ROLES.WEREWOLF}`);
        }
      });
    }

    // 🐺 Process Werewolf kill (รองรับ Wolf Cub effect)
    if (werewolfKill) {
      const targetPlayer = this.players.find(p => p.id === werewolfKill);
      if (targetPlayer && !targetPlayer.protected && targetPlayer.isAlive) {
        targetPlayer.isAlive = false;
        killedPlayers.push(targetPlayer);
        this.addLog(`🐺 หมาป่าโจมตี ${targetPlayer.name} (${targetPlayer.role})`, 'death');
        
        // ⭐ ตรวจสอบว่าเป็น Wolf Cub หรือไม่ → เปิด effect ถาวร
        if (targetPlayer.role === ROLES.WOLF_CUB) {
          this.wolfCubEffect = true;
          console.log('🐺💀 Wolf Cub died! Werewolves can kill 2 people every night from now on!');
        }
      } else if (targetPlayer && targetPlayer.protected) {
        savedPlayer = targetPlayer;
        // ⭐ บันทึก log ว่าหมาป่าพยายามโจมตี แต่ถูกปกป้อง
        this.addLog(`🐺 หมาป่าโจมตี ${targetPlayer.name}`, 'info');
        this.addLog(`🛡️ ${targetPlayer.name} รอดชีวิต! (ถูกปกป้อง)`, 'protect');
      }
    }
    
    // ⭐ Process second Werewolf kill (Wolf Cub effect) - เกิดทุกคืนหลัง Wolf Cub ตาย
    if (werewolfKill2 && this.wolfCubEffect) {
      const targetPlayer2 = this.players.find(p => p.id === werewolfKill2);
      if (targetPlayer2 && !targetPlayer2.protected && targetPlayer2.isAlive) {
        targetPlayer2.isAlive = false;
        killedPlayers.push(targetPlayer2);
        this.addLog(`🐺💢 หมาป่าโจมตี ${targetPlayer2.name} คนที่ 2! (Wolf Cub Effect)`, 'death');
      }
      
      // ⭐ ไม่ reset Wolf Cub effect → ฆ่าได้ 2 คนทุกคืนจนจบเกม
      console.log('🐺💢 Wolf Cub effect active - werewolves can kill 2 people every night');
    }

    // 🧙‍♀️ Process Witch poison (ฆ่า) - หลังการฆ่าของหมาป่า
    if (this.witchActions.length > 0) {
      this.witchActions.forEach(witchAction => {
        if (witchAction.type === 'poison') {
          // ใช้ยาพิษ
          const poisonTarget = this.players.find(p => p.id === witchAction.targetId);
          if (poisonTarget && poisonTarget.isAlive) {
            poisonTarget.isAlive = false;
            killedPlayers.push(poisonTarget);
            poisonedPlayer = poisonTarget;
            this.addLog(`🧙‍♀️ แม่มดใช้ยาพิษกับ ${poisonTarget.name} (${poisonTarget.role})`, 'poison');
            
            // ⭐ ตรวจสอบว่าเป็น Wolf Cub หรือไม่ (ถูก Witch ฆ่า) → เปิด effect ถาวร
            if (poisonTarget.role === ROLES.WOLF_CUB) {
              this.wolfCubEffect = true;
              console.log('🐺💀 Wolf Cub poisoned by Witch! Werewolves can kill 2 people every night from now on!');
            }
            
            // ⭐ ไม่ต้อง update potions ที่นี่แล้ว - update ทันทีตอน submit action
          }
        }
      });
    } else if (witchAction && witchAction.type === 'poison') {
      // Backward compatibility - poison only
      const poisonTarget = this.players.find(p => p.id === witchAction.targetId);
      if (poisonTarget && poisonTarget.isAlive) {
        poisonTarget.isAlive = false;
        killedPlayers.push(poisonTarget);
        poisonedPlayer = poisonTarget;
        this.addLog(`🧙‍♀️ แม่มดใช้ยาพิษกับ ${poisonTarget.name} (${poisonTarget.role})`, 'poison');
        
        // ⭐ ตรวจสอบว่าเป็น Wolf Cub หรือไม่ (ถูก Witch ฆ่า) → เปิด effect ถาวร
        if (poisonTarget.role === ROLES.WOLF_CUB) {
          this.wolfCubEffect = true;
          console.log('🐺💀 Wolf Cub poisoned by Witch! Werewolves can kill 2 people every night from now on!');
        }
        
        const witch = this.players.find(p => p.role === ROLES.WITCH);
        if (witch) {
          const potions = this.witchPotions.get(witch.id);
          if (potions) {
            potions.poison = false;
            this.witchPotions.set(witch.id, potions);
          }
        }
      }
    }

    // 💘 Check lover deaths - รองรับ Love Network
    const loveNetworkDeaths = this.checkLoveNetworkDeaths(killedPlayers);
    killedPlayers.push(...loveNetworkDeaths);

    // 🔮 Process Seer check
    if (seerCheck) {
      const seer = this.players.find(p => p.role === ROLES.SEER);
      const checkedPlayer = this.players.find(p => p.id === seerCheck);
      
      console.log('🔮 Seer Check:', {
        seerId: seer?.id,
        seerName: seer?.name,
        checkedPlayerId: checkedPlayer?.id,
        checkedPlayerName: checkedPlayer?.name,
        checkedPlayerRole: checkedPlayer?.role
      });
      
      if (seer && checkedPlayer) {
        // ⭐ ใช้ ROLE_TEAMS แทนการเช็คตรงๆ (Traitor จะดูเป็นคนดี)
        const playerTeam = ROLE_TEAMS[checkedPlayer.role];
        let isWerewolf = playerTeam === 'werewolves';
        
        // ⭐ Traitor พิเศษ - ดูเป็นคนดี!
        if (checkedPlayer.role === ROLES.TRAITOR) {
          isWerewolf = false;
        }
        
        console.log('🔮 Seer Result:', {
          playerName: checkedPlayer.name,
          role: checkedPlayer.role,
          team: playerTeam,
          isWerewolf
        });
        
        // ⭐ บันทึก log ว่าหมอดูตรวจสอบใคร
        this.addLog(`🔮 หมอดูตรวจสอบ ${checkedPlayer.name} → ${isWerewolf ? '❌ คนไม่ดี' : '✅ คนดี'} (จริง: ${checkedPlayer.role})`, 'inspect');
        
        // ⭐ ผลถูกส่งไปแล้วทันทีตอน handleNightAction
        // ส่วนนี้เหลือแค่ log
        console.log('✅ Seer result was already sent instantly in handleNightAction');
      } else {
        console.log('❌ Seer or checked player not found!');
      }

    }

    // 📊 Log results
    // ⭐ ไม่ต้อง log ซ้ำ เพราะ log ไปแล้วตอนฆ่า

    // Broadcast night results
    this.io.to(this.lobbyCode).emit('nightResults', {
      killedPlayers: killedPlayers.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role
      }))
    });

    // ⭐ Check if Hunters were killed during night - รองรับหลาย Hunter
    const huntersKilled = killedPlayers.filter(p => p.role === ROLES.HUNTER);
    if (huntersKilled.length > 0) {
      let hasHumanHunter = false;
      
      huntersKilled.forEach(hunterKilled => {
        this.addLog(`🏹 ${hunterKilled.name} เป็นนักล่า! ยิงก่อนตาย`, 'info');
        
        if (hunterKilled.isBot) {
          // AI Hunter จะเลือกเป้าหมายอัตโนมัติ
          const alivePlayers = this.players.filter(p => p.isAlive && p.id !== hunterKilled.id);
          if (alivePlayers.length > 0) {
            const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            randomTarget.isAlive = false;
            this.addLog(`🏹 นักล่า ${hunterKilled.name} ยิง ${randomTarget.name} (${randomTarget.role})`, 'death');
            
            // 💘 Check Love Network deaths
            const loveNetworkDeaths = this.checkLoveNetworkDeaths([randomTarget]);
            
            // Broadcast updated state
            this.broadcastGameState();
          }
        } else {
          // Human Hunter - ให้เลือกเอง
          hasHumanHunter = true;
          this.io.to(hunterKilled.id).emit('hunterRevenge', {
            alivePlayers: this.players.filter(p => p.isAlive).map(p => ({
              id: p.id,
              name: p.name
            }))
          });
        }
      });
      
      // ⭐ ถ้ามี Human Hunter ให้รอก่อน
      if (hasHumanHunter) {
        return; // รอให้ Hunter ยิงก่อน
      }
    }

    // Check win condition
    if (this.checkWinCondition()) {
      return;
    }

    // ⭐ Move to Day phase - ถ้ามีคนถูกกัด รอให้ modal แสดงก่อน (3 วินาที)
    if (hasRoleConversion) {
      console.log('⏱️ Delaying day phase for role conversion modal...');
      setTimeout(() => {
        this.startPhase(GAME_PHASES.DAY);
      }, 3000); // รอ 3 วินาที (modal แสดง 2 วินาที + buffer 1 วินาที)
    } else {
      this.startPhase(GAME_PHASES.DAY);
    }
  }

  resolveDayPhase() {
    // Count votes - นับทุกโหวต รวมทั้ง skip
    const voteCounts = new Map();
    const alivePlayers = this.players.filter(p => p.isAlive);
    const totalVotes = alivePlayers.length;
    
    console.log('📊 Vote Counting:', {
      totalAlivePlayers: totalVotes,
      votes: Array.from(this.votes.entries())
    });

    // ⭐ นับคะแนนทุกตัวเลือก (รวม skip)
    this.votes.forEach((targetId, voterId) => {
      const count = (voteCounts.get(targetId) || 0) + 1;
      voteCounts.set(targetId, count);
    });
    
    // ⭐ คนที่ไม่โหวต = skip อัตโนมัติ
    const votedPlayers = this.votes.size;
    const notVotedCount = totalVotes - votedPlayers;
    if (notVotedCount > 0) {
      const currentSkipCount = voteCounts.get('skip') || 0;
      voteCounts.set('skip', currentSkipCount + notVotedCount);
      console.log(`⏭️ ${notVotedCount} คนไม่โหวต → ถือเป็น skip`);
    }
    
    console.log('📊 Vote Results (รวม auto-skip):', Array.from(voteCounts.entries()));

    // หาตัวเลือกที่ได้เสียงสูงสุด (รองรับกรณีเสมอกัน)
    let maxVotes = 0;
    let candidates = []; // เก็บผู้ที่ได้คะแนนเท่ากัน
    
    voteCounts.forEach((count, targetId) => {
      if (count > maxVotes) {
        maxVotes = count;
        candidates = [targetId]; // เริ่มต้น candidates ใหม่
      } else if (count === maxVotes) {
        candidates.push(targetId); // เพิ่มผู้เสมอกัน
      }
    });
    
    // ⭐ ถ้าเสมอกัน (มากกว่า 1 คน) = ไม่มีใครตาย
    const winner = candidates.length === 1 ? candidates[0] : null;
    
    console.log('📊 Vote result:', {
      maxVotes,
      candidates,
      winner,
      isTie: candidates.length > 1,
      skipVotes: voteCounts.get('skip') || 0,
      message: candidates.length > 1 ? 'Tie - no one eliminated' : `Winner: ${winner}`
    });

    let eliminatedPlayerId = null;
    
    // ⭐ เช็คว่า skip ชนะหรือไม่
    if (winner === 'skip') {
      console.log('⏭️ Skip ได้คะแนนสูงสุด - ไม่มีใครตาย');
      this.addLog(`⏭️ ไม่มีใครถูกกำจัด (Skip: ${maxVotes} เสียง)`, 'vote');
    } else if (winner && winner !== 'skip') {
      // ⭐ ไม่ต้องเช็ค majority แล้ว แค่ชนะ skip ก็พอ
      eliminatedPlayerId = winner;
      const skipVotes = voteCounts.get('skip') || 0;
      console.log(`✅ Player eliminated: ${eliminatedPlayerId} (${maxVotes} votes > skip: ${skipVotes})`);
    } else if (candidates.length > 1) {
      console.log('❌ Tie - ไม่มีใครตาย');
    } else {
      console.log('❌ No votes - ไม่มีใครตาย');
    }

    let eliminatedPlayer = null;
    let hunterKill = null;

    if (eliminatedPlayerId && maxVotes > 0) {
      eliminatedPlayer = this.players.find(p => p.id === eliminatedPlayerId);
      if (eliminatedPlayer) {
        eliminatedPlayer.isAlive = false;
        
        // ⭐ ส่ง gameState อัปเดตทันทีให้คนเห็นว่าตาย
        this.broadcastGameState();
        
        // ⭐ บันทึกการโหวต
        this.addLog(`⚖️ ${eliminatedPlayer.name} ถูกโหวต ${maxVotes} เสียง (${eliminatedPlayer.role})`, 'vote');
        
        // ⭐ ตรวจสอบว่าเป็น Wolf Cub หรือไม่ (ถูกโหวตตาย)
        if (eliminatedPlayer.role === ROLES.WOLF_CUB) {
          this.wolfCubEffect = true;
          console.log('🐺💀 Wolf Cub eliminated by vote! wolfCubEffect = true for next night');
        }
        
        // ⭐ Check if Fool was eliminated
        if (eliminatedPlayer.role === ROLES.FOOL) {
          this.addLog(`🤡 ${eliminatedPlayer.name} คือตัวตลก! หมู่บ้านทำผิดพลาด`, 'info');
          
          // Fool ชนะคนเดียว - เกมจบทันที
          this.endGame('fool', eliminatedPlayer);
          return; // ⭐ จบ function ทันที
        }
        
        // ⭐ Check if Hunter was eliminated
        if (eliminatedPlayer.role === ROLES.HUNTER) {
          // Hunter ยิงคนหนึ่งก่อนตาย
          this.addLog(`🏹 ${eliminatedPlayer.name} เป็นนักล่า! ยิงก่อนตาย`, 'info');
          
          // AI Hunter จะเลือกเป้าหมายอัตโนมัติ
          if (eliminatedPlayer.isBot) {
            const alivePlayers = this.players.filter(p => p.isAlive && p.id !== eliminatedPlayer.id);
            if (alivePlayers.length > 0) {
              const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
              randomTarget.isAlive = false;
              hunterKill = randomTarget;
              this.addLog(`🏹 นักล่ายิง ${randomTarget.name} (${randomTarget.role})`, 'death');
              
              // ⭐ อัปเดต gameState ให้เห็นคนที่ถูกยิง
              this.broadcastGameState();
              
            // 💘 Check Love Network deaths (ตอนกลางคืน Night Hunter ยิง)
            const loveNetworkDeaths = this.checkLoveNetworkDeaths([randomTarget]);
            if (loveNetworkDeaths.length > 0) {
              this.broadcastGameState();
              
              // ⭐ เช็คว่ามี Hunter ใน Love Network deaths หรือไม่
              const huntersInNetwork = loveNetworkDeaths.filter(p => p.role === ROLES.HUNTER);
              huntersInNetwork.forEach(hunter => {
                this.addLog(`🏹 ${hunter.name} เป็นนักล่า! ยิงก่อนตาย (Love Network)`, 'info');
                
                if (hunter.isBot) {
                  const alivePlayers = this.players.filter(p => p.isAlive && p.id !== hunter.id);
                  if (alivePlayers.length > 0) {
                    const hunterTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                    hunterTarget.isAlive = false;
                    this.addLog(`🏹 นักล่า ${hunter.name} ยิง ${hunterTarget.name}`, 'death');
                    this.checkLoveNetworkDeaths([hunterTarget]);
                    this.broadcastGameState();
                  }
                } else {
                  this.io.to(hunter.id).emit('hunterRevenge', {
                    alivePlayers: this.players.filter(p => p.isAlive).map(p => ({
                      id: p.id,
                      name: p.name
                    }))
                  });
                }
              });
            }
            }
          } else {
            // Human Hunter - ให้เลือกเอง (ส่ง event พิเศษ)
            this.io.to(eliminatedPlayer.id).emit('hunterRevenge', {
              alivePlayers: this.players.filter(p => p.isAlive).map(p => ({
                id: p.id,
                name: p.name
              }))
            });
            // Note: จะต้องมี event handler สำหรับ hunterShoot ด้วย
          }
        }

        // 💘 Check Love Network deaths
        const loveNetworkDeaths = this.checkLoveNetworkDeaths([eliminatedPlayer]);
        if (loveNetworkDeaths.length > 0) {
          this.broadcastGameState();
          
          // ⭐ เช็คว่ามี Hunter ใน Love Network deaths หรือไม่
          const huntersInNetwork = loveNetworkDeaths.filter(p => p.role === ROLES.HUNTER);
          huntersInNetwork.forEach(hunter => {
            this.addLog(`🏹 ${hunter.name} เป็นนักล่า! ยิงก่อนตาย (Love Network)`, 'info');
            
            if (hunter.isBot) {
              const alivePlayers = this.players.filter(p => p.isAlive && p.id !== hunter.id);
              if (alivePlayers.length > 0) {
                const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                randomTarget.isAlive = false;
                this.addLog(`🏹 นักล่า ${hunter.name} ยิง ${randomTarget.name} (${randomTarget.role})`, 'death');
                
                // 💘 Check cascade Love Network deaths
                const cascadeDeaths = this.checkLoveNetworkDeaths([randomTarget]);
                this.broadcastGameState();
              }
            } else {
              this.io.to(hunter.id).emit('hunterRevenge', {
                alivePlayers: this.players.filter(p => p.isAlive).map(p => ({
                  id: p.id,
                  name: p.name
                }))
              });
            }
          });
        }
      }
    } // else {
      // this.addLog('⚖️ ไม่มีใครถูกกำจัด หมู่บ้านยังลังเลใจ...'); // ลบออก
    // }

    // Broadcast day results
    this.io.to(this.lobbyCode).emit('dayResults', {
      eliminatedPlayer: eliminatedPlayer ? {
        id: eliminatedPlayer.id,
        name: eliminatedPlayer.name,
        role: eliminatedPlayer.role
      } : null,
      votes: Array.from(this.votes.entries()).map(([voterId, targetId]) => ({
        voter: this.players.find(p => p.id === voterId)?.name,
        target: targetId === 'skip' ? 'SKIP' : this.players.find(p => p.id === targetId)?.name
      }))
    });

    // Check win condition
    if (this.checkWinCondition()) {
      return;
    }

    // Move to next Night phase
    this.day++;
    this.startPhase(GAME_PHASES.NIGHT);
  }

  handleNightAction(playerId, action) {
    const player = this.players.find(p => p.id === playerId);
    
    console.log('🌙 handleNightAction called:', {
      playerId,
      playerName: player?.name,
      playerRole: player?.role,
      action,
      phase: this.phase,
      isAlive: player?.isAlive
    });
    
    if (!player || !player.isAlive || this.phase !== GAME_PHASES.NIGHT) {
      console.log('❌ Night action rejected:', {
        playerExists: !!player,
        isAlive: player?.isAlive,
        correctPhase: this.phase === GAME_PHASES.NIGHT
      });
      return;
    }

    // รองรับบทบาทต่างๆ
    const team = ROLE_TEAMS[player.role];
    
    if (team === 'werewolves' && player.role !== ROLES.TRAITOR && player.role !== ROLES.ALPHA_WEREWOLF) {
      // Werewolf, Wolf Cub ฆ่าร่วมกัน - ใช้ระบบโหวต
      console.log('🐺 Werewolf vote:', action);
      
      // ⭐ ตรวจสอบว่าไม่ใช่การฆ่าหมาป่าด้วยกัน (รวม Wolf Cub, Alpha Wolf)
      const target = this.players.find(p => p.id === action.targetId);
      if (target && ROLE_TEAMS[target.role] === 'werewolves') {
        console.log('❌ Werewolves cannot kill each other! (including Wolf Cub)', target.role);
        if (!player.isBot) {
          this.io.to(playerId).emit('error', { 
            message: `⚠️ ไม่สามารถโจมตีพวกเดียวกันได้! (${target.name} เป็นหมาป่า)`
          });
        }
        return;
      }
      
      // ⭐ เมื่อ Wolf Cub Effect เปิด ให้หมาป่าเลือกได้ 2 คน
      if (this.wolfCubEffect && action.targetId2) {
        // เช็คคนที่ 2 ด้วย
        const target2 = this.players.find(p => p.id === action.targetId2);
        if (target2 && ROLE_TEAMS[target2.role] === 'werewolves') {
          console.log('❌ Werewolves cannot kill each other! (2nd target)', target2.role);
          if (!player.isBot) {
            this.io.to(playerId).emit('error', { 
              message: `⚠️ ไม่สามารถโจมตีพวกเดียวกันได้! (${target2.name} เป็นหมาป่า)`
            });
          }
          return;
        }
      }
      
      // ⭐ บันทึกการโหวตของหมาป่าแต่ละตัว (รองรับ 2 คนถ้า Wolf Cub Effect)
      if (this.wolfCubEffect && action.targetId2) {
        // เก็บเป็น array [target1, target2]
        this.werewolfVotes.set(playerId, [action.targetId, action.targetId2]);
        console.log(`🐺💢 Wolf ${player.name} votes for 2 targets:`, [action.targetId, action.targetId2]);
      } else {
        this.werewolfVotes.set(playerId, action.targetId);
        console.log(`🐺 Wolf ${player.name} votes for:`, action.targetId);
      }
      
      // นับคะแนนโหวต (รวมทั้ง 2 คนถ้ามี Wolf Cub Effect)
      const voteCounts = new Map();
      this.werewolfVotes.forEach(vote => {
        if (Array.isArray(vote)) {
          // ถ้าเป็น array [target1, target2]
          vote.forEach(targetId => {
            voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
          });
        } else {
          // ถ้าเป็น targetId เดียว
          voteCounts.set(vote, (voteCounts.get(vote) || 0) + 1);
        }
      });
      
      // ⭐ หาคนที่ได้คะแนนสูงสุด
      const sortedVotes = Array.from(voteCounts.entries())
        .sort((a, b) => b[1] - a[1]); // เรียงจากมากไปน้อย
      
      if (sortedVotes.length > 0) {
        // คนที่ 1 (ได้คะแนนมากที่สุด)
        const topTarget = sortedVotes[0][0];
        this.nightActions.set('werewolf', topTarget);
        console.log(`🐺 Werewolf target #1: ${topTarget} (${sortedVotes[0][1]} votes)`);
        
        // ⭐ ถ้า Wolf Cub Effect เปิด ให้เลือกคนที่ 2
        if (this.wolfCubEffect && sortedVotes.length > 1) {
          const secondTarget = sortedVotes[1][0];
          this.nightActions.set('werewolf2', secondTarget);
          console.log(`🐺💢 Werewolf target #2 (Wolf Cub Effect): ${secondTarget} (${sortedVotes[1][1]} votes)`);
        } else if (this.wolfCubEffect && sortedVotes.length === 1) {
          // ถ้าโหวตแค่คนเดียว แต่ต้องฆ่า 2 คน ให้สุ่มคนที่ 2
          const aliveNonWerewolves = this.players.filter(p => 
            p.isAlive && 
            p.id !== topTarget && 
            ROLE_TEAMS[p.role] !== 'werewolves'
          );
          
          if (aliveNonWerewolves.length > 0) {
            const randomSecond = aliveNonWerewolves[Math.floor(Math.random() * aliveNonWerewolves.length)];
            this.nightActions.set('werewolf2', randomSecond.id);
            console.log(`🐺💢 Werewolf target #2 (random): ${randomSecond.id}`);
          }
        }
      }
      
      // ⭐ ส่งข้อมูลการโหวตให้หมาป่าทุกตัวเห็น
      this.broadcastWerewolfVotes();
    } else if (player.role === ROLES.BODYGUARD) {
      console.log('🛡️ Bodyguard protect:', action.targetId);
      
      // ⭐ ตรวจสอบว่าไม่ปกป้องคนเดิม 2 คืนติดกัน (ตรวจแค่ตัวเอง)
      const lastProtected = this.lastProtectedTargets.get(playerId);
      if (lastProtected === action.targetId) {
        console.log(`🛡️ Bodyguard ${player.name} tried to protect ${action.targetId} again - NOT ALLOWED`);
        if (!player.isBot) {
          this.io.to(playerId).emit('error', { 
            message: 'ไม่สามารถปกป้องคนเดิม 2 คืนติดกันได้' 
          });
        }
        return;
      }
      
      // ⭐ แต่ละ Bodyguard ปกป้องคนของตัวเอง (ไม่ใช้โหวต)
      // เก็บเป็น Map: bodyguardId -> targetId
      this.doctorVotes.set(playerId, action.targetId);
      
      // บันทึก lastProtected ของตัวเอง
      this.lastProtectedTargets.set(playerId, action.targetId);
      
      console.log(`🛡️ Bodyguard ${player.name} will protect: ${action.targetId}`);
      
    } else if (player.role === ROLES.SEER) {
      console.log('🔮 Seer inspect:', action.targetId);
      
      // ⭐ แต่ละ Seer เลือกคนของตัวเอง ไม่ใช้ระบบโหวต
      const targetId = action.targetId;
      const checkedPlayer = this.players.find(p => p.id === targetId);
      
      if (checkedPlayer) {
        const playerTeam = ROLE_TEAMS[checkedPlayer.role];
        let isWerewolf = playerTeam === 'werewolves';
        
        // ⭐ Traitor พิเศษ - ดูเป็นคนดี!
        if (checkedPlayer.role === ROLES.TRAITOR) {
          isWerewolf = false;
        }
        
        console.log('🔮 Seer Result:', {
          seerName: player.name,
          checkedName: checkedPlayer.name,
          checkedRole: checkedPlayer.role,
          team: playerTeam,
          isWerewolf
        });
        
        // ⭐ ส่งผลให้แค่ Seer คนนี้เท่านั้น (ไม่ส่งให้ Seer คนอื่น)
        if (!player.isBot) {
          this.io.to(playerId).emit('seerResult', {
            playerName: checkedPlayer.name,
            isWerewolf
          });
        }
        
        // บันทึก action สำหรับ log
        this.nightActions.set(`seer_${playerId}`, targetId);
      }
    } else if (player.role === ROLES.WITCH) {
      // ⭐ เช็คว่า Witch ใช้ยาในคืนนี้ไปแล้วหรือยัง (ใช้ได้ทีละขวดต่อคืน)
      const hasUsedPotionThisNight = this.witchActions.some(w => w.witchId === player.id);
      if (hasUsedPotionThisNight) {
        if (!player.isBot) {
          this.io.to(player.id).emit('error', { message: 'คุณใช้ยาไปแล้วในคืนนี้ (ใช้ได้ทีละขวดต่อคืน)' });
        }
        console.log(`🧙‍♀️ Witch ${player.name} already used a potion this night`);
        return;
      }
      
      // ตรวจสอบว่ายังมียาที่เลือกใช้หรือไม่
      const potions = this.witchPotions.get(player.id) || { heal: false, poison: false };
      if ((action.type === 'heal' && potions.heal) || (action.type === 'poison' && potions.poison)) {
        console.log('🧙‍♀️ Witch action:', action);
        // เพิ่มเข้า array แทนการใช้ set (รองรับแม่มดหลายคน)
        this.witchActions.push({ witchId: player.id, ...action });
        this.nightActions.set('witch', action); // เก็บไว้เพื่อ backward compatibility
        
        // ⭐ Update potion status ทันที เพื่อป้องกันการใช้ซ้ำในเกม
        if (action.type === 'heal') {
          potions.heal = false;
        } else if (action.type === 'poison') {
          potions.poison = false;
        }
        this.witchPotions.set(player.id, potions);
        
        // ส่ง update กลับไปให้ client
        this.io.to(player.id).emit('witchPotionsUpdate', { potions });
        console.log(`🧙‍♀️ Witch ${player.name} used ${action.type}, potions updated:`, potions);
      } else {
        // ยาหมดแล้ว
        if (!player.isBot) {
          this.io.to(player.id).emit('error', { message: 'คุณไม่มียานี้เหลือแล้ว' });
        }
        console.log(`🧙‍♀️ Witch ${player.name} has no ${action.type} potion left`);
      }
    } else if (player.role === ROLES.CUPID && !player.hasUsedAbility) {
      // ⭐ Cupid ใช้ได้ครั้งเดียว - เก็บเป็น array เพื่อรองรับหลาย Cupid
      console.log('💘 Cupid couple:', action);
      if (!this.cupidActions) {
        this.cupidActions = [];
      }
      this.cupidActions.push({
        cupidId: player.id,
        lover1: action.lover1,
        lover2: action.lover2
      });
      player.hasUsedAbility = true;
      console.log(`💘 Cupid ${player.name} paired: ${action.lover1} with ${action.lover2}`);
    } else if (player.role === ROLES.ALPHA_WEREWOLF) {
      // ⭐ Alpha Werewolf เลือกได้ว่าจะ kill หรือ convert (กัดให้เป็นหมาป่า)
      console.log('👑🐺 Alpha Werewolf action:', action);
      
      const target = this.players.find(p => p.id === action.targetId);
      
      if (!target || !target.isAlive) {
        console.log('❌ Invalid target for Alpha Werewolf!');
        return;
      }
      
      // ตรวจสอบว่าเป้าหมายไม่ใช่หมาป่าอยู่แล้ว
      if (ROLE_TEAMS[target.role] === 'werewolves') {
        console.log('❌ Alpha Werewolf cannot target other werewolves!');
        if (!player.isBot) {
          this.io.to(playerId).emit('error', { 
            message: 'ไม่สามารถเลือกหมาป่าด้วยกันได้' 
          });
        }
        return;
      }
      
      if (action.type === 'kill') {
        // ⭐ ฆ่าผู้เล่น - รวมกับหมาป่าปกติ (ใช้เสียงข้างมาก)
        // บันทึกการโหวตของ Alpha Wolf
        this.werewolfVotes.set(playerId, action.targetId);
        
        // นับคะแนนโหวต
        const voteCounts = new Map();
        this.werewolfVotes.forEach(targetId => {
          voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
        });
        
        // หาคนที่ได้คะแนนสูงสุด
        let maxVotes = 0;
        let candidates = [];
        voteCounts.forEach((count, targetId) => {
          if (count > maxVotes) {
            maxVotes = count;
            candidates = [targetId];
          } else if (count === maxVotes) {
            candidates.push(targetId);
          }
        });
        
        // ถ้าเสมอกัน สุ่มเลือก
        const topTarget = candidates.length > 0 
          ? candidates[Math.floor(Math.random() * candidates.length)]
          : null;
        
        if (topTarget) {
          this.nightActions.set('werewolf', topTarget);
          console.log(`🐺 Werewolf target (including Alpha vote): ${topTarget} (${maxVotes} votes)`);
        }
        
        // ส่งข้อมูลการโหวตให้หมาป่าทุกตัวเห็น
        this.broadcastWerewolfVotes();
        
      } else if (action.type === 'convert') {
        // ⭐ กัดให้กลายเป็นหมาป่า - ใช้ array รองรับหลาย Alpha Wolf
        if (!this.alphaConvertActions) {
          this.alphaConvertActions = [];
        }
        this.alphaConvertActions.push({
          alphaId: playerId,
          targetId: action.targetId
        });
        console.log(`👑🐺 Alpha ${player.name} converts: ${action.targetId} to werewolf`);
      }
    }

    player.nightAction = action.targetId || action;
    
    console.log('✅ Night action saved. Current nightActions:', Array.from(this.nightActions.entries()));
    
    this.checkAllNightActionsComplete();
  }

  checkAllNightActionsComplete() {
    // ⭐ ตรวจสอบ night actions ที่จำเป็น
    const alivePlayers = this.players.filter(p => p.isAlive);
    
    // บทบาทที่ต้องทำ action แยกกัน
    const separateActionRoles = [ROLES.BODYGUARD, ROLES.SEER, ROLES.WITCH, ROLES.CUPID];
    
    // หมาป่าทุกตัว (Werewolf, Alpha, Wolf Cub) ทำ action ร่วมกัน - เช็คแค่ว่ามีคนทำแล้วหรือยัง
    const hasWerewolves = alivePlayers.some(p => ROLE_TEAMS[p.role] === 'werewolves' && p.role !== ROLES.TRAITOR);
    const werewolfActionDone = this.nightActions.has('werewolf') || this.nightActions.has('alphaConvert');
    
    // นับผู้เล่นที่ต้องทำ action แยกกัน
    let requiredActions = 0;
    let completedActions = 0;
    
    // เช็คหมาป่า (นับเป็น 1 action ร่วมกัน)
    if (hasWerewolves) {
      requiredActions++;
      if (werewolfActionDone) completedActions++;
    }
    
    // เช็ค special roles อื่นๆ
    alivePlayers.forEach(p => {
      if (separateActionRoles.includes(p.role)) {
        // Cupid ทำครั้งเดียวคืนแรก
        if (p.role === ROLES.CUPID && p.hasUsedAbility) return;
        
        requiredActions++;
        if (p.nightAction !== null) completedActions++;
      }
    });

    console.log('🌙 Night Actions Progress:', {
      requiredActions,
      completedActions,
      nightActions: Array.from(this.nightActions.entries())
    });

    if (completedActions === requiredActions && requiredActions > 0) {
      // All night actions complete, end phase early
      if (this.phaseTimer) {
        clearTimeout(this.phaseTimer);
        this.phaseTimer = null;
      }
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      
      // แจ้งว่าจะจบ phase
      // this.addLog('✅ ทุกคนทำการกระทำเสร็จแล้ว กำลังเปลี่ยน phase...'); // ลบออก
      
      setTimeout(() => this.endPhase(), 2000);
    }
  }

  handleVote(playerId, targetId) {
    const player = this.players.find(p => p.id === playerId);
    
    if (!player || !player.isAlive || this.phase !== GAME_PHASES.DAY) {
      return;
    }

    player.hasVoted = true;
    player.voteTarget = targetId;
    this.votes.set(playerId, targetId);

    this.broadcastGameState();
    this.broadcastDayVotes(); // ⭐ ส่งข้อมูลโหวตแบบ real-time
    this.checkAllVotesComplete();
  }

  handleSkipVote(playerId) {
    const player = this.players.find(p => p.id === playerId);
    
    if (!player || !player.isAlive || this.phase !== GAME_PHASES.DAY) {
      return;
    }

    player.hasVoted = true;
    player.voteTarget = 'skip';
    this.votes.set(playerId, 'skip');

    this.broadcastGameState();
    this.broadcastDayVotes(); // ⭐ ส่งข้อมูลโหวตแบบ real-time (skip ไม่นับ)
    this.checkAllVotesComplete();
  }

  handleHunterShoot(playerId, targetId) {
    const hunter = this.players.find(p => p.id === playerId);
    const target = this.players.find(p => p.id === targetId);
    
    if (!hunter || hunter.role !== ROLES.HUNTER || !target || !target.isAlive) {
      return;
    }

    // Hunter ยิงเป้าหมาย
    target.isAlive = false;
    this.addLog(`🏹 ${hunter.name} ยิง ${target.name} (${target.role})`, 'death');
    
    // ⭐ อัปเดต gameState ทันทีให้เห็นคนที่ถูกยิง
    this.broadcastGameState();

    // 💘 Check Love Network deaths
    const loveNetworkDeaths = this.checkLoveNetworkDeaths([target]);
    if (loveNetworkDeaths.length > 0) {
      this.broadcastGameState();
    }
    
    // ⭐ เช็คว่ายิง Hunter หรือไม่ → ให้ Hunter คนนั้นยิงต่อได้ (Cascade)
    const allDeadHunters = [target, ...loveNetworkDeaths].filter(p => p.role === ROLES.HUNTER);
    
    if (allDeadHunters.length > 0) {
      allDeadHunters.forEach(deadHunter => {
        this.addLog(`🏹 ${deadHunter.name} เป็นนักล่า! ยิงก่อนตาย (ถูกยิง)`, 'info');
        
        if (deadHunter.isBot) {
          // AI Hunter ยิงแบบอัตโนมัติ
          const alivePlayers = this.players.filter(p => p.isAlive && p.id !== deadHunter.id);
          if (alivePlayers.length > 0) {
            const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
            console.log(`🏹 AI Hunter ${deadHunter.name} auto-shoots ${randomTarget.name}`);
            
            // ⭐ Recursive call - ยิงต่อเนื่อง
            this.handleHunterShoot(deadHunter.id, randomTarget.id);
          }
        } else {
          // Human Hunter - ให้เลือกเอง
          this.io.to(deadHunter.id).emit('hunterRevenge', {
            alivePlayers: this.players.filter(p => p.isAlive).map(p => ({
              id: p.id,
              name: p.name
            }))
          });
        }
      });
    }
    
    // Check win condition
    if (this.checkWinCondition()) {
      return; // เกมจบแล้ว
    }

    // ⭐ ถ้า Hunter ถูกฆ่าตอนกลางคืน ให้ดำเนินการต่อไปยัง Day phase
    if (this.phase === GAME_PHASES.NIGHT) {
      this.startPhase(GAME_PHASES.DAY);
    }
    // ⭐ ถ้า Hunter ถูกโหวตกำจัดตอนกลางวัน ไม่ต้องทำอะไร (phase จะเปลี่ยนเองใน resolveDayPhase)
  }

  checkAllVotesComplete() {
    const alivePlayers = this.players.filter(p => p.isAlive);
    const votedPlayers = alivePlayers.filter(p => p.hasVoted);

    if (votedPlayers.length === alivePlayers.length && alivePlayers.length > 0) {
      // All votes complete, end phase early
      if (this.phaseTimer) {
        clearTimeout(this.phaseTimer);
        this.phaseTimer = null;
      }
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      
      // แจ้งว่าจะจบ phase
      // this.addLog('✅ ทุกคนโหวตเสร็จแล้ว กำลังนับคะแนน...'); // ลบออก
      
      setTimeout(() => this.endPhase(), 2000);
    }
  }

  checkWinCondition() {
    // นับผู้เล่นฝั่งหมาป่า (Werewolf, Alpha Werewolf, Wolf Cub, Traitor)
    const aliveWerewolves = this.players.filter(p => {
      if (!p.isAlive) return false;
      const team = ROLE_TEAMS[p.role];
      return team === 'werewolves';
    });

    // นับผู้เล่นฝั่งชาวบ้าน
    const aliveVillagers = this.players.filter(p => {
      if (!p.isAlive) return false;
      const team = ROLE_TEAMS[p.role];
      return team === 'villagers' || team === 'neutral';
    });

    if (aliveWerewolves.length === 0) {
      this.endGame('villagers');
      return true;
    }

    if (aliveWerewolves.length >= aliveVillagers.length) {
      this.endGame('werewolves');
      return true;
    }

    return false;
  }

  endGame(winner, foolPlayer = null) {
    // Clear all timers
    if (this.phaseTimer) {
      clearTimeout(this.phaseTimer);
      this.phaseTimer = null;
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    // ⭐ ถ้า Fool ชนะ
    // if (winner === 'fool' && foolPlayer) {
    //   this.addLog(`😂 เกมจบ! ตัวตลก (${foolPlayer.name}) ชนะ!`); // ลบออก
    // } else {
    //   this.addLog(`🎉 เกมจบ! ${winner === 'villagers' ? 'ชาวบ้าน' : 'มนุษย์หมาป่า'} ชนะ!`); // ลบออก
    // }

    this.io.to(this.lobbyCode).emit('gameOver', {
      winner,
      foolWinner: foolPlayer ? foolPlayer.name : null, // ⭐ เพิ่ม fool winner
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        isAlive: p.isAlive
      }))
    });

    // ⭐ ไม่ auto-return กลับห้อง รอให้ผู้เล่นกดปุ่มเอง
    console.log('🏁 เกมจบ - รอผู้เล่นกดกลับห้อง');
  }

  handlePlayerDisconnect(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.isAlive = false;
      // this.addLog(`⚠️ ${player.name} ออกจากเกม`); // ลบออก
      this.checkWinCondition();
    }
  }

  broadcastGameState() {
    // ⭐ ส่ง gameState ที่แตกต่างกันให้แต่ละคน เพื่อให้ทีมหมาป่า (รวมผู้ทรยศ) เห็น role ของกันและกัน
    const werewolfRoles = [ROLES.WEREWOLF, ROLES.ALPHA_WEREWOLF, ROLES.WOLF_CUB];
    const werewolfTeamRoles = [...werewolfRoles, ROLES.TRAITOR]; // รวมผู้ทรยศด้วย
    
    // ⭐ Get spectator key from environment variable (default fallback)
    const SPECTATOR_KEY = process.env.SPECTATOR_KEY || 'Sax51821924';
    
    // ส่ง gameState ปกติให้แต่ละคน
    this.players.forEach(viewer => {
      // ⭐ ตรวจสอบ Spectator Mode จาก spectatorKey ของผู้เล่น
      const isSpectator = viewer.spectatorKey === SPECTATOR_KEY;
      
      // ⭐ ถ้าเป็นทีมหมาป่า (รวมผู้ทรยศ) จะเห็น role ของทีมหมาป่าทั้งหมด
      const isViewerWerewolfTeam = werewolfTeamRoles.includes(viewer.role);
      
      const gameState = {
        phase: this.phase,
        day: this.day,
        players: this.players.map(p => ({
          id: p.id,
          name: p.name,
          isAlive: p.isAlive,
          hasVoted: p.hasVoted,
          // 🔑 Spectator Mode: เห็น role ทุกคน
          // ⭐ Normal Mode: เห็น role ของตัวเอง + ทีมหมาป่า (ถ้าเป็นหมาป่า)
          role: isSpectator ? p.role :
                (p.id === viewer.id) ? p.role : 
                (isViewerWerewolfTeam && werewolfTeamRoles.includes(p.role)) ? p.role : 
                undefined
        })),
        logs: this.gameLog,
        isSpectatorMode: isSpectator
      };

      this.io.to(viewer.id).emit('gameState', gameState);
    });
  }

  broadcastWerewolfVotes() {
    // นับคะแนนโหวตของหมาป่า
    const voteCounts = new Map();
    this.werewolfVotes.forEach(targetId => {
      voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
    });

    // เตรียมข้อมูลที่จะส่ง
    const voteData = {
      votes: Array.from(this.werewolfVotes.entries()).map(([wolfId, targetId]) => {
        const wolf = this.players.find(p => p.id === wolfId);
        const target = this.players.find(p => p.id === targetId);
        return {
          wolfId,
          wolfName: wolf?.name,
          targetId,
          targetName: target?.name
        };
      }),
      voteCounts: Array.from(voteCounts.entries()).map(([targetId, count]) => {
        const target = this.players.find(p => p.id === targetId);
        return {
          targetId,
          targetName: target?.name,
          votes: count
        };
      })
    };

    // ส่งให้หมาป่าทุกตัว (ไม่รวมผู้ทรยศ)
    this.players.forEach(player => {
      if (this.isActiveWerewolf(player.role) && !player.isBot) {
        this.io.to(player.id).emit('werewolfVoteUpdate', voteData);
      }
    });

    console.log('🐺 Broadcast werewolf votes:', voteData);
  }

  // ⭐ ลบ broadcastDoctorVotes และ broadcastSeerVotes
  // เพราะแต่ละคนไม่เห็นกัน (ยกเว้นหมาป่า)

  broadcastDayVotes() {
    // นับคะแนนโหวตกลางวัน
    const voteCounts = new Map();
    this.votes.forEach((targetId) => {
      if (targetId !== 'skip') { // ไม่นับ skip
        voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
      }
    });

    // เตรียมข้อมูลที่จะส่ง
    const voteData = {
      voteCounts: Array.from(voteCounts.entries()).map(([targetId, count]) => {
        const target = this.players.find(p => p.id === targetId);
        return {
          targetId,
          targetName: target?.name,
          votes: count
        };
      })
    };

    // ส่งให้ทุกคน
    this.io.to(this.lobbyCode).emit('dayVoteUpdate', voteData);

    console.log('⚖️ Broadcast day votes:', voteData);
  }

  addLog(message, type = 'info') {
    const log = {
      day: this.day,
      phase: this.phase,
      message,
      type, // 'info', 'death', 'protect', 'inspect', 'vote', 'convert', 'heal', 'poison'
      timestamp: Date.now()
    };
    this.gameLog.push(log);
    console.log(`📜 [Day ${this.day} ${this.phase}] ${message}`);
  }

  // ⭐ เช็คว่าเป็นหมาป่าที่ทำงานร่วมกันหรือไม่
  isActiveWerewolf(role) {
    return [
      ROLES.WEREWOLF,
      ROLES.ALPHA_WEREWOLF,
      ROLES.WOLF_CUB
    ].includes(role);
  }

  // ⭐ เช็คว่าเป็นทีมหมาป่า (รวมผู้ทรยศ)
  isWerewolfTeam(role) {
    return [
      ROLES.WEREWOLF,
      ROLES.ALPHA_WEREWOLF,
      ROLES.WOLF_CUB,
      ROLES.TRAITOR
    ].includes(role);
  }

  // ⭐ หาเพื่อนหมาป่า (รวมผู้ทรยศสำหรับแชท!)
  getWerewolfTeammates(playerId) {
    return this.players.filter(p => {
      if (p.id === playerId) return false; // ไม่รวมตัวเอง
      
      // ทีมหมาป่าทั้งหมด (รวมผู้ทรยศด้วย)
      return this.isWerewolfTeam(p.role);
    });
  }

  getRoleDescription(role) {
    const descriptions = {
      [ROLES.VILLAGER]: 'ร่วมมือกันหามนุษย์หมาป่าและลงมติกำจัดพวกเขา',
      [ROLES.WEREWOLF]: 'ฆ่าชาวบ้านในตอนกลางคืนโดยไม่ถูกจับได้',
      [ROLES.SEER]: 'ตรวจสอบผู้เล่น 1 คนในแต่ละคืนเพื่อรู้ว่าเป็นมนุษย์หมาป่าหรือไม่',
      [ROLES.BODYGUARD]: 'ปกป้องผู้เล่น 1 คน (รวมตัวเอง) ทุกคืน ห้ามปกป้องคนเดิม 2 คืนติดกัน',
      [ROLES.HUNTER]: 'ถ้าถูกฆ่า คุณสามารถยิงผู้เล่น 1 คนก่อนตายได้',
      [ROLES.CUPID]: 'จับคู่ผู้เล่น 2 คนให้เป็นคู่รัก ถ้าหนึ่งในนั้นตาย อีกคนจะตายตาม',
      [ROLES.WOLF_CUB]: 'เหมือนมนุษย์หมาป่า ถ้าถูกฆ่า คืนถัดไปมนุษย์หมาป่าฆ่าได้ 2 คน',
      [ROLES.TRAITOR]: 'ดูเหมือนชาวบ้าน แต่ชนะร่วมกับมนุษย์หมาป่า',
      [ROLES.WITCH]: 'มียาชุบชีวิต 1 ขวดและยาพิษ 1 ขวด ใช้ได้คืนละ 1 ขวด',
      [ROLES.FOOL]: 'เป้าหมายคือถูกฆ่า ถ้าสำเร็จคุณชนะคนเดียว',
      [ROLES.ALPHA_WEREWOLF]: 'หัวหน้าหมาป่า เลือกฆ่าผู้เล่น หรือกัดให้กลายเป็นหมาป่า (ใช้ได้คืนละครั้ง)'
    };
    return descriptions[role] || 'บทบาทที่ไม่รู้จัก';
  }
}




