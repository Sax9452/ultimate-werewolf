import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';
import { soundManager } from '../utils/sounds';
import { motion } from 'framer-motion';

function HomePage() {
  const { playerName, setPlayerName } = useGameStore();
  const [localName, setLocalName] = useState(playerName);
  const [lobbyCode, setLobbyCode] = useState('');
  const [showJoinLobby, setShowJoinLobby] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // เล่นดนตรีหน้าแรก
  useEffect(() => {
    soundManager.playMusic('home');
    return () => {
      soundManager.stopMusic();
    };
  }, []);

  // ⭐ รับ error จาก server
  useEffect(() => {
    socketService.on('error', ({ message }) => {
      console.log('❌ Error:', message);
      setErrorMessage(message);
      soundManager.playError();
      
      // ซ่อนข้อความหลัง 5 วินาที
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    });

    return () => {
      socketService.off('error');
    };
  }, []);

  const handleCreateLobby = () => {
    if (!localName.trim()) {
      setErrorMessage('กรุณาใส่ชื่อของคุณ');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    soundManager.init(); // Initialize audio context on first interaction
    soundManager.playClick();
    setPlayerName(localName);
    setErrorMessage(''); // ล้าง error
    
    // ⭐ ส่ง spectatorKey ถ้ามี
    const spectatorKey = sessionStorage.getItem('spectatorKey');
    socketService.emit('createLobby', { playerName: localName, spectatorKey });
  };

  const handleJoinLobby = () => {
    if (!localName.trim()) {
      setErrorMessage('กรุณาใส่ชื่อของคุณ');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (!lobbyCode.trim()) {
      setErrorMessage('กรุณาใส่รหัสห้อง');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (lobbyCode.trim().length !== 5) {
      setErrorMessage('รหัสห้องต้องมี 5 หลัก');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    soundManager.init(); // Initialize audio context on first interaction
    soundManager.playClick();
    setPlayerName(localName);
    setErrorMessage(''); // ล้าง error
    
    // ⭐ ส่ง spectatorKey ถ้ามี
    const spectatorKey = sessionStorage.getItem('spectatorKey');
    socketService.emit('joinLobby', { 
      lobbyCode: lobbyCode.toUpperCase(), 
      playerName: localName, 
      spectatorKey 
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-block"
          >
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              🐺 มนุษย์หมาป่า
            </h1>
            <p className="text-2xl text-purple-300 font-semibold">เกมหาหมาป่า ออนไลน์</p>
          </motion.div>
          <p className="text-slate-400 mt-4 text-lg">
            รอดให้ได้ผ่านคืนที่อันตราย เปิดเผยความจริง อย่าไว้ใจใคร
          </p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card space-y-6"
        >
          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-900/50 border-2 border-red-500 rounded-lg"
            >
              <div className="flex items-center gap-2 text-red-200">
                <span className="text-2xl">⚠️</span>
                <span className="font-semibold">{errorMessage}</span>
              </div>
            </motion.div>
          )}

          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              ชื่อเล่น
            </label>
            <input
              type="text"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="ใส่ชื่อเล่นของคุณ..."
              className="input"
              maxLength={12}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !showJoinLobby) {
                  handleCreateLobby();
                }
              }}
            />
          </div>

          {/* Join Lobby Section */}
          {showJoinLobby && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                รหัสห้อง
              </label>
              <input
                type="text"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                placeholder="ใส่รหัส 5 หลัก..."
                className="input"
                maxLength={5}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleJoinLobby();
                  }
                }}
              />
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {!showJoinLobby ? (
              <>
                <button
                  onClick={handleCreateLobby}
                  className="btn btn-primary w-full text-lg"
                >
                  🎮 สร้างห้องใหม่
                </button>
                <button
                  onClick={() => setShowJoinLobby(true)}
                  className="btn btn-secondary w-full text-lg"
                >
                  🚪 เข้าร่วมห้อง
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleJoinLobby}
                  className="btn btn-primary w-full text-lg"
                >
                  เข้าร่วมเกม
                </button>
                <button
                  onClick={() => {
                    setShowJoinLobby(false);
                    setLobbyCode('');
                  }}
                  className="btn btn-secondary w-full text-lg"
                >
                  ย้อนกลับ
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default HomePage;

