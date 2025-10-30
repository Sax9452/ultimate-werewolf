import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

function GameLogs({ logs = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  // จัดกลุ่ม logs ตาม day และ phase
  const groupedLogs = logs.reduce((acc, log) => {
    const key = `day-${log.day}-${log.phase}`;
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

  const sortedGroups = Object.values(groupedLogs).sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.phase === 'night' ? -1 : 1;
  });

  const getLogIcon = (type) => {
    const icons = {
      death: '💀',
      protect: '🛡️',
      inspect: '🔮',
      vote: '⚖️',
      convert: '🐺',
      heal: '💚',
      poison: '☠️',
      info: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  };

  const getLogColor = (type) => {
    const colors = {
      death: 'text-red-400',
      protect: 'text-blue-400',
      inspect: 'text-purple-400',
      vote: 'text-yellow-400',
      convert: 'text-orange-400',
      heal: 'text-green-400',
      poison: 'text-purple-600',
      info: 'text-slate-400'
    };
    return colors[type] || 'text-slate-400';
  };

  const getPhaseColor = (phase) => {
    return phase === 'night' 
      ? 'bg-gradient-to-r from-indigo-900 to-purple-900 border-purple-500' 
      : 'bg-gradient-to-r from-amber-900 to-orange-900 border-orange-500';
  };

  const getPhaseIcon = (phase) => {
    return phase === 'night' ? '🌙' : '☀️';
  };

  return (
    <>
      {/* ปุ่มเปิด Logs */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 btn bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-2xl flex items-center gap-2 px-6 py-3"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl">📜</span>
        <span className="font-bold">ประวัติเกม</span>
      </motion.button>

      {/* Modal แสดง Logs */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl border-2 border-purple-500/30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    📜 ประวัติเกม
                  </h2>
                  <p className="text-slate-400 mt-1">บันทึกเหตุการณ์ทุกคืนและทุกวัน</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white text-3xl transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Logs Content */}
              <div className="overflow-y-auto flex-1 space-y-4 pr-2">
                {sortedGroups.length === 0 ? (
                  <div className="text-center text-slate-400 py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p>ยังไม่มีบันทึกเหตุการณ์</p>
                  </div>
                ) : (
                  sortedGroups.map((group, idx) => (
                    <motion.div
                      key={`${group.day}-${group.phase}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="card bg-slate-800/50"
                    >
                      {/* Phase Header */}
                      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 mb-4 ${getPhaseColor(group.phase)}`}>
                        <span className="text-3xl">{getPhaseIcon(group.phase)}</span>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {group.phase === 'night' ? 'คืนที่' : 'วันที่'} {group.day}
                          </h3>
                          <p className="text-xs text-slate-300">
                            {group.phase === 'night' ? 'ช่วงกลางคืน' : 'ช่วงกลางวัน'}
                          </p>
                        </div>
                      </div>

                      {/* Logs List */}
                      <div className="space-y-2">
                        {group.logs.map((log, logIdx) => (
                          <motion.div
                            key={logIdx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 + logIdx * 0.02 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 hover:bg-slate-900/70 transition-colors"
                          >
                            <span className="text-2xl">{getLogIcon(log.type)}</span>
                            <p className={`flex-1 ${getLogColor(log.type)} font-medium`}>
                              {log.message}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default GameLogs;

