import { ROLES } from './constants.js';

export class AIPlayer {
  constructor(game, playerId, playerName, role) {
    this.game = game;
    this.playerId = playerId;
    this.playerName = playerName;
    this.role = role;
    this.suspicionLevels = new Map(); // Track suspicion of other players
    this.observations = [];
    this.personality = this.generatePersonality();
  }

  generatePersonality() {
    // Different AI personalities for varied gameplay
    const personalities = ['aggressive', 'defensive', 'analytical', 'random', 'strategic'];
    return personalities[Math.floor(Math.random() * personalities.length)];
  }

  // AI makes night action decision
  async makeNightAction() {
    await this.delay(Math.random() * 20000 + 5000); // Random delay 5-25 seconds

    const alivePlayers = this.game.players.filter(
      p => p.isAlive && p.id !== this.playerId
    );

    if (alivePlayers.length === 0) return;

    let target;
    let target2; // สำหรับ Alpha Werewolf

    switch (this.role) {
      case ROLES.WEREWOLF:
      case ROLES.WOLF_CUB:
        target = this.chooseWerewolfTarget(alivePlayers);
        break;
      case ROLES.ALPHA_WEREWOLF:
        // ⭐ Alpha Werewolf เลือกฆ่าหรือกัด
        const alphaAction = this.chooseAlphaWerewolfAction(alivePlayers);
        if (alphaAction) {
          this.game.handleNightAction(this.playerId, alphaAction);
          return; // Return early เพราะส่ง action แล้ว
        }
        return;
      case ROLES.SEER:
        target = this.chooseSeerTarget(alivePlayers);
        break;
      case ROLES.BODYGUARD:
        target = this.chooseDoctorTarget(alivePlayers);
        break;
      case ROLES.CUPID:
        // ⭐ Cupid เลือกคู่รัก 2 คน
        const cupidAction = this.chooseCupidPair(alivePlayers);
        if (cupidAction) {
          this.game.handleNightAction(this.playerId, cupidAction);
        }
        return; // Return early เพราะส่ง action แล้ว
      case ROLES.WITCH:
        // ⭐ Witch เลือกใช้ยารักษาหรือยาพิษ
        const witchAction = this.chooseWitchAction(alivePlayers);
        if (witchAction) {
          this.game.handleNightAction(this.playerId, witchAction);
        }
        return; // Return early เพราะส่ง action แล้ว
      default:
        return;
    }

    if (target) {
      this.game.handleNightAction(this.playerId, { targetId: target.id });
    }
  }

  // Werewolf AI: Target strategic players or random
  chooseWerewolfTarget(alivePlayers) {
    // ⭐ กรองเอาเฉพาะคนที่ไม่ใช่หมาป่าและไม่ใช่ผู้ทรยศ (พวกเดียวกัน)
    const werewolfTeamRoles = ['มนุษย์หมาป่า', 'อัลฟ่ามนุษย์หมาป่า', 'ลูกหมาป่า', 'ผู้ทรยศ'];
    const nonWerewolfPlayers = alivePlayers.filter(p => !werewolfTeamRoles.includes(p.role));
    
    if (nonWerewolfPlayers.length === 0) return null;
    
    switch (this.personality) {
      case 'aggressive':
        // Target the most vocal/active players first
        return nonWerewolfPlayers[Math.floor(Math.random() * Math.min(3, nonWerewolfPlayers.length))];
      
      case 'strategic':
        // Avoid targeting players who might be protected
        // Target middle-ground players to avoid suspicion
        const midIndex = Math.floor(nonWerewolfPlayers.length / 2);
        return nonWerewolfPlayers[midIndex];
      
      default:
        // Random target
        return nonWerewolfPlayers[Math.floor(Math.random() * nonWerewolfPlayers.length)];
    }
  }

  // ⭐ Alpha Werewolf AI: เลือกฆ่าหรือกัด (แปลงเป็นหมาป่า)
  chooseAlphaWerewolfAction(alivePlayers) {
    const werewolfTeamRoles = ['มนุษย์หมาป่า', 'อัลฟ่ามนุษย์หมาป่า', 'ลูกหมาป่า', 'ผู้ทรยศ'];
    const nonWerewolfPlayers = alivePlayers.filter(p => !werewolfTeamRoles.includes(p.role));
    
    if (nonWerewolfPlayers.length === 0) return null;
    
    // สุ่มเลือกเป้าหมาย
    const target = nonWerewolfPlayers[Math.floor(Math.random() * nonWerewolfPlayers.length)];
    
    // ตัดสินใจว่าจะฆ่าหรือกัด
    // 70% ฆ่า, 30% กัด (แปลง)
    const shouldKill = Math.random() < 0.7;
    
    return {
      type: shouldKill ? 'kill' : 'convert',
      targetId: target.id
    };
  }

  // Seer AI: Investigate suspicious or unknown players
  chooseSeerTarget(alivePlayers) {
    // Prioritize players with high suspicion or unknowns
    const uninvestigated = alivePlayers.filter(p => !this.observations.includes(p.id));
    
    if (uninvestigated.length > 0) {
      if (this.personality === 'analytical') {
        // Check the most suspicious first
        return uninvestigated[0];
      }
      return uninvestigated[Math.floor(Math.random() * uninvestigated.length)];
    }
    
    return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  }

  // Doctor AI: Protect likely targets or self-preservation
  chooseDoctorTarget(alivePlayers) {
    switch (this.personality) {
      case 'defensive':
        // Protect self sometimes
        if (Math.random() > 0.5) {
          const self = this.game.players.find(p => p.id === this.playerId);
          return self;
        }
        break;
      
      case 'strategic':
        // Protect confirmed villagers or important roles
        // In early game, random protection
        return alivePlayers[Math.floor(Math.random() * Math.min(3, alivePlayers.length))];
      
      default:
        break;
    }
    
    return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
  }

  // ⭐ Cupid AI: เลือกคู่รัก 2 คน
  chooseCupidPair(alivePlayers) {
    // Check if Cupid has already used ability
    const cupidPlayer = this.game.players.find(p => p.id === this.playerId);
    if (cupidPlayer && cupidPlayer.hasUsedAbility) {
      return null; // Already used
    }

    if (alivePlayers.length < 2) return null;

    // Random selection of 2 different players
    const shuffled = [...alivePlayers].sort(() => Math.random() - 0.5);
    const lover1 = shuffled[0];
    const lover2 = shuffled[1];

    return {
      lover1: lover1.id,
      lover2: lover2.id
    };
  }

  // ⭐ Witch AI: เลือกใช้ยารักษาหรือยาพิษ
  chooseWitchAction(alivePlayers) {
    const witchPlayer = this.game.players.find(p => p.id === this.playerId);
    if (!witchPlayer) return null;

    // ดูว่ามียาอะไรเหลือบ้าง
    const witchPotions = this.game.witchPotions?.get(this.playerId) || { heal: 0, poison: 0 };
    const hasHeal = witchPotions.heal > 0;
    const hasPoison = witchPotions.poison > 0;

    if (!hasHeal && !hasPoison) return null; // No potions left

    // ดูว่าคืนนี้มีใครโดนโจมตีไหม
    const werewolfTarget = this.game.nightActions.get('werewolf');
    
    // 🧪 Strategy: ใช้ยารักษาถ้ามีคนโดนโจมตี
    if (werewolfTarget && hasHeal) {
      // 70% ใช้ยารักษา
      if (Math.random() < 0.7) {
        return {
          type: 'heal',
          targetId: werewolfTarget
        };
      }
    }

    // 🧪 Strategy: ใช้ยาพิษกับคนสุ่ม
    if (hasPoison && Math.random() < 0.3) {
      const randomTarget = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      return {
        type: 'poison',
        targetId: randomTarget.id
      };
    }

    return null; // Don't use any potion this night
  }

  // AI makes voting decision
  async makeVote() {
    await this.delay(Math.random() * 30000 + 10000); // Random delay 10-40 seconds

    const alivePlayers = this.game.players.filter(
      p => p.isAlive && p.id !== this.playerId
    );

    if (alivePlayers.length === 0) return;

    let shouldSkip = false;
    let target;

    // Decision making based on role and personality
    if (this.role === ROLES.WEREWOLF || this.role === ROLES.ALPHA_WEREWOLF || 
        this.role === ROLES.WOLF_CUB) {
      target = this.chooseWerewolfVote(alivePlayers);
      shouldSkip = Math.random() > 0.7; // Sometimes skip to avoid suspicion
    } else {
      target = this.chooseVillagerVote(alivePlayers);
      shouldSkip = Math.random() > 0.6; // Villagers more likely to vote
    }

    if (shouldSkip && Math.random() > 0.5) {
      this.game.handleSkipVote(this.playerId);
    } else if (target) {
      this.game.handleVote(this.playerId, target.id);
    } else {
      this.game.handleSkipVote(this.playerId);
    }
  }
  
  // 🧠 Helper: ดูคะแนนโหวตปัจจุบัน
  getCurrentVoteCounts(alivePlayers) {
    const voteCounts = new Map();
    
    // นับคะแนนจาก votes ปัจจุบัน
    this.game.votes.forEach((targetId, voterId) => {
      if (targetId !== 'skip') {
        voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
      }
    });
    
    // แปลงเป็น array และเรียงตามคะแนน
    const sortedVotes = Array.from(voteCounts.entries())
      .map(([playerId, count]) => ({
        player: alivePlayers.find(p => p.id === playerId),
        count
      }))
      .filter(v => v.player) // กรองเฉพาะผู้เล่นที่ยังมีชีวิต
      .sort((a, b) => b.count - a.count);
    
    return sortedVotes;
  }
  
  // 🧠 Helper: หาผู้เล่นที่มีคะแนนโหวตสูงสุด
  getTopVotedPlayer(alivePlayers) {
    const voteCounts = this.getCurrentVoteCounts(alivePlayers);
    return voteCounts.length > 0 ? voteCounts[0] : null;
  }

  // Werewolf voting strategy: Deflect suspicion, vote with majority
  chooseWerewolfVote(alivePlayers) {
    // ⭐ กรองเอาเฉพาะคนที่ไม่ใช่หมาป่า (ไม่โหวตพวกเดียวกัน)
    const werewolfTeamRoles = ['มนุษย์หมาป่า', 'อัลฟ่ามนุษย์หมาป่า', 'ลูกหมาป่า', 'ผู้ทรยศ'];
    const nonWerewolfPlayers = alivePlayers.filter(p => !werewolfTeamRoles.includes(p.role));
    
    if (nonWerewolfPlayers.length === 0) return null;
    
    // ดูคะแนนโหวตปัจจุบัน
    const topVoted = this.getTopVotedPlayer(nonWerewolfPlayers);
    
    // 🧠 Strategy: โหวตตามคนที่มีคะแนนสูงเพื่อไม่สร้างความสงสัย
    switch (this.personality) {
      case 'aggressive':
        // โหวตตามคนที่มีคะแนนสูง 80% หรือสุ่ม 20%
        if (topVoted && topVoted.count > 0 && Math.random() < 0.8) {
          return topVoted.player;
        }
        return nonWerewolfPlayers[Math.floor(Math.random() * Math.min(3, nonWerewolfPlayers.length))];
      
      case 'strategic':
        // โหวตตามคนที่มีคะแนนสูง 90% (แกล้งเป็นชาวบ้านดี)
        if (topVoted && topVoted.count > 0 && Math.random() < 0.9) {
          return topVoted.player;
        }
        return nonWerewolfPlayers[Math.floor(Math.random() * nonWerewolfPlayers.length)];
      
      case 'defensive':
        // โหวตตามคนที่มีคะแนนสูง 70% หรือไม่โหวต
        if (topVoted && topVoted.count > 0 && Math.random() < 0.7) {
          return topVoted.player;
        }
        if (Math.random() > 0.5) {
          return nonWerewolfPlayers[Math.floor(Math.random() * nonWerewolfPlayers.length)];
        }
        return null; // Sometimes skip
      
      default:
        // โหวตตามคนที่มีคะแนนสูง 75%
        if (topVoted && topVoted.count > 0 && Math.random() < 0.75) {
          return topVoted.player;
        }
        return nonWerewolfPlayers[Math.floor(Math.random() * nonWerewolfPlayers.length)];
    }
  }

  // Villager voting strategy: Vote based on suspicion and follow majority
  chooseVillagerVote(alivePlayers) {
    // ดูคะแนนโหวตปัจจุบัน
    const voteCounts = this.getCurrentVoteCounts(alivePlayers);
    const topVoted = voteCounts.length > 0 ? voteCounts[0] : null;
    
    // 🔮 Seer AI: โหวตตามคนที่รู้ว่าเป็นหมาป่า
    if (this.role === ROLES.SEER && this.suspicionLevels.size > 0) {
      // หาคนที่มี suspicion สูงสุด
      let mostSuspicious = null;
      let maxSuspicion = 0;
      
      this.suspicionLevels.forEach((suspicion, playerId) => {
        if (suspicion > maxSuspicion) {
          const player = alivePlayers.find(p => p.id === playerId);
          if (player) {
            maxSuspicion = suspicion;
            mostSuspicious = player;
          }
        }
      });
      
      // ถ้ารู้ว่าใครเป็นหมาป่า (suspicion = 100) โหวตเลย
      if (mostSuspicious && maxSuspicion === 100) {
        return mostSuspicious;
      }
    }
    
    // 🧠 ถ้ามีคนที่ถูกโหวตเยอะแล้ว -> โหวตตาม (bandwagon effect)
    switch (this.personality) {
      case 'aggressive':
        // โหวตตามคนที่มีคะแนนสูง 85% หรือสุ่ม
        if (topVoted && topVoted.count >= 2 && Math.random() < 0.85) {
          return topVoted.player;
        }
        return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      
      case 'strategic':
        // รอดูคนอื่นโหวตก่อน แล้วค่อยตามโหวต 90%
        if (topVoted && topVoted.count >= 1 && Math.random() < 0.9) {
          return topVoted.player;
        }
        return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      
      case 'analytical':
        // โหวตตามคนที่มีคะแนนสูง 80% ถ้ามีคน 2 คนขึ้นโหวต
        if (topVoted && topVoted.count >= 2 && Math.random() < 0.8) {
          return topVoted.player;
        }
        // ถ้าไม่มี อาจจะโหวตตาม suspicion
        if (this.observations.length > 0) {
          const suspicious = alivePlayers[0];
          return suspicious;
        }
        return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      
      case 'defensive':
        // โหวตตามคนที่มีคะแนนสูง 75% หรือไม่โหวต
        if (topVoted && topVoted.count >= 2 && Math.random() < 0.75) {
          return topVoted.player;
        }
        // More cautious, might skip
        if (Math.random() > 0.4) {
          return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        }
        return null;
      
      default:
        // โหวตตามคนที่มีคะแนนสูง 80%
        if (topVoted && topVoted.count >= 2 && Math.random() < 0.8) {
          return topVoted.player;
        }
        return alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
    }
  }

  // AI chat messages (optional, adds realism)
  async sendChatMessage() {
    const messages = this.getChatMessages();
    if (messages.length > 0 && Math.random() > 0.5) {
      const message = messages[Math.floor(Math.random() * messages.length)];
      
      // Send message through game
      setTimeout(() => {
        if (this.game.io) {
          this.game.io.to(this.game.lobbyCode).emit('chatMessage', {
            playerName: this.playerName,
            playerId: this.playerId,
            message,
            timestamp: Date.now(),
            isBot: true
          });
        }
      }, Math.random() * 10000 + 2000);
    }
  }

  getChatMessages() {
    if (this.game.phase === 'day') {
      return [
        'เราต้องระวังให้ดีนะ...',
        'มีใครสังเกตเห็นอะไรผิดปกติไหม?',
        'เราควรโหวตให้รอบคอบ',
        'ฉันไม่แน่ใจเลย...',
        'มาคิดกันดีๆ ว่าจะกำจัดใคร',
        'มีคนโกหกแน่นอน',
        'เราต้องหาหมาป่าให้เจอ!',
        'ฉันสงสัยบางคน...',
        'เชื่อฉันสิ',
        'นี่เป็นการตัดสินใจที่ยาก'
      ];
    }
    return [];
  }

  // Update AI knowledge when seer result received
  updateSeerKnowledge(playerId, isWerewolf) {
    this.observations.push(playerId);
    if (isWerewolf) {
      this.suspicionLevels.set(playerId, 100);
    } else {
      this.suspicionLevels.set(playerId, 0);
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

