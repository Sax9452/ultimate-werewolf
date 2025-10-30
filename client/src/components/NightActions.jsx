import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';
import { soundManager } from '../utils/sounds';
import { motion, AnimatePresence } from 'framer-motion';

function NightActions() {
  const { playerRole, players, phase, day, showRoleModal } = useGameStore();
  
  // ⭐ Hooks ต้องอยู่ด้านบนสุด และถูกเรียกทุกครั้ง (ห้าม conditional hooks)
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedTarget2, setSelectedTarget2] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [actionSubmitted, setActionSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [witchPotions, setWitchPotions] = useState({ heal: true, poison: true }); // ⭐ ยาของแม่มด

  useEffect(() => {
    setSelectedTarget(null);
    setSelectedTarget2(null);
    setActionType(null);
    setActionSubmitted(false);
    
    // ⭐ รับข้อมูลยาของแม่มด
    const handleWitchPotionsUpdate = (data) => {
      console.log('🧙‍♀️ Received witch potions:', data);
      setWitchPotions(data.potions || { heal: true, poison: true });
    };
    
    socketService.on('witchPotionsUpdate', handleWitchPotionsUpdate);
    
    // ⭐ รอให้ Role Card ปิดก่อน ถึงแสดง Night Action Modal
    if (phase === 'night' && !showRoleModal && (playerRole === 'คิวปิด' || playerRole === 'แม่มด' || playerRole === 'อัลฟ่ามนุษย์หมาป่า')) {
      // ขอข้อมูลยาของแม่มด
      if (playerRole === 'แม่มด') {
        socketService.emit('requestWitchPotions');
      }
      
      // เพิ่ม delay เล็กน้อยเพื่อให้แน่ใจว่า Role Modal ปิดแล้ว
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 500);
      return () => {
        clearTimeout(timer);
        socketService.off('witchPotionsUpdate', handleWitchPotionsUpdate);
      };
    }
    
    return () => {
      socketService.off('witchPotionsUpdate', handleWitchPotionsUpdate);
    };
  }, [phase, day, playerRole, showRoleModal]);

  // ⭐ หลัง hooks แล้ว ถึงจะเช็คเงื่อนไขและ return null ได้
  const myId = socketService.socket?.id;
  const myPlayer = players.find(p => p.id === myId);

  const simpleRoles = ['มนุษย์หมาป่า', 'ลูกหมาป่า', 'หมอดู', 'บอดี้การ์ด'];
  
  if (simpleRoles.includes(playerRole)) {
    return null;
  }

  if (!['คิวปิด', 'แม่มด', 'อัลฟ่ามนุษย์หมาป่า'].includes(playerRole)) {
    return null;
  }

  if (!myPlayer?.isAlive) {
    return null;
  }

  // ⭐ กรองเป้าหมายที่ถูกต้องสำหรับแต่ละ role
  let availableTargets = [];
  
  if (playerRole === 'แม่มด') {
    // แม่มดเลือกได้ทุกคนรวมตัวเอง
    availableTargets = players.filter(p => p.isAlive);
  } else if (playerRole === 'อัลฟ่ามนุษย์หมาป่า') {
    // ⭐ Alpha Wolf แสดงทุกคน (แต่จะ disable พวกเดียวกันใน UI)
    availableTargets = players.filter(p => p.isAlive);
  } else if (playerRole === 'คิวปิด') {
    // คิวปิดเลือกได้ทุกคนยกเว้นตัวเอง
    availableTargets = players.filter(p => p.isAlive && p.id !== myId);
  } else {
    // Default: เลือกได้ทุกคนยกเว้นตัวเอง
    availableTargets = players.filter(p => p.isAlive && p.id !== myId);
  }

  const handleSubmitAction = () => {
    let action = {};

    if (playerRole === 'คิวปิด') {
      if (selectedTarget && selectedTarget2 && selectedTarget !== selectedTarget2) {
        action = { 
          type: 'cupid', 
          lover1: selectedTarget, 
          lover2: selectedTarget2 
        };
      } else {
        return;
      }
    } else if (playerRole === 'แม่มด') {
      if (actionType && selectedTarget) {
        action = { 
          type: actionType,
          targetId: selectedTarget 
        };
      } else {
        return;
      }
    } else if (playerRole === 'อัลฟ่ามนุษย์หมาป่า') {
      if (actionType && selectedTarget) {
        action = { 
          type: actionType, // 'kill' หรือ 'convert'
          targetId: selectedTarget 
        };
      } else {
        return;
      }
    }

    socketService.emit('nightAction', action);
    setActionSubmitted(true);
    
    if (playerRole === 'คิวปิด') {
      soundManager.playLover();
    } else {
      soundManager.playAction();
    }
  };

  const handleCloseModal = () => {
    if (actionSubmitted) {
      setShowModal(false);
    }
  };

  // Modal สำหรับอัลฟ่ามนุษย์หมาป่า
  if (playerRole === 'อัลฟ่ามนุษย์หมาป่า' && showModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="bg-gradient-to-br from-red-900 to-slate-900 p-8 rounded-2xl max-w-3xl w-full shadow-2xl border-2 border-red-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-red-300">👑🐺 อัลฟ่ามนุษย์หมาป่า</h3>
                <p className="text-slate-400 mt-2">เลือกฆ่าผู้เล่น หรือกัดให้กลายเป็นหมาป่า (ใช้ได้คืนละครั้ง)</p>
              </div>
              {actionSubmitted && (
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white text-2xl">
                  ✕
                </button>
              )}
            </div>

            {actionSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-green-900/30 rounded-xl border-2 border-green-500"
              >
                <div className="text-6xl mb-4">✓</div>
                <div className="text-green-400 font-bold text-2xl mb-2">ยืนยันแล้ว</div>
                <div className="text-slate-300 text-lg">รอผู้เล่นอื่น...</div>
                <button onClick={handleCloseModal} className="mt-6 btn bg-slate-700 hover:bg-slate-600 px-8 py-3">
                  ปิด
                </button>
              </motion.div>
            ) : (
              <>
                {/* เลือกประเภท */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => setActionType('kill')}
                    className={`p-6 rounded-xl transition-all ${
                      actionType === 'kill'
                        ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/50'
                        : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600'
                    }`}
                  >
                    <div className="text-5xl mb-2">⚔️</div>
                    <div className="font-bold text-lg">ฆ่า</div>
                    <div className="text-sm text-slate-400">ฆ่าผู้เล่น 1 คน</div>
                  </button>
                  <button
                    onClick={() => setActionType('convert')}
                    className={`p-6 rounded-xl transition-all ${
                      actionType === 'convert'
                        ? 'bg-orange-600 border-2 border-orange-400 shadow-lg shadow-orange-500/50'
                        : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600'
                    }`}
                  >
                    <div className="text-5xl mb-2">🐺</div>
                    <div className="font-bold text-lg">กัด</div>
                    <div className="text-sm text-slate-400">แปลงเป็นหมาป่า</div>
                  </button>
                </div>

                {/* เลือกเป้าหมาย */}
                {actionType && (
                  <>
                    <p className="text-lg text-slate-300 mb-4 font-semibold">
                      เลือกเป้าหมายสำหรับ{actionType === 'kill' ? 'ฆ่า ⚔️' : 'กัด 🐺'}:
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6 max-h-[300px] overflow-y-auto">
                      {availableTargets.map((player) => {
                        // ⭐ เช็คว่าเป็นพวกเดียวกันไหม (แสดงข้อมูลให้ Alpha Wolf รู้)
                        const werewolfTeamRoles = ['มนุษย์หมาป่า', 'อัลฟ่ามนุษย์หมาป่า', 'ลูกหมาป่า', 'ผู้ทรยศ'];
                        const isTeammate = player.role && werewolfTeamRoles.includes(player.role);
                        const isMe = player.id === socketService.socket?.id;
                        
                        return (
                          <motion.button
                            key={player.id}
                            whileHover={{ scale: isTeammate ? 1 : 1.05 }}
                            whileTap={{ scale: isTeammate ? 1 : 0.95 }}
                            onClick={() => {
                              if (isTeammate) {
                                soundManager.playError();
                                // แสดง notification ชั่วคราว
                                alert('⚠️ ไม่สามารถเลือกพวกเดียวกันได้!');
                                return;
                              }
                              setSelectedTarget(player.id);
                            }}
                            disabled={isTeammate}
                            className={`p-4 rounded-xl transition-all relative ${
                              isTeammate
                                ? 'bg-slate-800/50 border-2 border-red-500/50 opacity-60 cursor-not-allowed'
                                : selectedTarget === player.id
                                ? actionType === 'kill'
                                  ? 'bg-red-600 border-2 border-red-400 shadow-lg'
                                  : 'bg-orange-600 border-2 border-orange-400 shadow-lg'
                                : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600'
                            }`}
                          >
                            {/* ⭐ Badge แสดงว่าเป็นพวกเดียวกัน */}
                            {isTeammate && (
                              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold border-2 border-red-400 shadow-lg">
                                🐺
                              </div>
                            )}
                            <div className="text-3xl mb-2">👤</div>
                            {/* ⭐ ตัวเองสีเขียว, ทีมเดียวกันสีแดง */}
                            <div className={`font-semibold text-sm break-words ${
                              isMe ? 'text-green-400' : isTeammate ? 'text-red-400' : ''
                            }`}>
                              {player.name}
                              {isTeammate && player.role && (
                                <span className="text-red-300 text-xs block mt-1">({player.role})</span>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}

                <button
                  onClick={handleSubmitAction}
                  disabled={!actionType || !selectedTarget}
                  className={`btn w-full text-lg py-4 ${
                    actionType && selectedTarget 
                      ? actionType === 'kill'
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
                        : 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {actionType && selectedTarget ? (actionType === 'kill' ? '✓ ยืนยันการฆ่า' : '✓ ยืนยันการกัด') : 'เลือกการกระทำและเป้าหมาย'}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Modal สำหรับแม่มด
  if (playerRole === 'แม่มด' && showModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="bg-gradient-to-br from-purple-900 to-slate-900 p-8 rounded-2xl max-w-3xl w-full shadow-2xl border-2 border-purple-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-purple-300">🧙‍♀️ แม่มด</h3>
                <p className="text-slate-400 mt-2">รักษา และยาพิษ ใช้ได้คนละ 1 ครั้งตลอดทั้งเกม</p>
                {/* แสดงจำนวนยาที่เหลือ */}
                <div className="flex gap-4 mt-3">
                  <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    witchPotions.heal ? 'bg-green-900/50 text-green-300 border border-green-600' : 'bg-gray-900/50 text-gray-500 border border-gray-700'
                  }`}>
                    💚 รักษา: {witchPotions.heal ? '1' : '0'}
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    witchPotions.poison ? 'bg-purple-900/50 text-purple-300 border border-purple-600' : 'bg-gray-900/50 text-gray-500 border border-gray-700'
                  }`}>
                    ☠️ ยาพิษ: {witchPotions.poison ? '1' : '0'}
                  </div>
                </div>
              </div>
              {actionSubmitted && (
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white text-2xl">
                  ✕
                </button>
              )}
            </div>

            {actionSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-green-900/30 rounded-xl border-2 border-green-500"
              >
                <div className="text-6xl mb-4">✓</div>
                <div className="text-green-400 font-bold text-2xl mb-2">ยืนยันแล้ว</div>
                <div className="text-slate-300 text-lg">รอผู้เล่นอื่น...</div>
                <button onClick={handleCloseModal} className="mt-6 btn bg-slate-700 hover:bg-slate-600 px-8 py-3">
                  ปิด
                </button>
              </motion.div>
            ) : (
              <>
                {/* เลือกประเภท */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    onClick={() => witchPotions.heal && setActionType('heal')}
                    disabled={!witchPotions.heal}
                    className={`p-6 rounded-xl transition-all relative ${
                      actionType === 'heal'
                        ? 'bg-green-600 border-2 border-green-400 shadow-lg shadow-green-500/50'
                        : !witchPotions.heal
                        ? 'bg-gray-900/50 border-2 border-gray-700 opacity-50 cursor-not-allowed'
                        : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600'
                    }`}
                  >
                    <div className="text-5xl mb-2">💚</div>
                    <div className="font-bold text-lg">รักษา</div>
                    <div className="text-sm text-slate-400">
                      {witchPotions.heal ? 'ป้องกันการฆ่า 1 คน' : '❌ ใช้ไปแล้ว'}
                    </div>
                    {!witchPotions.heal && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        0
                      </div>
                    )}
                  </button>
                  <button
                    onClick={() => witchPotions.poison && setActionType('poison')}
                    disabled={!witchPotions.poison}
                    className={`p-6 rounded-xl transition-all relative ${
                      actionType === 'poison'
                        ? 'bg-purple-600 border-2 border-purple-400 shadow-lg shadow-purple-500/50'
                        : !witchPotions.poison
                        ? 'bg-gray-900/50 border-2 border-gray-700 opacity-50 cursor-not-allowed'
                        : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600'
                    }`}
                  >
                    <div className="text-5xl mb-2">☠️</div>
                    <div className="font-bold text-lg">ยาพิษ</div>
                    <div className="text-sm text-slate-400">
                      {witchPotions.poison ? 'ฆ่าผู้เล่น 1 คน' : '❌ ใช้ไปแล้ว'}
                    </div>
                    {!witchPotions.poison && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                        0
                      </div>
                    )}
                  </button>
                </div>

                {/* เลือกเป้าหมาย */}
                {actionType && (
                  <>
                    <p className="text-lg text-slate-300 mb-4 font-semibold">
                      เลือกเป้าหมายสำหรับ{actionType === 'heal' ? 'รักษา 💚' : 'ยาพิษ ☠️'}:
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6 max-h-[300px] overflow-y-auto">
                      {availableTargets.map((player) => {
                        const isMe = player.id === socketService.socket?.id;
                        return (
                          <motion.button
                            key={player.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedTarget(player.id)}
                            className={`p-4 rounded-xl transition-all ${
                              selectedTarget === player.id
                                ? actionType === 'heal'
                                  ? 'bg-green-600 border-2 border-green-400 shadow-lg'
                                  : 'bg-purple-600 border-2 border-purple-400 shadow-lg'
                                : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600'
                            }`}
                          >
                            <div className="text-3xl mb-2">👤</div>
                            <div className={`font-semibold text-sm break-words ${isMe ? 'text-green-400' : ''}`}>{player.name}</div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setActionSubmitted(true);
                      handleCloseModal();
                      soundManager.playSuccess();
                    }}
                    className="btn flex-1 text-lg py-4 bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    ⏭️ ข้าม (ไม่ใช้ยา)
                  </button>
                  <button
                    onClick={handleSubmitAction}
                    disabled={!actionType || !selectedTarget}
                    className={`btn flex-1 text-lg py-4 ${
                      actionType && selectedTarget 
                        ? actionType === 'heal'
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {actionType && selectedTarget ? (actionType === 'heal' ? '✓ ยืนยันการรักษา' : '✓ ยืนยันยาพิษ') : 'เลือกการกระทำและเป้าหมาย'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Modal สำหรับคิวปิด
  if (playerRole === 'คิวปิด' && showModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={handleCloseModal}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="bg-gradient-to-br from-pink-900 to-slate-900 p-8 rounded-2xl max-w-3xl w-full shadow-2xl border-2 border-pink-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-3xl font-bold text-pink-300">💘 คิวปิด</h3>
                <p className="text-slate-400 mt-2">จับคู่รัก 2 คน (ใช้ได้ครั้งเดียวในคืนแรก)</p>
                <p className="text-pink-300 text-sm mt-1">⚠️ ถ้าคนใดคนหนึ่งตาย อีกคนจะตายตามด้วย</p>
              </div>
              {actionSubmitted && (
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-white text-2xl">
                  ✕
                </button>
              )}
            </div>

            {actionSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-green-900/30 rounded-xl border-2 border-green-500"
              >
                <div className="text-6xl mb-4">💘</div>
                <div className="text-green-400 font-bold text-2xl mb-2">จับคู่รักแล้ว</div>
                <div className="text-slate-300 text-lg">รอผู้เล่นอื่น...</div>
                <button onClick={handleCloseModal} className="mt-6 btn bg-slate-700 hover:bg-slate-600 px-8 py-3">
                  ปิด
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-pink-900/30 border-2 border-pink-600 rounded-xl text-pink-200">
                  ⚠️ เลือก 2 คนเพื่อให้เป็นคู่รัก - พวกเขาจะมีชีวิตและตายร่วมกัน!
                </div>

                <p className="text-lg font-bold mb-3 text-pink-300">👤 คนที่ 1:</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6 max-h-[200px] overflow-y-auto">
                  {availableTargets.map((player) => {
                    const isMe = player.id === socketService.socket?.id;
                    return (
                      <motion.button
                        key={player.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTarget(player.id)}
                        disabled={selectedTarget2 === player.id}
                        className={`p-4 rounded-xl transition-all ${
                          selectedTarget === player.id
                            ? 'bg-pink-600 border-2 border-pink-400 shadow-lg'
                            : selectedTarget2 === player.id
                            ? 'bg-slate-800 opacity-50 cursor-not-allowed'
                            : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600'
                        }`}
                      >
                        <div className="text-3xl mb-1">{selectedTarget === player.id ? '💗' : '👤'}</div>
                        <div className={`font-semibold text-sm break-words ${isMe ? 'text-green-400' : ''}`}>{player.name}</div>
                      </motion.button>
                    );
                  })}
                </div>

                <p className="text-lg font-bold mb-3 text-pink-300">👤 คนที่ 2:</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6 max-h-[200px] overflow-y-auto">
                  {availableTargets.map((player) => {
                    const isMe = player.id === socketService.socket?.id;
                    return (
                      <motion.button
                        key={player.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedTarget2(player.id)}
                        disabled={selectedTarget === player.id}
                        className={`p-4 rounded-xl transition-all ${
                          selectedTarget2 === player.id
                            ? 'bg-pink-600 border-2 border-pink-400 shadow-lg'
                            : selectedTarget === player.id
                            ? 'bg-slate-800 opacity-50 cursor-not-allowed'
                            : 'bg-slate-700 hover:bg-slate-600 border-2 border-slate-600'
                        }`}
                      >
                        <div className="text-3xl mb-1">{selectedTarget2 === player.id ? '💗' : '👤'}</div>
                        <div className={`font-semibold text-sm break-words ${isMe ? 'text-green-400' : ''}`}>{player.name}</div>
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  onClick={handleSubmitAction}
                  disabled={!selectedTarget || !selectedTarget2 || selectedTarget === selectedTarget2}
                  className={`btn w-full text-lg py-4 ${
                    selectedTarget && selectedTarget2 && selectedTarget !== selectedTarget2
                      ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-500/50'
                      : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {selectedTarget && selectedTarget2 ? '💘 ยืนยันคู่รัก' : 'เลือก 2 คน'}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}

export default NightActions;
