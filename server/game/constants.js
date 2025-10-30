export const ROLES = {
  VILLAGER: 'ชาวบ้าน',
  WEREWOLF: 'มนุษย์หมาป่า',
  SEER: 'หมอดู',
  BODYGUARD: 'บอดี้การ์ด',
  HUNTER: 'นักล่า',
  CUPID: 'คิวปิด',
  WOLF_CUB: 'ลูกหมาป่า',
  TRAITOR: 'ผู้ทรยศ',
  WITCH: 'แม่มด',
  FOOL: 'ตัวตลก',
  ALPHA_WEREWOLF: 'อัลฟ่ามนุษย์หมาป่า'
};

export const ROLE_TEAMS = {
  [ROLES.VILLAGER]: 'villagers',
  [ROLES.WEREWOLF]: 'werewolves',
  [ROLES.SEER]: 'villagers',
  [ROLES.BODYGUARD]: 'villagers',
  [ROLES.HUNTER]: 'villagers',
  [ROLES.CUPID]: 'villagers',
  [ROLES.WOLF_CUB]: 'werewolves',
  [ROLES.TRAITOR]: 'werewolves',
  [ROLES.WITCH]: 'villagers',
  [ROLES.FOOL]: 'neutral',
  [ROLES.ALPHA_WEREWOLF]: 'werewolves'
};

export const GAME_PHASES = {
  NIGHT: 'night',
  DAY: 'day'
};

export const DEFAULT_PHASE_DURATIONS = {
  [GAME_PHASES.NIGHT]: 60,  // 60 วินาที
  [GAME_PHASES.DAY]: 180     // 180 วินาที (3 นาที)
};

export const ROLE_COLORS = {
  [ROLES.VILLAGER]: '#4ade80',
  [ROLES.WEREWOLF]: '#ef4444',
  [ROLES.SEER]: '#8b5cf6',
  [ROLES.BODYGUARD]: '#3b82f6',
  [ROLES.HUNTER]: '#f59e0b',
  [ROLES.CUPID]: '#ec4899',
  [ROLES.WOLF_CUB]: '#dc2626',
  [ROLES.TRAITOR]: '#991b1b',
  [ROLES.WITCH]: '#7c3aed',
  [ROLES.FOOL]: '#10b981',
  [ROLES.ALPHA_WEREWOLF]: '#7f1d1d'
};

export const ROLE_EMOJIS = {
  [ROLES.VILLAGER]: '👨‍🌾',
  [ROLES.WEREWOLF]: '🐺',
  [ROLES.SEER]: '🔮',
  [ROLES.BODYGUARD]: '🛡️',
  [ROLES.HUNTER]: '🏹',
  [ROLES.CUPID]: '💘',
  [ROLES.WOLF_CUB]: '🐺',
  [ROLES.TRAITOR]: '🗡️',
  [ROLES.WITCH]: '🧙‍♀️',
  [ROLES.FOOL]: '🤡',
  [ROLES.ALPHA_WEREWOLF]: '👑🐺'
};

export const ROLE_DESCRIPTIONS = {
  [ROLES.VILLAGER]: 'ร่วมมือกันหามนุษย์หมาป่าและลงมติกำจัดพวกเขา',
  [ROLES.WEREWOLF]: 'ฆ่าชาวบ้านในตอนกลางคืนโดยไม่ถูกจับได้',
  [ROLES.SEER]: 'ตรวจสอบผู้เล่น 1 คนในแต่ละคืนเพื่อรู้ว่าเป็นมนุษย์หมาป่าหรือไม่',
  [ROLES.BODYGUARD]: 'ปกป้องผู้เล่น 1 คน (รวมตัวเอง) ทุกคืน ห้ามปกป้องคนเดิม 2 คืนติดกัน',
  [ROLES.HUNTER]: 'ถ้าถูกฆ่า คุณสามารถยิงผู้เล่น 1 คนก่อนตายได้',
  [ROLES.CUPID]: 'จับคู่ผู้เล่น 2 คนให้เป็นคู่รัก ถ้าหนึ่งในนั้นตาย อีกคนจะตายตาม (ใช้ได้ครั้งเดียวในคืนแรก)',
  [ROLES.WOLF_CUB]: 'เหมือนมนุษย์หมาป่า ถ้าถูกฆ่า คืนถัดไปมนุษย์หมาป่าฆ่าได้ 2 คน',
  [ROLES.TRAITOR]: 'ดูเหมือนชาวบ้าน แต่ชนะร่วมกับมนุษย์หมาป่า',
  [ROLES.WITCH]: 'ปกป้อง 1 คน (รวมตัวเอง) หรือฆ่า 1 คน ใช้ได้คืนละครั้ง',
  [ROLES.FOOL]: 'ถ้าคุณถูกโหวตกำจัด คุณจะชนะคนเดียว',
  [ROLES.ALPHA_WEREWOLF]: 'หัวหน้าหมาป่า เลือกฆ่าผู้เล่น หรือกัดให้กลายเป็นหมาป่า (ใช้ได้คืนละครั้ง)'
};

export const DEFAULT_ROLE_DISTRIBUTION = {
  [ROLES.WEREWOLF]: 1,
  [ROLES.SEER]: 1,
  [ROLES.BODYGUARD]: 1,
  [ROLES.HUNTER]: 0,
  [ROLES.CUPID]: 0,
  [ROLES.WOLF_CUB]: 0,
  [ROLES.TRAITOR]: 0,
  [ROLES.WITCH]: 0,
  [ROLES.FOOL]: 0,
  [ROLES.ALPHA_WEREWOLF]: 0,
  [ROLES.VILLAGER]: 0
};
