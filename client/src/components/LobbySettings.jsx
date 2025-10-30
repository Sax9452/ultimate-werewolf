import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { socketService } from '../services/socket';

function LobbySettings({ lobby, isHost }) {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(lobby?.settings || {
    nightDuration: 60,
    dayDuration: 180,
    roleDistribution: {
      'ชาวบ้าน': 1,
      'มนุษย์หมาป่า': 1,
      'หมอดู': 1,
      'บอดี้การ์ด': 1,
      'นักล่า': 0,
      'คิวปิด': 0,
      'ลูกหมาป่า': 0,
      'ผู้ทรยศ': 0,
      'แม่มด': 0,
      'ตัวตลก': 0,
      'อัลฟ่ามนุษย์หมาป่า': 0
    }
  });

  // เรียงลำดับและจัดกลุ่ม role
  const roleGroups = [
    {
      name: '👥 ทีมชาวบ้าน',
      color: 'green',
      roles: ['ชาวบ้าน']
    },
    {
      name: '🐺 ทีมหมาป่า',
      color: 'red',
      roles: ['มนุษย์หมาป่า', 'อัลฟ่ามนุษย์หมาป่า', 'ลูกหมาป่า', 'ผู้ทรยศ']
    },
    {
      name: '✨ บทบาทพิเศษ (ชาวบ้าน)',
      color: 'blue',
      roles: ['หมอดู', 'บอดี้การ์ด', 'แม่มด', 'นักล่า']
    },
    {
      name: '💫 บทบาทพิเศษ (อื่นๆ)',
      color: 'purple',
      roles: ['คิวปิด', 'ตัวตลก']
    }
  ];

  const roleEmojis = {
    'ชาวบ้าน': '👨‍🌾',
    'มนุษย์หมาป่า': '🐺',
    'อัลฟ่ามนุษย์หมาป่า': '👑🐺',
    'ลูกหมาป่า': '🐺',
    'ผู้ทรยศ': '🗡️',
    'หมอดู': '🔮',
    'บอดี้การ์ด': '🛡️',
    'แม่มด': '🧙‍♀️',
    'นักล่า': '🏹',
    'คิวปิด': '💘',
    'ตัวตลก': '🤡'
  };

  const roleDescriptions = {
    'ชาวบ้าน': 'พื้นฐาน - ไม่มีความสามารถ',
    'มนุษย์หมาป่า': 'ฆ่าชาวบ้านตอนกลางคืน',
    'อัลฟ่ามนุษย์หมาป่า': 'เลือกฆ่า หรือ กัดให้เป็นหมาป่า',
    'ลูกหมาป่า': 'ตายแล้วหมาป่าฆ่าได้ 2 คน',
    'ผู้ทรยศ': 'ฝั่งหมาป่า แต่ดูเป็นชาวบ้าน',
    'หมอดู': 'ตรวจสอบ role ได้คืนละคน',
    'บอดี้การ์ด': 'ปกป้องคนได้คืนละคน',
    'แม่มด': 'ปกป้อง/ฆ่า ได้คนละ 1 ครั้ง',
    'นักล่า': 'ยิงคนได้เมื่อตาย',
    'คิวปิด': 'จับคู่รัก 2 คน (ใช้ได้ครั้งเดียวในคืนแรก)',
    'ตัวตลก': 'ชนะเมื่อถูกโหวตในตอนเช้า'
  };

  const handleRoleChange = (role, value) => {
    let finalValue = Math.max(0, parseInt(value) || 0);
    
    // 🔒 Alpha Wolf มีได้แค่ 1 ตัวเท่านั้น
    if (role === 'อัลฟ่ามนุษย์หมาป่า') {
      finalValue = Math.min(finalValue, 1);
    }
    
    const newSettings = {
      ...settings,
      roleDistribution: {
        ...settings.roleDistribution,
        [role]: finalValue
      }
    };
    setSettings(newSettings);
  };

  const handleTimeChange = (phase, value) => {
    const newSettings = {
      ...settings,
      [phase]: Math.max(30, parseInt(value) || 30)
    };
    setSettings(newSettings);
  };

  const handleSaveSettings = () => {
    socketService.emit('updateLobbySettings', settings);
    setShowSettings(false);
  };

  const getTotalRoles = () => {
    return Object.entries(settings.roleDistribution)
      .reduce((sum, [_, count]) => sum + count, 0);
  };

  const getWerewolfCount = () => {
    const werewolfRoles = ['มนุษย์หมาป่า', 'อัลฟ่ามนุษย์หมาป่า', 'ลูกหมาป่า'];
    return werewolfRoles.reduce((sum, role) => sum + (settings.roleDistribution[role] || 0), 0);
  };

  const applyPreset = (presetName) => {
    const presets = {
      small: {
        'ชาวบ้าน': 3,
        'มนุษย์หมาป่า': 2,
        'หมอดู': 1,
        'บอดี้การ์ด': 0,
        'นักล่า': 0,
        'คิวปิด': 0,
        'ลูกหมาป่า': 0,
        'ผู้ทรยศ': 0,
        'แม่มด': 0,
        'ตัวตลก': 0,
        'อัลฟ่ามนุษย์หมาป่า': 0
      },
      medium: {
        'ชาวบ้าน': 4,
        'มนุษย์หมาป่า': 2,
        'หมอดู': 1,
        'บอดี้การ์ด': 1,
        'นักล่า': 1,
        'คิวปิด': 0,
        'ลูกหมาป่า': 0,
        'ผู้ทรยศ': 0,
        'แม่มด': 1,
        'ตัวตลก': 0,
        'อัลฟ่ามนุษย์หมาป่า': 0
      },
      large: {
        'ชาวบ้าน': 6,
        'มนุษย์หมาป่า': 2,
        'อัลฟ่ามนุษย์หมาป่า': 1,
        'ลูกหมาป่า': 0,
        'ผู้ทรยศ': 1,
        'หมอดู': 1,
        'บอดี้การ์ด': 1,
        'แม่มด': 1,
        'นักล่า': 1,
        'คิวปิด': 1,
        'ตัวตลก': 0
      }
    };

    if (presets[presetName]) {
      setSettings({
        ...settings,
        roleDistribution: presets[presetName]
      });
    }
  };

  const getWarnings = () => {
    const warnings = [];
    const totalRoles = getTotalRoles();
    const playerCount = lobby?.players.length || 0;
    const werewolfCount = getWerewolfCount();

    if (totalRoles !== playerCount) {
      warnings.push(`⚠️ จำนวน role (${totalRoles}) ไม่เท่ากับผู้เล่น (${playerCount})`);
    }
    
    if (werewolfCount === 0) {
      warnings.push('⚠️ ไม่มีหมาป่าเลย!');
    } else if (werewolfCount >= totalRoles / 2) {
      warnings.push('⚠️ หมาป่ามากเกินไป! (ควรน้อยกว่าครึ่ง)');
    }

    if (settings.roleDistribution['ชาวบ้าน'] === 0) {
      warnings.push('⚠️ ควรมีชาวบ้านอย่างน้อย 1 คน');
    }

    return warnings;
  };

  if (!isHost) return null;

  return (
    <>
      <button
        onClick={() => setShowSettings(true)}
        className="btn btn-secondary text-sm px-4 py-2"
      >
        ⚙️ ตั้งค่าห้อง
      </button>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ⚙️ ตั้งค่าห้อง
              </h2>

              {/* เวลาของแต่ละเฟส */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">⏱️ เวลาของแต่ละเฟส</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      🌙 เวลากลางคืน (วินาที)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={settings.nightDuration}
                      onChange={(e) => handleTimeChange('nightDuration', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">
                      ☀️ เวลากลางวัน (วินาที)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="600"
                      value={settings.dayDuration}
                      onChange={(e) => handleTimeChange('dayDuration', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Buttons */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">
                  🎯 ตั้งค่าด่วน
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => applyPreset('small')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    🎮 เกมเล็ก (6 คน)
                  </button>
                  <button
                    onClick={() => applyPreset('medium')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    🎮 เกมกลาง (10 คน)
                  </button>
                  <button
                    onClick={() => applyPreset('large')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    🎮 เกมใหญ่ (15 คน)
                  </button>
                </div>
              </div>

              {/* สรุปและ Warning */}
              <div className="mb-6">
                <div className="bg-slate-700/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">👥 ผู้เล่นทั้งหมด:</span>
                    <span className="font-bold text-white">{lobby?.players.length || 0} คน</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">🎭 บทบาททั้งหมด:</span>
                    <span className={`font-bold ${getTotalRoles() === lobby?.players.length ? 'text-green-400' : 'text-red-400'}`}>
                      {getTotalRoles()} บทบาท
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">🐺 หมาป่าทั้งหมด:</span>
                    <span className="font-bold text-red-400">{getWerewolfCount()} ตัว</span>
                  </div>
                </div>

                {/* Warnings */}
                {getWarnings().length > 0 && (
                  <div className="mt-3 space-y-2">
                    {getWarnings().map((warning, idx) => (
                      <div key={idx} className="bg-yellow-900/30 border border-yellow-600/50 text-yellow-200 p-2 rounded text-sm">
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* จำนวน Role แบ่งตามกลุ่ม */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-purple-400">
                  🎭 ตั้งค่าบทบาท
                </h3>
                
                {roleGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="mb-4">
                    <div className={`text-sm font-semibold mb-2 ${
                      group.color === 'green' ? 'text-green-400' :
                      group.color === 'red' ? 'text-red-400' :
                      group.color === 'blue' ? 'text-blue-400' :
                      'text-purple-400'
                    }`}>
                      {group.name}
                    </div>
                    <div className="grid gap-2">
                      {group.roles.map((role) => (
                        <div key={role} className={`flex items-center gap-3 p-3 rounded-lg ${
                          group.color === 'green' ? 'bg-green-900/20 border border-green-700/30' :
                          group.color === 'red' ? 'bg-red-900/20 border border-red-700/30' :
                          group.color === 'blue' ? 'bg-blue-900/20 border border-blue-700/30' :
                          'bg-purple-900/20 border border-purple-700/30'
                        }`}>
                          <div className="text-2xl w-10 text-center">{roleEmojis[role]}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-white">{role}</div>
                            <div className="text-xs text-slate-400">{roleDescriptions[role]}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRoleChange(role, settings.roleDistribution[role] - 1)}
                              className="w-8 h-8 bg-slate-600 hover:bg-slate-500 rounded flex items-center justify-center text-xl transition-colors"
                            >
                              -
                            </button>
                            <div className="w-12 text-center font-bold text-lg text-white">
                              {settings.roleDistribution[role]}
                            </div>
                            <button
                              onClick={() => handleRoleChange(role, settings.roleDistribution[role] + 1)}
                              className="w-8 h-8 bg-slate-600 hover:bg-slate-500 rounded flex items-center justify-center text-xl transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ปุ่มบันทึก */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveSettings}
                  disabled={getWarnings().length > 0}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
                    getWarnings().length > 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg'
                  }`}
                >
                  {getWarnings().length > 0 ? '⚠️ แก้ไขปัญหาก่อนบันทึก' : '✓ บันทึกการตั้งค่า'}
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default LobbySettings;

