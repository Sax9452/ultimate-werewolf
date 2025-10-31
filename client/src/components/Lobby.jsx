import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';
import { soundManager } from '../utils/sounds';
import { getRoleEmoji, getRoleBadgeColor } from '../utils/roleHelpers';
import { motion } from 'framer-motion';
import Chat from './Chat';
import LobbySettings from './LobbySettings';

function Lobby() {
  const { lobbyCode, lobby } = useGameStore();
  const [copied, setCopied] = useState(false);

  const myId = socketService.socket?.id;
  const isHost = lobby?.host === myId;

  // เล่นดนตรีห้องรอ
  useEffect(() => {
    soundManager.playMusic('lobby');
    return () => {
      soundManager.stopMusic();
    };
  }, []);

  const copyLobbyCode = async () => {
    try {
      // ลองใช้ Clipboard API ก่อน (ต้องการ HTTPS หรือ localhost)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(lobbyCode);
        setCopied(true);
        soundManager.playClick();
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback: ใช้วิธีเก่าสำหรับ HTTP
        const textArea = document.createElement('textarea');
        textArea.value = lobbyCode;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          soundManager.playClick();
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('❌ Copy failed:', err);
          alert('ไม่สามารถคัดลอกได้ กรุณาคัดลอกเอง: ' + lobbyCode);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('❌ Copy failed:', err);
      // แสดง prompt ให้ผู้ใช้คัดลอกเอง
      alert('ไม่สามารถคัดลอกอัตโนมัติได้\nรหัสห้อง: ' + lobbyCode);
    }
  };

  const handleStartGame = () => {
    if (lobby.players.length < lobby.minPlayers) {
      return;
    }
    soundManager.playGameStart();
    socketService.emit('startGame');
  };

  const handleAddBot = () => {
    soundManager.playClick();
    socketService.emit('addBot');
  };

  const handleRemoveBot = (botId) => {
    soundManager.playClick();
    socketService.emit('removeBot', botId);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ห้องรอ
          </h1>
          <div className="flex items-center justify-center gap-3">
            <div className="text-2xl font-mono bg-slate-800 px-6 py-3 rounded-lg border border-purple-500">
              {lobbyCode}
            </div>
            <button
              onClick={copyLobbyCode}
              className="btn btn-secondary"
            >
              {copied ? '✓ คัดลอกแล้ว!' : '📋 คัดลอก'}
            </button>
          </div>
          <p className="text-slate-400 mt-2">
            แชร์รหัสนี้ให้เพื่อนเพื่อเข้าร่วม
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Players List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 space-y-4"
          >
            {/* Role Distribution Card */}
            <div className="card bg-gradient-to-br from-purple-900/30 to-slate-800 border border-purple-500/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-purple-300">🎭 บทบาทในเกม</h3>
                {isHost && (
                  <span className="text-xs text-slate-400">คุณสามารถแก้ไขได้</span>
                )}
              </div>
              
              {lobby?.settings?.roleDistribution && (() => {
                const roles = lobby.settings.roleDistribution;
                const totalRoles = Object.values(roles).reduce((sum, count) => sum + count, 0);
                const activeRoles = Object.entries(roles).filter(([_, count]) => count > 0);
                
                // ⭐ เรียงลำดับ role จากฝ่ายร้าย (หมาป่า) ไปฝ่ายดี (ชาวบ้าน)
                const roleOrder = {
                  // Werewolves Team (ฝ่ายร้าย)
                  'มนุษย์หมาป่า': 1,
                  'อัลฟ่ามนุษย์หมาป่า': 2,
                  'ลูกหมาป่า': 3,
                  'ผู้ทรยศ': 4,
                  // Villagers Team (ฝ่ายดี)
                  'หมอดู': 5,
                  'บอดี้การ์ด': 6,
                  'แม่มด': 7,
                  'นักล่า': 8,
                  'คิวปิด': 9,
                  'ตัวตลก': 10,
                  'ชาวบ้าน': 11
                };
                
                const sortedRoles = activeRoles.sort((a, b) => {
                  return (roleOrder[a[0]] || 999) - (roleOrder[b[0]] || 999);
                });
                
                
                return (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                      {sortedRoles.map(([role, count]) => (
                        <div 
                          key={role}
                          className={`p-3 rounded-lg border ${getRoleBadgeColor(role)}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{getRoleEmoji(role)}</span>
                            <span className="text-xl font-bold">×{count}</span>
                          </div>
                          <div className="text-xs font-semibold mt-1 truncate">{role}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm pt-3 border-t border-purple-500/30">
                      <span className="text-slate-400">บทบาททั้งหมด:</span>
                      <span className="text-purple-300 font-bold">{totalRoles} บทบาท</span>
                    </div>
                    {lobby?.players.length > totalRoles && (
                      <div className="mt-2 p-2 bg-yellow-900/30 border border-yellow-600 rounded text-yellow-300 text-xs text-center">
                        ⚠️ มีผู้เล่น {lobby.players.length} คน แต่บทบาทมีแค่ {totalRoles} บทบาท
                      </div>
                    )}
                    {lobby?.players.length < totalRoles && (
                      <div className="mt-2 p-2 bg-blue-900/30 border border-blue-600 rounded text-blue-300 text-xs text-center">
                        ℹ️ มีผู้เล่น {lobby.players.length} คน จะใช้บทบาท {lobby.players.length} จาก {totalRoles} บทบาท
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Players Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  ผู้เล่น ({lobby?.players.length})
                </h2>
                <div className="flex items-center gap-3">
                  <LobbySettings lobby={lobby} isHost={isHost} />
                  {isHost && (
                    <button
                      onClick={handleAddBot}
                      className="btn btn-secondary text-sm px-4 py-2"
                    >
                      🤖 เพิ่มบอท
                    </button>
                  )}
                  {lobby?.players.length >= lobby?.minPlayers && (
                    <span className="text-green-400 text-sm font-semibold">
                      ✓ พร้อมเริ่ม
                    </span>
                  )}
                </div>
              </div>

            <div className="grid gap-3">
              {lobby?.players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-lg flex items-center justify-between ${
                    player.id === myId
                      ? 'bg-purple-900/50 border-2 border-purple-500'
                      : player.isBot
                      ? 'bg-blue-900/30 border border-blue-600'
                      : 'bg-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                      player.id === lobby.host ? 'bg-yellow-500' : player.isBot ? 'bg-blue-500' : 'bg-purple-500'
                    }`}>
                      {player.id === lobby.host ? '👑' : player.isBot ? '🤖' : '👤'}
                    </div>
                    <div>
                      <div className={`font-semibold break-words ${player.id === myId ? 'text-green-400' : ''}`}>
                        {player.name}
                        {player.id === myId && (
                          <span className="ml-2 text-purple-400 text-sm">(You)</span>
                        )}
                        {player.isBot && (
                          <span className="ml-2 text-blue-400 text-sm">(AI)</span>
                        )}
                      </div>
                      {player.id === lobby.host && (
                        <div className="text-xs text-yellow-400">หัวหน้าห้อง</div>
                      )}
                    </div>
                  </div>
                  {player.isBot && isHost && (
                    <button
                      onClick={() => handleRemoveBot(player.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1 bg-red-900/30 rounded hover:bg-red-900/50 transition-colors"
                    >
                      ลบ
                    </button>
                  )}
                </motion.div>
              ))}

              {/* Empty slots - only show if below minimum */}
              {lobby?.players.length < lobby?.minPlayers && Array.from({ length: lobby.minPlayers - lobby.players.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="p-4 rounded-lg bg-slate-700/30 border-2 border-dashed border-slate-600 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                    ?
                  </div>
                  <div className="text-slate-500">ต้องการอีก {lobby.minPlayers - lobby.players.length} คน...</div>
                </div>
              ))}
            </div>

            {/* Start Button */}
            {isHost && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleStartGame}
                disabled={lobby?.players.length < lobby?.minPlayers}
                className={`btn w-full mt-6 text-lg ${
                  lobby?.players.length >= lobby?.minPlayers
                    ? 'btn-primary'
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              >
                {lobby?.players.length >= lobby?.minPlayers
                  ? '🎮 เริ่มเกม'
                  : `รออีก ${lobby?.minPlayers - lobby?.players.length} คน...`}
              </motion.button>
            )}

            {!isHost && (
              <div className="mt-6 text-center text-slate-400">
                รอหัวหน้าห้องเริ่มเกม...
              </div>
            )}
            </div>
          </motion.div>

          {/* Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <Chat />
          </motion.div>
        </div>

        {/* Game Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card mt-6"
        >
          <h3 className="text-xl font-bold mb-6">📜 วิธีเล่น</h3>
          
          {/* เฟสต่างๆ */}
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300 mb-6 pb-6 border-b border-slate-700">
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">🌙 เฟสกลางคืน</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>มนุษย์หมาป่าเลือกเหยื่อ</li>
                <li>หมอดูตรวจสอบผู้เล่น</li>
                <li>หมอปกป้องผู้เล่น</li>
                <li>แม่มดใช้ยาชุบชีวิต/ยาพิษ</li>
                <li>คิวปิดจับคู่รัก (คืนแรก)</li>
                <li>อัลฟ่ามนุษย์หมาป่าแปลงร่าง</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">☀️ เฟสกลางวัน</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>คุยกันว่าใครน่าจะเป็นหมาป่า</li>
                <li>โหวตกำจัดผู้ต้องสงสัย</li>
                <li>นับเสียงข้างมาก (ไม่ต้องทุกคน)</li>
                <li>นักล่าแก้แค้นถ้าถูกกำจัด</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Lobby;

