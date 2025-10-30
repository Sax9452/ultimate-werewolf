import { useState, useEffect } from 'react';
import { soundManager } from '../utils/sounds';
import { motion, AnimatePresence } from 'framer-motion';

function SoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [musicEnabled, setMusicEnabled] = useState(soundManager.isMusicEnabled());
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(soundManager.getVolume());
  const [musicVolume, setMusicVolume] = useState(soundManager.getMusicVolume());

  const toggleSound = () => {
    const newState = soundManager.toggle();
    setSoundEnabled(newState);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };

  const handleMusicVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
    soundManager.setMusicVolume(newVolume);
  };

  const toggleMusic = () => {
    const newState = soundManager.toggleMusic();
    setMusicEnabled(newState);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-2 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl w-64"
          >
            <h4 className="text-sm font-bold text-slate-300 mb-3">🔊 ตั้งค่าเสียง</h4>
            
            {/* SFX Volume Slider */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">
                  เสียงเอฟเฟกต์ (SFX)
                </label>
                <span className="text-xs text-slate-300 font-mono">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                disabled={!soundEnabled}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="border-t border-slate-700 my-3"></div>

            {/* Music Toggle */}
            <div className="mb-3">
              <button
                onClick={toggleMusic}
                className={`w-full p-2 rounded-lg text-sm font-semibold transition-colors ${
                  musicEnabled
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-400'
                }`}
              >
                {musicEnabled ? '🎵 ดนตรี: เปิด' : '🎵 ดนตรี: ปิด'}
              </button>
            </div>

            {/* Music Volume Slider */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-400">
                  ระดับเสียงดนตรี
                </label>
                <span className="text-xs text-slate-300 font-mono">
                  {Math.round(musicVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={handleMusicVolumeChange}
                disabled={!musicEnabled}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            <div className="border-t border-slate-700 my-3"></div>

            {/* Sound Types Info */}
            <div className="text-xs text-slate-500 space-y-1 mb-3">
              <div className="font-semibold text-slate-400 mb-1">เสียงที่มี:</div>
              <div>🔊 เอฟเฟกต์ • 🎵 ดนตรีพื้นหลัง</div>
              <div>🌙 เฟสเปลี่ยน • 🎯 การกระทำ</div>
              <div>💀 ผู้เล่นตาย • 🎉 ชนะ/แพ้</div>
              <div>💬 ข้อความ • ⏰ เตือนเวลา</div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="btn btn-secondary text-xs w-full"
            >
              ปิด
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sound Toggle Button */}
      <button
        onClick={toggleSound}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowSettings(!showSettings);
        }}
        className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
          soundEnabled
            ? 'bg-purple-600 hover:bg-purple-700'
            : 'bg-slate-700 hover:bg-slate-600'
        }`}
        title={soundEnabled ? 'คลิก: ปิดเสียง | คลิกขว้า: ตั้งค่า' : 'คลิก: เปิดเสียง | คลิกขว้า: ตั้งค่า'}
      >
        <span className="text-2xl">
          {soundEnabled ? '🔊' : '🔇'}
        </span>
      </button>

      {/* Hint */}
      {!showSettings && (
        <div className="text-xs text-slate-500 text-center mt-1">
          คลิกขว้า เพื่อตั้งค่า
        </div>
      )}
    </div>
  );
}

export default SoundToggle;

