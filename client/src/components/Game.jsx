import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../utils/sounds';
import { getRoleEmoji, getRoleColor, getRoleTextColor } from '../utils/roleHelpers';
import Chat from './Chat';
import WerewolfChat from './WerewolfChat';
import PlayerList from './PlayerList';
import GameLog from './GameLog';
import NightActions from './NightActions';

function Game() {
  const { 
    phase, 
    day, 
    playerRole, 
    roleDescription, 
    timeRemaining, 
    showRoleModal, 
    setShowRoleModal,
    seerResult,
    setSeerResult,
    players,
    logs,
    roleAcknowledgements,
    showRoleChangeNotification,
    roleChangeMessage,
    setGameState,
    isSpectatorMode // ⭐ รับ spectator mode จาก gameState
  } = useGameStore();

  // State สำหรับ Hunter Revenge
  const [hunterRevengeTargets, setHunterRevengeTargets] = useState(null);
  const [selectedRevengeTarget, setSelectedRevengeTarget] = useState(null);
  
  // State สำหรับทีมหมาป่า
  const [werewolfTeam, setWerewolfTeam] = useState(null);
  
  // State สำหรับ Phase Announcement
  const [showPhaseAnnouncement, setShowPhaseAnnouncement] = useState(false);
  const [previousPhase, setPreviousPhase] = useState(null);
  
  // State สำหรับ Role Change Modal (ถูกกัดเป็นหมาป่า)
  const [showConvertModal, setShowConvertModal] = useState(false);

  // แสดง Phase Announcement เมื่อเปลี่ยน phase
  useEffect(() => {
    if (phase && phase !== previousPhase && previousPhase !== null) {
      setShowPhaseAnnouncement(true);
      
      // เล่นเสียงตาม phase
      if (phase === 'night') {
        soundManager.playNightStart();
      } else if (phase === 'day') {
        soundManager.playDayStart();
      }
      
      setTimeout(() => {
        setShowPhaseAnnouncement(false);
      }, 3000);
    }
    setPreviousPhase(phase);
  }, [phase]);

  // ⭐ แสดง Modal เมื่อถูกกัดเป็นหมาป่า (ในตอนกลางคืนถัดไป)
  useEffect(() => {
    if (phase === 'night' && roleChangeMessage && !showRoleModal) {
      // รอให้ Role Modal ปิดก่อน (ถ้ามี) แล้วค่อยแสดง Convert Modal
      const timer = setTimeout(() => {
        setShowConvertModal(true);
        
        // ปิดเองหลัง 2 วินาที
        setTimeout(() => {
          setShowConvertModal(false);
          // ล้างข้อความ
          setGameState({ roleChangeMessage: null });
        }, 2000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [phase, roleChangeMessage, showRoleModal, setGameState]);

  useEffect(() => {
    console.log('🎮 Game Component Mounted');
    console.log('👤 Player Role:', playerRole);
    console.log('📝 Role Description:', roleDescription);

    // เล่นเสียงได้รับบทบาท
    if (playerRole) {
      soundManager.playRoleAssigned();
    }

    socketService.on('phaseTimer', ({ timeRemaining }) => {
      useGameStore.getState().setGameState({ timeRemaining });
      
      // เตือนเมื่อเวลาเหลือ 10 วินาที
      if (timeRemaining === 10) {
        soundManager.playTimeWarning();
      }
    });

    socketService.on('gameLog', (message) => {
      const logs = useGameStore.getState().logs;
      useGameStore.getState().setGameState({
        logs: [...logs, { message, timestamp: Date.now() }]
      });
    });

    socketService.on('nightResults', (results) => {
      console.log('🌙 Night results:', results);
      // เล่นเสียงเมื่อมีคนตาย
      if (results.killedPlayers && results.killedPlayers.length > 0) {
        soundManager.playDeath();
      }
    });

    socketService.on('dayResults', (results) => {
      console.log('☀️ Day results:', results);
      // เล่นเสียงเมื่อมีคนถูกกำจัด
      if (results.eliminated) {
        soundManager.playDeath();
      }
    });

    // ⭐ รับผลการตรวจสอบของหมอดู
    socketService.on('seerResult', (result) => {
      console.log('🔮🔮🔮 Seer Result Event Received:', result);
      console.log('🔮 Result Details:', JSON.stringify(result, null, 2));
      
      // เล่นเสียง Seer
      soundManager.playSeerResult(result.isWerewolf);
      
      // แสดง modal ทันที
      useGameStore.getState().setSeerResult(result);
      
      // แสดง log ใน console
      const message = `${result.playerName} ${result.isWerewolf ? 'เป็นมนุษย์หมาป่า! 🐺' : 'ไม่ใช่มนุษย์หมาป่า ✓'}`;
      console.log('🔮 Message:', message);
    });

    // ⭐ รับ Hunter Revenge event
    socketService.on('hunterRevenge', ({ alivePlayers }) => {
      console.log('🏹 Hunter Revenge!', alivePlayers);
      setHunterRevengeTargets(alivePlayers);
      soundManager.playHunterShoot();
    });

    // ⭐ รับข้อมูลทีมหมาป่า
    socketService.on('werewolfTeam', ({ teammates }) => {
      console.log('🐺 Your werewolf teammates:', teammates);
      setWerewolfTeam(teammates);
    });

    // ⭐ รับสถานะการยืนยัน role
    socketService.on('roleAcknowledgementStatus', (status) => {
      console.log('✅ Role acknowledgement status:', status);
      useGameStore.getState().setGameState({ roleAcknowledgements: status });
    });

    return () => {
      socketService.off('phaseTimer');
      socketService.off('gameLog');
      socketService.off('nightResults');
      socketService.off('dayResults');
      socketService.off('seerResult');
      socketService.off('hunterRevenge');
      socketService.off('werewolfTeam');
      socketService.off('roleAcknowledgementStatus');
    };
  }, [playerRole, roleDescription]);

  // ⭐ ตรวจจับการเปลี่ยน phase และเล่นเสียง + ดนตรี + แสดง modal
  // เล่นเสียงตามเฟส (ลบ phase modal ออก)
  useEffect(() => {
    if (!phase) return;
    
    if (phase === 'night') {
      soundManager.playNightStart();
      soundManager.playMusic('night');
    } else if (phase === 'day') {
      soundManager.playDayStart();
      soundManager.playMusic('day');
    }
  }, [phase, day]);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handler สำหรับ Hunter Revenge
  const handleHunterRevenge = () => {
    if (selectedRevengeTarget) {
      socketService.emit('hunterShoot', selectedRevengeTarget);
      setHunterRevengeTargets(null);
      setSelectedRevengeTarget(null);
    }
  };

  // Handler สำหรับยืนยัน role
  const handleRoleAcknowledge = () => {
    socketService.emit('roleAcknowledged');
    useGameStore.getState().setShowRoleModal(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* 🌌 Dynamic Background ตาม Phase - ค่อยๆเปลี่ยน */}
      <motion.div
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 3.5, ease: "easeInOut" }}
        className={`fixed inset-0 -z-10 ${
          phase === 'night' 
            ? 'bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900'
            : 'bg-gradient-to-b from-blue-300 via-cyan-200 to-yellow-100'
        }`}
      />
      
      {/* 🌅 Phase Transition Overlay - smooth fade */}
      <AnimatePresence>
        {phase && (
          <motion.div
            key={`overlay-${phase}-${day}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            className={`fixed inset-0 -z-5 pointer-events-none ${
              phase === 'night' 
                ? 'bg-black'
                : 'bg-white'
            }`}
          />
        )}
      </AnimatePresence>

      {/* 🌟 Stars (กลางคืน) */}
      {phase === 'night' && (
        <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* 🌙 Moon (กลางคืน) */}
      <AnimatePresence>
        {phase === 'night' && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className="fixed top-10 right-10 w-24 h-24 -z-5 pointer-events-none"
          >
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-yellow-100 rounded-full blur-2xl opacity-40" />
            <div className="absolute inset-2 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow-2xl" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <div className="absolute top-3 left-4 w-3 h-3 bg-yellow-300 rounded-full opacity-60" />
              <div className="absolute top-8 right-6 w-2 h-2 bg-yellow-300 rounded-full opacity-40" />
              <div className="absolute bottom-6 left-7 w-4 h-4 bg-yellow-300 rounded-full opacity-50" />
            </motion.div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ☀️ Sun (กลางวัน) */}
      <AnimatePresence>
        {phase === 'day' && (
          <motion.div
            initial={{ y: -100, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.5 }}
            transition={{ duration: 3, ease: 'easeOut' }}
            className="fixed top-10 right-10 w-28 h-28 -z-5 pointer-events-none"
          >
          <div className="relative w-full h-full">
            {/* Sun rays */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute top-1/2 left-1/2 w-1 h-16 bg-gradient-to-t from-yellow-400 to-transparent origin-bottom"
                style={{
                  transform: `translate(-50%, -100%) rotate(${i * 30}deg)`,
                }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
            {/* Sun core */}
            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-60" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-3 bg-gradient-to-br from-yellow-300 via-orange-400 to-yellow-500 rounded-full shadow-2xl"
            />
          </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ☁️ Clouds */}
      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`cloud-${i}`}
            className={`absolute ${
              phase === 'night' ? 'opacity-20' : 'opacity-40'
            }`}
            style={{
              top: `${20 + i * 25}%`,
            }}
            animate={{
              x: ['-20%', '120%'],
            }}
            transition={{
              duration: 40 + i * 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <div className={`flex items-center ${
              phase === 'night' ? 'text-slate-700' : 'text-white'
            }`}>
              <div className="w-20 h-12 bg-current rounded-full" />
              <div className="w-16 h-10 bg-current rounded-full -ml-8" />
              <div className="w-24 h-14 bg-current rounded-full -ml-10" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 🌊 Phase Transition Effect */}
      <AnimatePresence>
        {phase && (
          <motion.div
            key={`transition-${phase}-${day}`}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 0, opacity: 0 }}
            exit={{ scaleY: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            className={`fixed inset-0 z-[100] origin-bottom pointer-events-none ${
              phase === 'night' 
                ? 'bg-gradient-to-t from-slate-900 to-transparent'
                : 'bg-gradient-to-t from-yellow-200 to-transparent'
            }`}
          />
        )}
      </AnimatePresence>

      {/* 📢 Phase Announcement Overlay */}
      <AnimatePresence>
        {showPhaseAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: 'easeOut',
                rotateY: { duration: 1 }
              }}
              className={`relative ${
                phase === 'night'
                  ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950'
                  : 'bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-400'
              } rounded-3xl p-12 shadow-2xl border-4 ${
                phase === 'night' ? 'border-blue-400' : 'border-yellow-500'
              }`}
            >
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 text-6xl">
                {phase === 'night' ? '🌙' : '☀️'}
              </div>
              <div className="absolute -bottom-6 -right-6 text-6xl">
                {phase === 'night' ? '⭐' : '🌤️'}
              </div>

              {/* Main content */}
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="text-9xl mb-4"
                >
                  {phase === 'night' ? '🌙' : '☀️'}
                </motion.div>
                
                <h2 className={`text-6xl font-bold mb-4 ${
                  phase === 'night' ? 'text-blue-200' : 'text-yellow-900'
                }`}>
                  {phase === 'night' ? 'กลางคืน' : 'กลางวัน'}
                </h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-2xl font-semibold ${
                    phase === 'night' ? 'text-slate-300' : 'text-orange-900'
                  }`}
                >
                  {phase === 'night' 
                    ? '🌙 หมู่บ้านกำลังหลับใหล...' 
                    : '☀️ เวลาอภิปรายและโหวต'}
                </motion.p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  className={`mt-6 px-8 py-3 rounded-full font-bold text-xl ${
                    phase === 'night'
                      ? 'bg-blue-600 text-white'
                      : 'bg-orange-500 text-white'
                  }`}
                >
                  วันที่ {day}
                </motion.div>
              </div>

              {/* Animated particles */}
              {phase === 'night' ? (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={`particle-night-${i}`}
                      className="absolute w-2 h-2 bg-blue-300 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        y: [0, -30, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(10)].map((_, i) => (
                    <motion.div
                      key={`particle-day-${i}`}
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full blur-sm"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                      }}
                      animate={{
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hunter Revenge Modal */}
      <AnimatePresence>
        {hunterRevengeTargets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-[80] p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: -90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateX: 90 }}
              className="max-w-2xl w-full rounded-2xl p-8 text-center shadow-2xl bg-gradient-to-br from-amber-700 to-red-800"
            >
              <div className="text-8xl mb-4 animate-pulse">
                🏹
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                นักล่าแก้แค้น!
              </h2>
              <p className="text-xl text-amber-200 mb-6">
                คุณถูกกำจัด แต่ยังมีลูกธนูสุดท้าย... เลือกเป้าหมายของคุณ!
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {hunterRevengeTargets.map((target) => (
                  <motion.button
                    key={target.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedRevengeTarget(target.id)}
                    className={`p-4 rounded-lg transition-all ${
                      selectedRevengeTarget === target.id
                        ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/50'
                        : 'bg-slate-700 hover:bg-slate-600 border-2 border-transparent'
                    }`}
                  >
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="font-semibold text-white break-words">{target.name}</div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={handleHunterRevenge}
                disabled={!selectedRevengeTarget}
                className={`btn text-xl px-8 py-4 ${
                  selectedRevengeTarget
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50'
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              >
                {selectedRevengeTarget ? '🏹 ยิงเป้าหมาย!' : 'เลือกเป้าหมาย'}
              </button>

              <p className="text-sm text-amber-300 mt-4">
                ⚠️ คุณมีเวลาจำกัด - เลือกอย่างรอบคอบ!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Seer Result Modal */}
      <AnimatePresence>
        {seerResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
            onClick={() => useGameStore.getState().setSeerResult(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-md w-full rounded-2xl p-8 text-center shadow-2xl bg-gradient-to-br ${
                seerResult.isWerewolf 
                  ? 'from-red-600 to-red-800' 
                  : 'from-green-600 to-green-800'
              }`}
            >
              <div className="text-7xl mb-6 animate-bounce">
                {seerResult.isWerewolf ? '🐺' : '✅'}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                🔮 ผลการตรวจสอบ
              </h2>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6 border-2 border-white/30">
                <p className="text-2xl font-bold text-white mb-3">
                  👤 {seerResult.playerName}
                </p>
                <p className={`text-3xl font-bold ${
                  seerResult.isWerewolf ? 'text-red-200' : 'text-green-200'
                }`}>
                  {seerResult.isWerewolf 
                    ? '❌ คนไม่ดี' 
                    : '✅ คนดี'}
                </p>
              </div>
              <button
                onClick={() => useGameStore.getState().setSeerResult(null)}
                className="btn bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                เข้าใจแล้ว
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Assignment Modal */}
      <AnimatePresence>
        {showRoleModal && playerRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={handleRoleAcknowledge}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`bg-gradient-to-br ${getRoleColor(playerRole)} p-8 rounded-2xl max-w-md w-full text-center shadow-2xl`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-8xl mb-4">{getRoleEmoji(playerRole)}</div>
              <h2 className="text-4xl font-bold text-white mb-4">
                คุณได้บทบาท
              </h2>
              <h3 className="text-5xl font-bold text-white mb-4">
                {playerRole}
              </h3>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6">
                <p className="text-white text-lg font-semibold mb-2">
                  🎯 ความสามารถ:
                </p>
                <p className="text-white/90 text-base">
                  {roleDescription}
                </p>
              </div>
              
              {/* แสดงจำนวนผู้เล่นที่ยืนยันแล้ว */}
              {roleAcknowledgements.total > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white/30">
                  <p className="text-white text-sm mb-2">
                    รอผู้เล่นอื่นยืนยัน...
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <div className="text-2xl font-bold text-white">
                      {roleAcknowledgements.acknowledged} / {roleAcknowledgements.total}
                    </div>
                    <div className="text-xs text-white/80">
                      ยืนยันแล้ว
                    </div>
                  </div>
                  {roleAcknowledgements.waiting > 0 && (
                    <p className="text-xs text-white/70 mt-2">
                      ⏳ รออีก {roleAcknowledgements.waiting} คน
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleRoleAcknowledge}
                className="btn bg-white text-slate-900 hover:bg-slate-100 px-8 py-3 text-lg font-bold shadow-lg hover:shadow-xl transition-all w-full"
              >
                ✓ เข้าใจแล้ว!
              </button>
              
              <p className="text-xs text-white/60 mt-3">
                กดปุ่มหรือกดพื้นที่ว่างเพื่อปิดการ์ด
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Change Notification (เมื่อถูก Alpha กัดเป็นหมาป่า) - แสดงในตอนกลางคืน */}
      <AnimatePresence>
        {showConvertModal && roleChangeMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ pointerEvents: 'none' }} // ⭐ ไม่ให้กดได้เลย
          >
            {/* Background Overlay - ไม่ปิดเมื่อกด */}
            <div className="absolute inset-0 bg-black/80" />
            
            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-red-900 to-orange-900 p-8 rounded-3xl shadow-2xl border-4 border-red-500 max-w-md mx-4">
              <div className="text-8xl text-center mb-4 animate-bounce">🐺</div>
              <h3 className="text-3xl font-bold text-white text-center mb-3">
                บทบาทเปลี่ยนแปลง!
              </h3>
              <p className="text-white text-center text-xl font-semibold">
                {roleChangeMessage}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        {/* Spectator Badge */}
        {isSpectatorMode && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-4 p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg border-2 border-yellow-400 shadow-2xl"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">👁️</span>
              <div>
                <div className="text-xl font-bold text-white">SPECTATOR MODE</div>
                <div className="text-sm text-yellow-200">คุณสามารถมองเห็นบทบาทของทุกคนได้</div>
              </div>
              <span className="text-3xl">👁️</span>
            </div>
          </motion.div>
        )}

        {/* Game Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-6"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {phase === 'night' ? '🌙' : '☀️'}
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  {phase === 'night' ? '🌙 เฟสกลางคืน' : '☀️ เฟสกลางวัน'} - วันที่ {day}
                </h1>
                <p className="text-slate-400">
                  {phase === 'night' ? 'หมู่บ้านกำลังหลับใหล...' : 'เวลาอภิปรายและโหวต'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Timer */}
              <div className="text-center">
                {roleAcknowledgements.waiting > 0 ? (
                  // ⭐ รอผู้เล่นพร้อม
                  <>
                    <div className="text-2xl font-bold text-red-400 animate-pulse">
                      ⏳ รอผู้เล่นพร้อม...
                    </div>
                    <div className="text-xs text-red-300 mt-1">
                      {roleAcknowledgements.acknowledged} / {roleAcknowledgements.total} พร้อม
                    </div>
                  </>
                ) : (
                  // ⭐ แสดงเวลาปกติ
                  <>
                    <div className={`text-4xl font-bold font-mono ${
                      timeRemaining <= 10 ? 'text-red-400 animate-pulse' : 'text-purple-400'
                    }`}>
                      {formatTime(timeRemaining)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {timeRemaining <= 10 ? '⏰ เหลือเวลา!' : '⏳ เวลาคงเหลือ'}
                    </div>
                  </>
                )}
              </div>

              {/* Your Role */}
              <button
                onClick={() => useGameStore.getState().setShowRoleModal(true)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <div className="text-2xl mb-1">{getRoleEmoji(playerRole)}</div>
                <div className="text-xs text-slate-300">บทบาทของคุณ</div>
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Players */}
            <PlayerList />

            {/* Actions Panel */}
            {phase === 'night' && (
              <NightActions />
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Game Log - แสดงแค่ว่าใครตาย ไม่บอกสาเหตุ */}
            <GameLog />

            {/* Chat - กลางคืน: แชทหมาป่า (ไม่รวมผู้ทรยศ), กลางวัน: แชทสาธารณะ */}
            {phase === 'night' ? (
              // กลางคืน: แชทเฉพาะหมาป่า (ไม่รวมผู้ทรยศ)
              (playerRole === 'มนุษย์หมาป่า' || 
               playerRole === 'อัลฟ่ามนุษย์หมาป่า' || 
               playerRole === 'ลูกหมาป่า') && werewolfTeam && werewolfTeam.length > 0 ? (
                <WerewolfChat teammates={werewolfTeam} />
              ) : (
                <div className="card">
                  <div className="text-center text-slate-400 py-8">
                    <div className="text-5xl mb-4">🌙</div>
                    <p>กลางคืนเงียบสงบ...</p>
                    <p className="text-sm mt-2">รอจนกว่าจะรุ่งอรุณ</p>
                  </div>
                </div>
              )
            ) : (
              // กลางวัน: แชทสาธารณะทุกคน
              <Chat />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;

