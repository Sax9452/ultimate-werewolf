import { ROLES } from './constants.js';

export function assignRoles(players, roleDistribution) {
  const playerCount = players.length;
  const roles = [];

  // ใช้การตั้งค่าจาก lobby
  if (roleDistribution) {
    // เพิ่ม roles ตามที่ตั้งค่าไว้ (รวมชาวบ้านด้วย)
    Object.entries(roleDistribution).forEach(([role, count]) => {
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          roles.push(role);
        }
      }
    });
  } else {
    // ใช้การกระจาย role แบบเดิม (default) - สำหรับ fallback
    if (playerCount >= 3 && playerCount <= 5) {
      roles.push(ROLES.WEREWOLF);
      roles.push(ROLES.SEER);
      roles.push(ROLES.BODYGUARD);
      while (roles.length < playerCount) {
        roles.push(ROLES.VILLAGER);
      }
    } else if (playerCount >= 6 && playerCount <= 8) {
      roles.push(ROLES.WEREWOLF, ROLES.WEREWOLF);
      roles.push(ROLES.SEER);
      roles.push(ROLES.BODYGUARD);
      while (roles.length < playerCount) {
        roles.push(ROLES.VILLAGER);
      }
    } else if (playerCount >= 9 && playerCount <= 12) {
      roles.push(ROLES.WEREWOLF, ROLES.WEREWOLF);
      roles.push(ROLES.SEER);
      roles.push(ROLES.BODYGUARD);
      roles.push(ROLES.HUNTER);
      while (roles.length < playerCount) {
        roles.push(ROLES.VILLAGER);
      }
    } else if (playerCount >= 13) {
      roles.push(ROLES.WEREWOLF, ROLES.WEREWOLF, ROLES.WEREWOLF);
      roles.push(ROLES.SEER);
      roles.push(ROLES.BODYGUARD);
      roles.push(ROLES.HUNTER);
      roles.push(ROLES.WITCH);
      while (roles.length < playerCount) {
        roles.push(ROLES.VILLAGER);
      }
    }
  }

  // สุ่ม roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  // มอบ roles ให้ผู้เล่น
  players.forEach((player, index) => {
    player.role = roles[index];
  });
}
