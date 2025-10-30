import { useGameStore } from '../store/gameStore';
import { motion } from 'framer-motion';

function GameLog() {
  const { logs } = useGameStore();

  // ⭐ กรอง logs เฉพาะการตาย และแสดงแค่ "ชื่อ ตาย" (ไม่มีสาเหตุ)
  const getSimplifiedMessage = (log) => {
    const msg = log.message;
    
    // ⭐ แสดงเฉพาะ log ประเภท 'death' เท่านั้น
    if (log.type === 'death') {
      let name = null;
      
      // รูปแบบต่างๆ ของ death logs:
      // 1. "🐺 หมาป่าโจมตี ชื่อ (บทบาท)" - ชื่ออยู่หลัง "โจมตี"
      // 1b. "🐺💢 หมาป่าโจมตี ชื่อ คนที่ 2! (Wolf Cub Effect)" - ชื่ออยู่หลัง "โจมตี"
      if (msg.includes('โจมตี')) {
        // ลองหาแบบมี "คนที่" ก่อน (Wolf Cub Effect)
        let match = msg.match(/โจมตี\s+(.+?)\s+คนที่/);
        if (!match) {
          // ถ้าไม่มี ให้หาแบบปกติ (มีวงเล็บ)
          match = msg.match(/โจมตี\s+(.+?)\s*\(/);
        }
        if (match) name = match[1];
      }
      // 2. "🧙‍♀️ แม่มดใช้ยาพิษกับ ชื่อ (บทบาท)" - ชื่ออยู่หลัง "กับ"
      else if (msg.includes('ยาพิษกับ')) {
        const match = msg.match(/กับ\s+(.+?)\s*\(/);
        if (match) name = match[1];
      }
      // 3. "🏹 ชื่อ1 ยิง ชื่อ2 (บทบาท)" - ชื่อ2 อยู่หลัง "ยิง"
      else if (msg.includes('ยิง')) {
        const match = msg.match(/ยิง\s+(.+?)\s*\(/);
        if (match) name = match[1];
      }
      // 4. "⚖️ ชื่อ ถูกโหวต N เสียง (บทบาท)" - ชื่ออยู่หลัง emoji ตรงๆ
      else if (msg.includes('ถูกโหวต')) {
        const match = msg.match(/⚖️\s+(.+?)\s+ถูกโหวต/);
        if (match) name = match[1];
      }
      // 5. "💘 ชื่อ ตายตาม (Love Network)" - ชื่ออยู่หลัง emoji
      else if (msg.includes('ตายตาม')) {
        const match = msg.match(/💘\s+(.+?)\s+ตายตาม/);
        if (match) name = match[1];
      }
      
      if (name) {
        return `💀 ${name.trim()} ถูกกำจัด`;
      }
    }
    
    // ไม่แสดง log อื่นๆ ทั้งหมด (protect, inspect, vote, info, poison, convert, heal)
    return null;
  };

  // ⭐ จัดกลุ่ม logs ตาม day เท่านั้น (รวมคืน+เช้า)
  const groupedLogs = logs
    .map((log) => ({ ...log, simplifiedMessage: getSimplifiedMessage(log) }))
    .filter(log => log.simplifiedMessage !== null)
    .reduce((acc, log) => {
      const key = `day-${log.day}`; // ใช้ day เดียว ไม่แยก phase
      if (!acc[key]) {
        acc[key] = {
          day: log.day,
          deaths: []
        };
      }
      acc[key].deaths.push(log.simplifiedMessage);
      return acc;
    }, {});

  // แปลงเป็น array และเรียงตาม day
  const groupedArray = Object.values(groupedLogs).sort((a, b) => a.day - b.day);

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">📜 เหตุการณ์</h3>
      <div className="h-48 overflow-y-auto space-y-3">
        {groupedArray.length === 0 ? (
          <div className="text-center text-slate-400 mt-8">
            <div className="text-4xl mb-2">🌙</div>
            <p>ยังไม่มีเหตุการณ์...</p>
          </div>
        ) : (
          groupedArray.map((group, groupIdx) => (
            <motion.div
              key={`day-${group.day}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIdx * 0.1 }}
              className="p-3 bg-slate-700 rounded-lg"
            >
              {/* หัวข้อ - แสดงแค่วันที่ */}
              <div className="text-sm font-bold mb-2 text-amber-300">
                ☀️ วันที่ {group.day}
              </div>
              
              {/* รายการผู้ตาย (รวมทั้งคืนและเช้า) */}
              <div className="space-y-1">
                {group.deaths.map((death, idx) => (
                  <div key={idx} className="text-slate-200 text-sm">
                    {death}
                  </div>
                ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

export default GameLog;

