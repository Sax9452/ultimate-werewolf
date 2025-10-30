import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';
import { soundManager } from '../utils/sounds';
import { motion, AnimatePresence } from 'framer-motion';

function GameOver({ onBackToHome }) {
  const { gameOverData, lobbyCode, logs } = useGameStore();
  const [showLogs, setShowLogs] = useState(false);

  // ⭐ Hooks ต้องอยู่ด้านบนสุด ก่อน early return
  useEffect(() => {
    if (!gameOverData) return; // ถ้าไม่มีข้อมูล ไม่ต้องทำอะไร
    
    // ⭐ เอา sound effect ออก - เงียบๆ
    // ไม่เล่นเสียงชนะ/แพ้
    
    return () => {
      soundManager.stopMusic();
    };
  }, [gameOverData]);

  // ⭐ Early return ต้องอยู่หลัง hooks
  if (!gameOverData) return null;

  const { winner, players, foolWinner } = gameOverData;

  // ⭐ เรียงลำดับผู้เล่น: คนรอดมาก่อน, คนตายมาทีหลัง
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.isAlive === b.isAlive) return 0;
    return a.isAlive ? -1 : 1; // isAlive: true มาก่อน
  });

  const getRoleEmoji = (role) => {
    const emojis = {
      'ชาวบ้าน': '👨‍🌾',
      'มนุษย์หมาป่า': '🐺',
      'หมอดู': '🔮',
      'บอดี้การ์ด': '🛡️',
      'นักล่า': '🏹',
      'คิวปิด': '💘',
      'ลูกหมาป่า': '🐺',
      'ผู้ทรยศ': '🗡️',
      'แม่มด': '🧙‍♀️',
      'ตัวตลก': '🤡',
      'อัลฟ่ามนุษย์หมาป่า': '👑🐺'
    };
    return emojis[role] || '❓';
  };

  const getRoleColor = (role) => {
    const colors = {
      'ชาวบ้าน': 'text-green-400',
      'มนุษย์หมาป่า': 'text-red-400',
      'หมอดู': 'text-purple-400',
      'บอดี้การ์ด': 'text-blue-400',
      'นักล่า': 'text-amber-400',
      'คิวปิด': 'text-pink-400',
      'ลูกหมาป่า': 'text-red-500',
      'ผู้ทรยศ': 'text-gray-400',
      'แม่มด': 'text-purple-500',
      'ตัวตลก': 'text-green-300',
      'อัลฟ่ามนุษย์หมาป่า': 'text-red-600'
    };
    return colors[role] || 'text-gray-400';
  };

  const handlePlayAgain = () => {
    // ⭐ ส่ง event ให้ server รีเซ็ต lobby
    console.log('🔄 กดกลับไปห้องเดิม...');
    socketService.emit('returnToLobby');
  };

  const handleBackToHome = () => {
    useGameStore.getState().reset();
    onBackToHome();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-3xl w-full"
      >
        {/* Winner Banner */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`card mb-8 text-center ${
            winner === 'fool'
              ? 'bg-gradient-to-r from-yellow-900 to-orange-900'
              : winner === 'villagers'
              ? 'bg-gradient-to-r from-green-900 to-emerald-900'
              : 'bg-gradient-to-r from-red-900 to-rose-900'
          }`}
        >
          <div className="text-6xl mb-4">
            {winner === 'fool' ? '🤡' : winner === 'villagers' ? '🎉' : '🐺'}
          </div>
          <h1 className="text-5xl font-bold mb-2">
            {winner === 'fool' 
              ? `ตัวตลกชนะ!`
              : winner === 'villagers' 
              ? 'ชาวบ้านชนะ!' 
              : 'มนุษย์หมาป่าชนะ!'}
          </h1>
          {foolWinner && (
            <p className="text-2xl text-amber-300">
              🎭 {foolWinner} หลอกทุกคนสำเร็จ!
            </p>
          )}
          <p className="text-xl text-slate-300">
            {winner === 'villagers'
              ? 'กำจัดมนุษย์หมาป่าหมดแล้ว!'
              : 'มนุษย์หมาป่ายึดครองหมู่บ้านได้สำเร็จ!'}
          </p>
        </motion.div>

        {/* Player Roles Reveal */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">🎭 บทบาทของผู้เล่น</h2>
          <div className="grid grid-cols-5 gap-4">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className={`relative p-4 rounded-xl text-center transition-all ${
                  player.isAlive 
                    ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-green-500/30 shadow-lg' 
                    : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-2 border-red-500/30 opacity-70'
                }`}
              >
                {/* สถานะมุมบน */}
                <div className="absolute top-2 right-2">
                  {player.isAlive ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-red-400 text-lg">💀</span>
                  )}
                </div>

                {/* Emoji */}
                <div className="text-5xl mb-2">{getRoleEmoji(player.role)}</div>

                {/* ชื่อผู้เล่น */}
                <div className="font-bold text-base mb-1 break-words">
                  {player.name}
                </div>

                {/* บทบาท */}
                <div className={`${getRoleColor(player.role)} font-semibold text-sm`}>
                  {player.role}
                </div>

                {/* สถานะ */}
                <div className={`text-xs mt-2 font-medium ${
                  player.isAlive ? 'text-green-300' : 'text-red-300'
                }`}>
                  {player.isAlive ? '🟢 รอดชีวิต' : '🔴 ถูกกำจัด'}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={handlePlayAgain}
              className="btn btn-primary flex-1 text-lg"
            >
              🔄 กลับห้องเดิม
            </button>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1 text-lg"
            >
              📜 {showLogs ? 'ซ่อนประวัติ' : 'ดูประวัติเกม'}
            </button>
            {showLogs && (
              <button
                onClick={() => {
                  // คัดลอก logs ทั้งหมดเป็น text แบบละเอียด
                  const logText = `=== WEREWOLF GAME LOG ===\nGame completed at: ${new Date().toLocaleString('th-TH')}\n\n` +
                    logs.map((log, idx) => 
                      `[Day ${log.day} ${log.phase === 'night' ? '🌙Night' : '☀️Day'}] #${idx + 1} [${log.type || 'info'}] ${log.message}`
                    ).join('\n') +
                    `\n\n=== END OF LOG (Total: ${logs.length} events) ===`;
                  
                  navigator.clipboard.writeText(logText).then(() => {
                    alert('✅ คัดลอก Log แล้ว!\n\n📋 นำไปวางส่งให้ทีมงานเพื่อตรวจสอบ bug หรือ logic ผิดพลาดได้เลย');
                  }).catch(err => {
                    console.error('Failed to copy:', err);
                    alert('❌ คัดลอกไม่สำเร็จ: ' + err.message);
                  });
                }}
                className="btn bg-green-600 hover:bg-green-700 text-white px-6"
                title="📋 คัดลอก Log ทั้งหมด สำหรับส่งให้ทีมงาน debug"
              >
                📋 Copy
              </button>
            )}
            <button
              onClick={handleBackToHome}
              className="btn btn-secondary px-8"
            >
              🏠 หน้าหลัก
            </button>
          </div>

          {/* 📜 Game Logs Display */}
          <AnimatePresence>
            {showLogs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div className="max-h-[400px] overflow-y-auto space-y-4 p-4 bg-slate-900/50 rounded-lg">
                  {logs.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      <div className="text-4xl mb-2">📭</div>
                      <p>ไม่มีบันทึกเหตุการณ์</p>
                    </div>
                  ) : (
                    (() => {
                      // ⭐ จัดกลุ่ม logs ตาม day และ phase แยกกัน (แบบละเอียด)
                      const grouped = logs.reduce((acc, log) => {
                        const key = `${log.day}-${log.phase}`; // แยก night/day
                        if (!acc[key]) {
                          acc[key] = {
                            day: log.day,
                            phase: log.phase,
                            logs: []
                          };
                        }
                        acc[key].logs.push(log);
                        return acc;
                      }, {});

                      // แปลงเป็น array และเรียงลำดับ (เหตุการณ์ที่เกิดก่อนมาก่อน)
                      const sortedGroups = Object.values(grouped).sort((a, b) => {
                        if (a.day !== b.day) return a.day - b.day;
                        // night มาก่อน day
                        if (a.phase === 'night' && b.phase === 'day') return -1;
                        if (a.phase === 'day' && b.phase === 'night') return 1;
                        return 0;
                      });

                      // Helper: สีตาม log type
                      const getLogColor = (type) => {
                        switch(type) {
                          case 'death': return 'text-red-300';
                          case 'protect': return 'text-blue-300';
                          case 'heal': return 'text-green-300';
                          case 'poison': return 'text-purple-300';
                          case 'inspect': return 'text-cyan-300';
                          case 'cupid': return 'text-pink-300';
                          case 'convert': return 'text-orange-300';
                          case 'info': return 'text-yellow-300';
                          default: return 'text-slate-300';
                        }
                      };

                      return sortedGroups.map((group, groupIdx) => (
                        <motion.div
                          key={`${group.day}-${group.phase}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: groupIdx * 0.05 }}
                          className="bg-slate-800/50 p-4 rounded-lg border-l-4 border-slate-600"
                        >
                          {/* หัวข้อ - แสดงทั้ง Day และ Phase */}
                          <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded border-2 ${
                            group.phase === 'night'
                              ? 'bg-indigo-900/50 border-indigo-500'
                              : 'bg-amber-900/50 border-amber-500'
                          }`}>
                            <span className="text-2xl">{group.phase === 'night' ? '🌙' : '☀️'}</span>
                            <span className="font-bold text-white">
                              {group.phase === 'night' ? 'คืนที่' : 'วันที่'} {group.day}
                            </span>
                            <span className="ml-auto text-xs text-slate-400">
                              ({group.logs.length} เหตุการณ์)
                            </span>
                          </div>

                          {/* รายการ log (เรียงตาม timestamp) */}
                          <div className="space-y-2">
                            {group.logs.map((log, idx) => (
                              <div 
                                key={idx} 
                                className={`text-sm pl-3 py-1 rounded hover:bg-slate-700/30 transition-colors ${getLogColor(log.type)}`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className="text-slate-500 text-xs mt-0.5 font-mono">#{idx + 1}</span>
                                  <span className="flex-1">{log.message}</span>
                                  {log.type && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-900/50 text-slate-400 font-mono">
                                      {log.type}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ));
                    })()
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-sm text-slate-400 text-center mt-4">
            💡 กดปุ่ม "กลับห้องเดิม" เพื่อเล่นใหม่ หรือ "หน้าหลัก" เพื่อออก
          </p>
        </motion.div>

        {/* Stats (Optional) */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-slate-400"
        >
          <p>ขอบคุณที่เล่นเกมมนุษย์หมาป่า! 🎉</p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default GameOver;

