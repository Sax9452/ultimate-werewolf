import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { socketService } from '../services/socket';
import { soundManager } from '../utils/sounds';
import { getRoleEmoji, getRoleTextColor } from '../utils/roleHelpers';
import { motion, AnimatePresence } from 'framer-motion';

function PlayerList() {
  const { players, phase, day, playerRole, isSpectatorMode } = useGameStore();
  const myId = socketService.socket?.id;
  const myPlayer = players.find(p => p.id === myId);

  // ⭐ ฟังก์ชันตรวจสอบว่าเป็นพวกเดียวกันหรือไม่
  const isSameTeam = (role1, role2) => {
    const werewolfTeamRoles = ['มนุษย์หมาป่า', 'อัลฟ่ามนุษย์หมาป่า', 'ลูกหมาป่า', 'ผู้ทรยศ'];
    
    // ถ้าทั้งคู่เป็นทีมหมาป่า (รวมผู้ทรยศ)
    if (werewolfTeamRoles.includes(role1) && werewolfTeamRoles.includes(role2)) {
      return true;
    }
    
    // บทบาทอื่นๆ ไม่มีทีม (ยกเว้น Lovers ซึ่งจะไม่แสดงในที่นี้)
    return false;
  };
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [selectedTarget2, setSelectedTarget2] = useState(null); // สำหรับคิวปิด
  const [hasActioned, setHasActioned] = useState(false);
  const [werewolfVotes, setWerewolfVotes] = useState([]); // voteCounts ของหมาป่า
  const [dayVotes, setDayVotes] = useState([]); // ⭐ การโหวตกลางวัน
  const [lastProtectedTarget, setLastProtectedTarget] = useState(null); // ⭐ คนที่ปกป้องไปคืนที่แล้ว
  const [errorMessage, setErrorMessage] = useState(''); // ⭐ ข้อความแจ้งเตือน
  // ⭐ ลบ doctorVotes และ seerVotes - ไม่ใช้แล้ว (แต่ละคนไม่เห็นกัน)

  // Reset เมื่อเปลี่ยน phase
  useEffect(() => {
    setSelectedTarget(null);
    setSelectedTarget2(null);
    setHasActioned(false);
    setWerewolfVotes([]);
    setDayVotes([]); // ⭐ reset day votes
    setErrorMessage(''); // ⭐ reset error message
  }, [phase, day]);

  // รับข้อมูลการโหวตของหมาป่า (เฉพาะหมาป่าเท่านั้น)
  useEffect(() => {
    const handleWerewolfVoteUpdate = (voteData) => {
      console.log('🐺 Received werewolf votes:', voteData);
      setWerewolfVotes(voteData.voteCounts || []);
    };

    const handleDayVoteUpdate = (voteData) => {
      console.log('⚖️ Received day votes:', voteData);
      setDayVotes(voteData.voteCounts || []);
    };

    // ⭐ รับข้อมูล lastProtectedTarget จาก server
    const handleLastProtectedUpdate = (data) => {
      console.log('🛡️ Received lastProtectedTarget:', data);
      setLastProtectedTarget(data.lastProtectedTarget || null);
    };

    // ⭐ รับ error message จาก server
    const handleError = (data) => {
      console.log('❌ Error:', data.message);
      setErrorMessage(data.message);
      soundManager.playError();
      setTimeout(() => setErrorMessage(''), 3000); // ลบหลัง 3 วินาที
    };

    socketService.on('werewolfVoteUpdate', handleWerewolfVoteUpdate);
    socketService.on('dayVoteUpdate', handleDayVoteUpdate);
    socketService.on('lastProtectedUpdate', handleLastProtectedUpdate); // ⭐ รับข้อมูล lastProtected
    socketService.on('error', handleError); // ⭐ รับ error

    return () => {
      socketService.off('werewolfVoteUpdate', handleWerewolfVoteUpdate);
      socketService.off('dayVoteUpdate', handleDayVoteUpdate);
      socketService.off('lastProtectedUpdate', handleLastProtectedUpdate);
      socketService.off('error', handleError);
    };
  }, []);

  // เรียงลำดับให้ตัวเองอยู่คนแรก
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.id === myId) return -1;
    if (b.id === myId) return 1;
    return 0;
  });

  // ตรวจสอบว่าสามารถทำ action ได้หรือไม่
  // ⭐ Alpha Wolf, Witch, Cupid ใช้ Modal แยก (NightActions.jsx) ไม่ใช้ PlayerList
  const canDoNightAction = phase === 'night' && myPlayer?.isAlive && !hasActioned && 
    ['มนุษย์หมาป่า', 'ลูกหมาป่า', 'หมอดู', 'บอดี้การ์ด'].includes(playerRole);
  
  const canVote = phase === 'day' && myPlayer?.isAlive && !hasActioned;
  
  const canDoAction = canDoNightAction || canVote;

  const handlePlayerClick = (player) => {
    if (!canDoAction) return;
    
    // ⭐ บอดี้การ์ดสามารถเลือกตัวเองได้ในตอนกลางคืนเท่านั้น
    if (player.id === myId) {
      if (phase === 'night' && playerRole === 'บอดี้การ์ด') {
        // บอดี้การ์ดเลือกตัวเองได้ตอนกลางคืน
      } else {
        return; // ไม่ให้เลือกตัวเองในกรณีอื่น
      }
    }
    
    if (!player.isAlive) return; // ไม่ให้เลือกคนตาย

    // ⭐ ป้องกันไม่ให้หมาป่าฆ่าพวกเดียวกัน (รวมผู้ทรยศ)
    if (phase === 'night') {
      const werewolfRoles = ['มนุษย์หมาป่า', 'ลูกหมาป่า'];
      const werewolfTeamRoles = ['มนุษย์หมาป่า', 'อัลฟ่ามนุษย์หมาป่า', 'ลูกหมาป่า', 'ผู้ทรยศ'];
      const isMyRoleWerewolf = werewolfRoles.includes(playerRole);
      const isTargetInWerewolfTeam = werewolfTeamRoles.includes(player.role);
      
      if (isMyRoleWerewolf && isTargetInWerewolfTeam) {
        // หมาป่าไม่สามารถเลือกพวกเดียวกันได้ (รวมผู้ทรยศ)
        return;
      }
      
      // ⭐ ป้องกันไม่ให้ Bodyguard ปกป้องคนเดิม 2 คืนติดกัน
      if (playerRole === 'บอดี้การ์ด' && lastProtectedTarget === player.id) {
        setErrorMessage('⚠️ ไม่สามารถปกป้องคนเดิม 2 คืนติดกันได้');
        soundManager.playError();
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
    }

    // Toggle selection สำหรับ role อื่น
    if (selectedTarget === player.id) {
      setSelectedTarget(null);
    } else {
      setSelectedTarget(player.id);
      soundManager.playClick();
    }
  };

  const handleConfirm = () => {
    if (!selectedTarget || !canDoAction) return;

    if (phase === 'night') {
      // Night action สำหรับ Werewolf, Wolf Cub, Seer, Bodyguard
      // (Alpha Wolf, Witch, Cupid ใช้ Modal แยก)
      socketService.emit('nightAction', { targetId: selectedTarget });
      setHasActioned(true);
      soundManager.playAction();
    } else if (phase === 'day') {
      // Day vote
      socketService.emit('vote', selectedTarget);
      setHasActioned(true);
      soundManager.playVote();
    }
  };

  const handleSkip = () => {
    if (!canDoAction) return;

    if (phase === 'day') {
      socketService.emit('skipVote');
      setHasActioned(true);
      soundManager.playClick();
    }
  };

  // รับข้อความตามบทบาทและเฟส
  const getActionText = () => {
    if (phase === 'night') {
      switch (playerRole) {
        case 'มนุษย์หมาป่า':
        case 'ลูกหมาป่า':
          return { title: '🐺 เลือกเหยื่อ', button: 'ฆ่า', color: 'red' };
        case 'หมอดู':
          return { title: '🔮 ตรวจสอบ', button: 'ตรวจสอบ', color: 'purple' };
        case 'บอดี้การ์ด':
          return { title: '🛡️ ปกป้อง', button: 'ปกป้อง', color: 'blue' };
        // Alpha Wolf, Witch, Cupid ใช้ Modal แยก
        default:
          return null;
      }
    } else if (phase === 'day') {
      return { title: '⚖️ โหวตกำจัด', button: 'โหวต', color: 'red' };
    }
    return null;
  };

  const actionText = getActionText();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">
          👥 ผู้เล่น ({players.filter(p => p.isAlive).length}/{players.length})
        </h3>
        {canDoAction && selectedTarget && actionText && (
          <div className="text-sm text-amber-400 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
            {actionText.title}
          </div>
        )}
      </div>

      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
        {sortedPlayers.map((player, index) => {
          const isMe = player.id === myId;
          const isSelected = selectedTarget === player.id || selectedTarget2 === player.id;
          const isFirstTarget = selectedTarget === player.id;
          const isSecondTarget = selectedTarget2 === player.id;
          // ⭐ บอดี้การ์ดเลือกตัวเองได้ตอนกลางคืน
          const canSelectSelf = phase === 'night' && playerRole === 'บอดี้การ์ด' && player.id === myId;
          const isSelectable = canDoAction && player.isAlive && (player.id !== myId || canSelectSelf);
          
          // หาว่าผู้เล่นคนนี้ได้รับโหวตจากหมาป่ากี่เสียง
          const wolfVoteCount = werewolfVotes.find(v => v.targetId === player.id)?.votes || 0;
          // ⭐ หาว่าผู้เล่นคนนี้ได้รับโหวตกลางวันกี่เสียง
          const dayVoteCount = dayVotes.find(v => v.targetId === player.id)?.votes || 0;

          return (
            <motion.button
              key={player.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => handlePlayerClick(player)}
              disabled={!isSelectable}
              className={`relative aspect-square p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                isSelected
                  ? actionText?.color === 'red'
                    ? 'bg-red-600 border-2 border-red-400 shadow-lg shadow-red-500/50 scale-105'
                    : actionText?.color === 'purple'
                    ? 'bg-purple-600 border-2 border-purple-400 shadow-lg shadow-purple-500/50 scale-105'
                    : 'bg-blue-600 border-2 border-blue-400 shadow-lg shadow-blue-500/50 scale-105'
                  : player.isAlive 
                    ? isSelectable
                      ? 'bg-gradient-to-br from-slate-700 to-slate-600 border-2 border-slate-500 shadow-lg hover:scale-105 hover:border-amber-500 cursor-pointer'
                      : 'bg-gradient-to-br from-slate-700 to-slate-600 border-2 border-slate-500 shadow-lg cursor-default'
                    : 'bg-slate-800/30 border-2 border-slate-700/50 opacity-60 cursor-not-allowed'
              }`}
            >
              {/* Status Badge - แสดงเฉพาะคนตาย */}
              {!player.isAlive && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm bg-red-500 shadow-lg">
                  💀
                </div>
              )}

              {/* Day Vote Count Badge - วงกลมม่วงพร้อมตัวเลข */}
              {dayVoteCount > 0 && phase === 'day' && player.isAlive && (
                <div className="absolute -top-2 -left-2 w-9 h-9 rounded-full flex items-center justify-center text-base bg-purple-600 shadow-lg border-2 border-purple-400 font-bold">
                  {dayVoteCount}
                </div>
              )}

              {/* Werewolf Vote Count - แสดงเฉพาะหมาป่า */}
              {wolfVoteCount > 0 && phase === 'night' && player.isAlive && 
               (playerRole === 'มนุษย์หมาป่า' || playerRole === 'อัลฟ่ามนุษย์หมาป่า' || playerRole === 'ลูกหมาป่า') && (
                <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-red-600 shadow-lg border-2 border-red-400 font-bold">
                  {wolfVoteCount}🐺
                </div>
              )}

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-lg bg-amber-500 shadow-lg"
                >
                  {playerRole === 'อัลฟ่ามนุษย์หมาป่า' && phase === 'night' ? (
                    <span className="text-sm font-bold">{isFirstTarget ? '1️⃣' : '2️⃣'}</span>
                  ) : (
                    '🎯'
                  )}
                </motion.div>
              )}

              {/* Player Name - ตัวเองสีเขียว, หมาป่าเพื่อนสีแดง */}
              <div className={`font-bold text-base mb-1 break-words ${
                !player.isAlive 
                  ? 'line-through text-slate-500'
                  : isMe
                    ? 'text-green-400'
                    : !isSpectatorMode && !isMe && playerRole && player.role && isSameTeam(playerRole, player.role)
                      ? 'text-red-400'
                      : ''
              }`}>
                {player.name}
                {isMe && ' (คุณ)'}
                {/* ⭐ แสดง role ในวงเล็บถ้าเป็นพวกเดียวกัน (หมาป่า) */}
                {!isSpectatorMode && !isMe && playerRole && player.role && isSameTeam(playerRole, player.role) && (
                  <span className="text-red-300 text-sm"> ({player.role})</span>
                )}
              </div>

              {/* Spectator Mode - แสดง Role ทุกคน */}
              {isSpectatorMode && player.role && (
                <div className="text-xs mb-1">
                  <span className="px-2 py-0.5 rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
                    {player.role}
                  </span>
                </div>
              )}

              {/* Status Text */}
              {!player.isAlive && (
                <div className="text-xs">
                  <span className="text-red-400">ตาย</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {canDoAction && actionText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {/* แสดงข้อความช่วยเหลือ */}
            <div className={`p-3 rounded-lg border-2 text-sm ${
              actionText.color === 'red' 
                ? 'bg-red-900/20 border-red-600 text-red-200'
                : actionText.color === 'purple'
                ? 'bg-purple-900/20 border-purple-600 text-purple-200'
                : 'bg-blue-900/20 border-blue-600 text-blue-200'
            }`}>
              <div className="font-semibold mb-1">{actionText.title}</div>
              <div className="text-xs opacity-80">
                {playerRole === 'อัลฟ่ามนุษย์หมาป่า' && phase === 'night' 
                  ? `เลือกแล้ว ${selectedTarget ? 1 : 0}${selectedTarget2 ? '+1' : ''}/2 คน`
                  : 'คลิกที่ผู้เล่นเพื่อเลือก แล้วกดยืนยัน'
                }
              </div>
            </div>

            {/* ปุ่มดำเนินการ */}
            <div className="flex gap-3">
              <button
                onClick={handleConfirm}
                disabled={playerRole === 'อัลฟ่ามนุษย์หมาป่า' && phase === 'night' ? (!selectedTarget || !selectedTarget2) : !selectedTarget}
                className={`btn flex-1 py-3 text-lg font-bold ${
                  (playerRole === 'อัลฟ่ามนุษย์หมาป่า' && phase === 'night' ? (selectedTarget && selectedTarget2) : selectedTarget)
                    ? actionText.color === 'red'
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50'
                      : actionText.color === 'purple'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                }`}
              >
                {(playerRole === 'อัลฟ่ามนุษย์หมาป่า' && phase === 'night' && selectedTarget && selectedTarget2) ? `✓ ${actionText.button}` : 
                 selectedTarget ? `✓ ${actionText.button}` : 'เลือกผู้เล่น'}
              </button>
              
              {phase === 'day' && (
                <button
                  onClick={handleSkip}
                  className="btn bg-slate-700 hover:bg-slate-600 px-6 py-3"
                >
                  ข้าม
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* แสดงสถานะหลังทำ action */}
        {hasActioned && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 bg-green-900/30 rounded-lg border-2 border-green-500"
          >
            <div className="text-3xl mb-2">✓</div>
            <div className="text-green-400 font-bold text-lg">
              {phase === 'night' ? 'ทำการกระทำแล้ว' : 'โหวตแล้ว'}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              รอผู้เล่นอื่น...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PlayerList;
