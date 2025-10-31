# 🧪 วิธีรัน Tests - Werewolf Game

## ✅ Frontend Tests (ผ่านแล้ว!)

```bash
cd client
npm test
```

**ผลลัพธ์**:
```
✓ tests/roleHelpers.test.js (6 tests) 4ms
  ✓ Role Helpers (6)
    ✓ getRoleEmoji (2)
    ✓ getRoleColor (2)
    ✓ getRoleTextColor (1)
    ✓ getRoleBadgeColor (1)

Test Files  1 passed (1)
Tests  6 passed (6)
```

---

## ⚠️ Backend Tests (ต้องติดตั้ง dependencies)

### ปัญหา: Jest ยังไม่ได้ติดตั้ง

### วิธีแก้:

```bash
# วิธีที่ 1: ติดตั้งจาก root
npm install

# วิธีที่ 2: ติดตั้งเฉพาะ server (ถ้าวิธี 1 ไม่ได้)
cd server
npm install
cd ..

# วิธีที่ 3: ติดตั้ง Jest โดยตรง
cd server
npm install jest @jest/globals --save-dev
```

---

## 🔧 คำสั่งรัน Tests

### Frontend (Client)

```bash
# ไปที่ client folder
cd client

# รัน tests ทั้งหมด
npm test

# Watch mode (auto-run เมื่อโค้ดเปลี่ยน)
npm test

# UI mode (visual test runner)
npm run test:ui
```

### Backend (Server)

```bash
# ไปที่ server folder
cd server

# รัน tests ทั้งหมด
npm test

# รันเฉพาะ game mechanics tests
npm run test:mechanics

# รันเฉพาะ integration tests
npm run test:integration

# รันเฉพาะ performance tests
npm run test:performance

# Watch mode
npm run test:watch
```

### รันทั้งหมดพร้อมกัน

```bash
# Terminal 1: Frontend tests
cd client
npm test

# Terminal 2: Backend tests
cd server
npm test
```

---

## 📊 Test Coverage

### Frontend ✅
- ✅ `roleHelpers.test.js` - 6 tests passed

### Backend ⏳
- ⏳ `game.test.js` - ต้องติดตั้ง Jest ก่อน
- ⏳ `gameMechanics.test.js` - ต้องติดตั้ง Jest ก่อน
- ⏳ `integration.test.js` - ต้องติดตั้ง Jest ก่อน
- ⏳ `performance.test.js` - ต้องติดตั้ง Jest ก่อน

---

## 🎯 Quick Test Scenarios

### 1. ทดสอบ Role Helpers (Frontend)

```bash
cd client
npm test

# ผลลัพธ์: 6 tests passed ✅
```

### 2. ทดสอบ Game Mechanics (Backend)

```bash
cd server
npm run test:mechanics

# ผลลัพธ์: จะบอกว่าต้องติดตั้ง Jest ก่อน ⚠️
```

---

## 🐛 Troubleshooting

### ปัญหา: "Cannot find module 'jest'"

**แก้ไข**:
```bash
cd server
npm install jest @jest/globals --save-dev
```

### ปัญหา: "Cannot find module '@jest/globals'"

**แก้ไข**:
```bash
cd server
npm install @jest/globals --save-dev
```

### ปัญหา: "The token '&&' is not a valid statement separator"

**แก้ไข**: ใช้ PowerShell command:
```powershell
# แทน
cd server && npm test

# ใช้
Set-Location server; npm test
```

---

## 📝 Manual Testing

ถ้า automated tests ยังมีปัญหา ให้ทดสอบด้วยมือก่อน:

### ขั้นตอนทดสอบด้วยมือ:

1. **Start Server**:
   ```bash
   cd server
   npm start
   ```

2. **Start Client**:
   ```bash
   cd client
   npm run dev
   ```

3. **ทดสอบใน Browser**:
   - เปิด: http://localhost:5173
   - สร้าง lobby
   - join lobby
   - เริ่มเกม
   - ทดสอบแต่ละ role

4. **ใช้ TEST_CHECKLIST.md**:
   - เปิดไฟล์ TEST_CHECKLIST.md
   - ทำตาม checklist ทีละข้อ
   - ติ๊ก checkbox เมื่อเสร็จ

---

## ✅ Summary

### สิ่งที่ทำได้ตอนนี้:

- ✅ Frontend tests รันได้แล้ว (6 tests passed)
- ✅ Test documentation ครบถ้วน (TEST_PLAN.md, TEST_CHECKLIST.md, TESTING_GUIDE.md)
- ✅ Test files สร้างเสร็จแล้ว (game.test.js, gameMechanics.test.js, integration.test.js, performance.test.js)
- ⏳ Backend tests รอติดตั้ง Jest

### Next Steps:

1. ติดตั้ง Jest สำหรับ server
2. รัน backend tests
3. ปรับแก้ tests ที่ fail
4. เพิ่ม test coverage ให้ถึง 80%

---

**Last Updated**: 30 October 2024  
**Status**: Frontend ✅ | Backend ⏳

