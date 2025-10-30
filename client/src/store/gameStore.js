import { create } from 'zustand';

export const useGameStore = create((set) => ({
  playerName: '',
  lobbyCode: '',
  lobby: null,
  playerRole: null,
  roleDescription: '',
  showRoleModal: false,
  seerResult: null, // ⭐ เพิ่มผลการตรวจสอบของหมอดู
  phase: null,
  day: 1,
  players: [],
  logs: [],
  chatMessages: [], // ⭐ แชทสาธารณะ (ไม่รีเซต)
  werewolfChatMessages: [], // ⭐ แชทหมาป่า (ไม่รีเซต)
  isGameActive: false,
  gameOverData: null,
  timeRemaining: 0,
  roleAcknowledgements: { total: 0, acknowledged: 0, waiting: 0 }, // จำนวนผู้เล่นที่ยืนยันแล้ว
  showRoleChangeNotification: false, // แสดงการแจ้งเตือนเมื่อ role เปลี่ยน
  roleChangeMessage: null, // ข้อความแจ้งเตือนเมื่อ role เปลี่ยน
  
  setGameState: (state) => set((prevState) => ({ ...prevState, ...state })),
  
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  
  addWerewolfChatMessage: (message) => set((state) => ({ werewolfChatMessages: [...state.werewolfChatMessages, message] })),
  
  setPlayerName: (name) => set({ playerName: name }),
  
  setShowRoleModal: (show) => set({ showRoleModal: show }),
  
  setSeerResult: (result) => set({ seerResult: result }),
  
  reset: () => set({
    playerName: '',
    lobbyCode: '',
    lobby: null,
    playerRole: null,
    roleDescription: '',
    showRoleModal: false,
    seerResult: null,
    phase: null,
    day: 1,
    players: [],
    logs: [],
    chatMessages: [], // ⭐ รีเซตแชทเมื่อเกมจบ/เริ่มใหม่
    werewolfChatMessages: [], // ⭐ รีเซตแชทหมาป่าเมื่อเกมจบ/เริ่มใหม่
    isGameActive: false,
    gameOverData: null,
    timeRemaining: 0,
    roleAcknowledgements: { total: 0, acknowledged: 0, waiting: 0 },
    showRoleChangeNotification: false,
    roleChangeMessage: null,
  }),
}));

