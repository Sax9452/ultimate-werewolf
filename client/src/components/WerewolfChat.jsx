import { useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import { soundManager } from '../utils/sounds';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

function WerewolfChat({ teammates }) {
  const { players, werewolfChatMessages, addWerewolfChatMessage, phase } = useGameStore();
  const [inputMessage, setInputMessage] = useState('');

  // ⭐ ตรวจสอบว่าผู้เล่นยังมีชีวิตอยู่หรือไม่
  const myId = socketService.socket?.id;
  const myPlayer = players.find(p => p.id === myId);
  const isAlive = myPlayer?.isAlive ?? true; // ถ้ายังไม่มีข้อมูล ให้ถือว่ามีชีวิต
  const canChat = isAlive && phase === 'night'; // ⭐ แชทหมาป่าได้แค่กลางคืนเท่านั้น

  useEffect(() => {
    socketService.on('werewolfChatMessage', (message) => {
      addWerewolfChatMessage(message);
      soundManager.playMessage();
    });

    return () => {
      socketService.off('werewolfChatMessage');
    };
  }, [addWerewolfChatMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && canChat) {
      socketService.emit('werewolfChat', inputMessage.trim());
      setInputMessage('');
    }
  };

  return (
    <div className="card h-[600px] flex flex-col bg-red-900/20 border-2 border-red-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-red-300">🐺 แชทหมาป่า {phase === 'night' ? '(เปิด)' : '(ปิด)'}</h3>
        <span className="text-xs text-red-400 bg-red-900/50 px-2 py-1 rounded">
          เฉพาะหมาป่า
        </span>
      </div>
      
      {/* Teammates Info */}
      {teammates && teammates.length > 0 && (
        <div className="mb-3 p-2 bg-red-900/30 rounded border border-red-700">
          <div className="text-xs text-red-300 font-semibold mb-1">เพื่อนร่วมทีม:</div>
          <div className="flex flex-wrap gap-1">
            {teammates.map((member, idx) => (
              <span key={idx} className="text-xs bg-red-800/50 px-2 py-0.5 rounded">
                {member.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {werewolfChatMessages.length === 0 ? (
          <div className="text-center text-red-400 mt-8">
            <div className="text-4xl mb-2">🐺</div>
            <div>ยังไม่มีข้อความ</div>
            <div className="text-sm text-red-500 mt-1">
              ประสานงานกับเพื่อนหมาป่า!
            </div>
          </div>
        ) : (
          werewolfChatMessages.map((msg, index) => {
            const myId = socketService.socket?.id;
            const isMyMessage = msg.playerId === myId;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isMyMessage
                      ? 'bg-red-700 text-white'
                      : 'bg-red-900/50 text-red-100 border border-red-700'
                  }`}
                >
                  <div className="text-xs opacity-75 mb-1 flex items-center gap-1">
                    <span className="font-semibold">{msg.playerName}</span>
                    <span>•</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="break-words">{msg.message}</div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            !isAlive 
              ? "💀 คุณตายแล้ว ไม่สามารถแชทได้" 
              : phase !== 'night' 
                ? "☀️ กลางวันไม่สามารถแชทหมาป่าได้" 
                : "พิมพ์ข้อความหมาป่า... 🐺"
          }
          className="flex-1 bg-red-900/30 border border-red-700 rounded-lg px-4 py-2 text-white placeholder-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          maxLength={200}
          disabled={!canChat}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || !canChat}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            inputMessage.trim() && canChat
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50'
              : 'bg-red-900/50 text-red-600 cursor-not-allowed'
          }`}
        >
          ส่ง
        </button>
      </form>

      <div className="mt-2 text-xs text-red-400 text-center">
        {!isAlive ? (
          <span>💀 ผู้เล่นที่ตายแล้วไม่สามารถส่งข้อความได้</span>
        ) : phase !== 'night' ? (
          <span>☀️ กลางวันไม่สามารถแชทหมาป่าได้</span>
        ) : (
          <span>⚠️ ข้อความนี้เห็นได้เฉพาะหมาป่าเท่านั้น</span>
        )}
      </div>
    </div>
  );
}

export default WerewolfChat;

