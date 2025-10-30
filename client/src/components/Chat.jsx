import { useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import { soundManager } from '../utils/sounds';
import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

function Chat() {
  const { players, chatMessages, addChatMessage, phase } = useGameStore();
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    socketService.on('chatMessage', (message) => {
      addChatMessage(message);
      // เล่นเสียงเมื่อมีข้อความใหม่
      soundManager.playMessage();
    });

    return () => {
      socketService.off('chatMessage');
    };
  }, [addChatMessage]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    // ⭐ กลางคืนไม่ให้พิมพ์แชทสาธารณะ
    if (inputMessage.trim() && isAlive && phase === 'day') {
      socketService.emit('chatMessage', inputMessage.trim());
      setInputMessage('');
    }
  };

  // ⭐ ตรวจสอบว่าผู้เล่นยังมีชีวิตอยู่หรือไม่
  const myId = socketService.socket?.id;
  const myPlayer = players.find(p => p.id === myId);
  const isAlive = myPlayer?.isAlive ?? true; // ถ้ายังไม่มีข้อมูล ให้ถือว่ามีชีวิต
  const canChat = isAlive && phase === 'day'; // ⭐ พิมพ์ได้แค่ตอนกลางวันเท่านั้น

  return (
    <div className="card h-[600px] flex flex-col">
      <h3 className="text-xl font-bold mb-4">💬 แชท {phase === 'day' ? '(สาธารณะ)' : '(ปิด)'}</h3>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {chatMessages.length === 0 ? (
          <div className="text-center text-slate-400 mt-8">
            ยังไม่มีข้อความ เริ่มคุยกันเลย!
          </div>
        ) : (
          chatMessages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-3 ${
                msg.isBot ? 'bg-blue-900/30 border border-blue-600' : 'bg-slate-700'
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className={`font-semibold ${msg.isBot ? 'text-blue-400' : 'text-purple-400'}`}>
                  {msg.playerName}:
                </span>
                <span className="text-slate-200">{msg.message}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </motion.div>
          ))
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
              : phase === 'night' 
                ? "🌙 กลางคืนไม่สามารถแชทได้" 
                : "พิมพ์ข้อความ..."
          }
          className="input flex-1"
          maxLength={200}
          disabled={!canChat}
        />
        <button
          type="submit"
          className="btn btn-primary px-4"
          disabled={!inputMessage.trim() || !canChat}
        >
          ส่ง
        </button>
      </form>
      {!isAlive ? (
        <div className="mt-2 text-xs text-red-400 text-center">
          💀 ผู้เล่นที่ตายแล้วไม่สามารถส่งข้อความได้
        </div>
      ) : phase === 'night' ? (
        <div className="mt-2 text-xs text-purple-400 text-center">
          🌙 กลางคืนไม่สามารถแชทสาธารณะได้
        </div>
      ) : null}
    </div>
  );
}

export default Chat;

