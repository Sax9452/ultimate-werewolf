# 📝 Changelog - Werewolf Game

## [2.0.1] - 2024-10-30

### 🔒 Security Improvements
- ✅ **Moved Spectator Key to Environment Variables** - เปลี่ยนจาก hardcode เป็น environment variables
  - Server: `process.env.SPECTATOR_KEY`
  - Client: `import.meta.env.VITE_SPECTATOR_KEY`
  - Default fallback: `Sax51821924`
- ✅ **Added Input Validation** - สร้าง `server/utils/validator.js`
  - Validate player names (max 20 chars, sanitize dangerous characters)
  - Validate lobby codes (5 alphanumeric chars)
  - Validate chat messages (max 200 chars)
  - Validate action payloads
- ✅ **Added Rate Limiting** - ป้องกัน DoS attacks
  - 100 requests per minute per IP
  - JSON payload limit: 10kb
- ✅ **Enhanced Security Headers** - CORS configured properly

### 🎨 Code Quality Improvements
- ✅ **Created roleHelpers.js** - แก้ code duplication
  - `getRoleEmoji()`, `getRoleColor()`, `getRoleTextColor()`, `getRoleBadgeColor()`
  - ใช้ใน Game.jsx, GameOver.jsx, Lobby.jsx, PlayerList.jsx
  - ลดโค้ดซ้ำประมาณ 100+ บรรทัด
- ✅ **Added Health Check Endpoint** - `/health`
  - Returns server status, timestamp, uptime
  - ใช้ใน render.yaml สำหรับ Render.com deployment

### 🧪 Testing Infrastructure
- ✅ **Setup Jest** - Backend unit testing
  - Config in `server/package.json`
  - Test file: `server/tests/game.test.js`
  - Tests for: win conditions, voting, night actions
- ✅ **Setup Vitest** - Frontend unit testing
  - Config in `client/vitest.config.js`
  - Test file: `client/tests/roleHelpers.test.js`
  - Test for role helper functions
- ✅ **Added Test Scripts**:
  - Backend: `npm run test`, `npm run test:watch`
  - Frontend: `npm run test`, `npm run test:ui`

### 📚 Documentation Improvements
- ✅ **Updated README.md**
  - ลบ reference ไป DEPLOYMENT.md ที่ไม่มี
  - เพิ่ม Environment Variables instructions
  - อัปเดต deployment section
- ✅ **Created CHANGELOG.md** - นี้เลย! ติดตามการเปลี่ยนแปลง

### 🐛 Bug Fixes
- ✅ **Fixed Spectator Mode** - เห็น role ทุกคนได้แล้ว
- ✅ **Fixed Logs** - บันทึกทุก action ครบถ้วน (Seer, Bodyguard, Witch, etc.)
- ✅ **Fixed Kick Player** - Host สามารถเตะผู้เล่นได้
- ✅ **Fixed Error Notifications** - แสดง notification เมื่อ Bodyguard เลือกคนเดิม 2 คืนติด

### 🎯 New Features
- ✅ **Detailed Game Logs** - บันทึกทุก action ของทุก role
  - บอกว่าใครทำอะไร (ฆ่า, ปกป้อง, ตรวจสอบ, ฯลฯ)
  - บอกว่าถ้าไม่ได้ใช้ความสามารถ
  - Copy logs เพื่อ debug
- ✅ **Spectator Mode** - เข้าด้วย `?key=Sax51821924`
  - เห็น role ของทุกคน
  - เล่นได้ปกติ (ไม่ใช่ observer)
- ✅ **Kick Player** - Host เตะผู้เล่นออกได้

### 🔧 Configuration Changes
- ✅ **render.yaml** - อัปเดต health check path: `/health`
- ✅ **package.json** - เพิ่ม test scripts, dependencies
- ✅ **ENV_EXAMPLE.txt** - ตัวอย่าง environment variables

---

## [2.0.0] - Previous Version

### Features
- Real-time multiplayer with WebSockets
- 11 Roles (Villager, Werewolf, Seer, Doctor, Hunter, Cupid, Wolf Cub, Traitor, Witch, Fool, Alpha Werewolf)
- Smart AI Bots
- Lobby system
- Modern UI with Framer Motion
- Responsive design
- Sound effects

---

## Future Improvements

### 🎯 Phase 2 (Planned)
- [ ] Voice chat integration
- [ ] Additional roles
- [ ] Enhanced sound effects
- [ ] Theme toggle
- [ ] Keyboard shortcuts

### 🎯 Phase 3 (Future)
- [ ] Ranked matchmaking
- [ ] Player statistics
- [ ] Achievement system
- [ ] Cosmetic shop
- [ ] Mobile apps

---

## 📊 Statistics

- **Total Files Modified**: 10
- **New Files Created**: 7
- **Lines of Code Added**: ~800
- **Lines of Code Removed**: ~150
- **Security Improvements**: 4
- **Code Quality Improvements**: 3
- **New Tests**: 2 test files

---

**Made with ❤️ by the Werewolf Team**

