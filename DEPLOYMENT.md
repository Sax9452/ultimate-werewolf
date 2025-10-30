# 🚀 คู่มือ Deploy Werewolf Game

## 📋 สรุปโปรเจค
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express + Socket.IO (WebSocket)
- **Database**: ไม่มี (ใช้ in-memory storage)

---

## 🎯 วิธี Deploy ด้วย Railway (แนะนำ)

### ข้อดี:
- ✅ Deploy ง่ายที่สุด (1 คลิก)
- ✅ ไม่มี auto-sleep
- ✅ WebSocket ทำงานได้ดี
- ✅ Build เร็ว
- ✅ Free $5 credit/เดือน

### ขั้นตอน:

#### 1. สร้าง GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/werewolf-game.git
git push -u origin main
```

#### 2. Deploy Backend (Server)
1. ไปที่ https://railway.app/
2. คลิก "Start a New Project"
3. เลือก "Deploy from GitHub repo"
4. เลือก repository ของคุณ
5. Railway จะ auto-detect และ deploy ให้อัตโนมัติ
6. รอจนได้ URL เช่น `https://werewolf-server-production.up.railway.app`
7. ไปที่ Settings → Networking → Generate Domain

#### 3. Deploy Frontend (Client)
1. คลิก "+ New" → Empty Service
2. ไปที่ Settings:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Start Command**: `npx serve -s client/dist -p $PORT`
3. ไปที่ Variables และเพิ่m:
   ```
   VITE_API_URL=https://YOUR-BACKEND-URL.railway.app
   ```
4. Deploy อีกครั้ง
5. Generate Domain สำหรับ frontend

#### 4. เล่นเกม 🎮
เข้าที่ URL ของ frontend แล้วเล่นได้เลย!

---

## 🎨 วิธี Deploy ด้วย Render (ทางเลือกที่ 2)

### ข้อดี:
- ✅ Free tier 750 ชม./เดือน
- ✅ Easy to use
- ✅ Auto-deploy จาก GitHub

### ข้อจำกัด:
- ⚠️ Auto-sleep หลัง 15 นาทีไม่มีใครใช้ (cold start ~30 วินาที)

### ขั้นตอน:

#### 1. Push โค้ดไปที่ GitHub (เหมือนด้านบน)

#### 2. Deploy Backend
1. ไปที่ https://render.com/
2. คลิก "New +" → "Web Service"
3. Connect GitHub repository
4. ตั้งค่า:
   - **Name**: werewolf-server
   - **Root Directory**: server
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
5. คลิก "Create Web Service"
6. รอจนได้ URL เช่น `https://werewolf-server.onrender.com`

#### 3. Deploy Frontend
1. คลิก "New +" → "Static Site"
2. Connect GitHub repository
3. ตั้งค่า:
   - **Name**: werewolf-client
   - **Root Directory**: client
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist
4. ไปที่ Environment:
   - เพิ่ม `VITE_API_URL=https://YOUR-BACKEND-URL.onrender.com`
5. คลิก "Create Static Site"

---

## 🔧 Alternative: Deploy แบบ Monorepo (รวมทั้งหมดไว้ service เดียว)

### Railway:
```bash
# ใน Settings:
Build Command: npm run start:prod
Start Command: cd server && npm start
```

### Render:
ใช้ไฟล์ `render.yaml` ที่มีอยู่แล้ว - จะ deploy ทั้ง frontend + backend พร้อมกัน

---

## 🌐 Deploy แบบ Full Custom (VPS/DigitalOcean)

หากต้องการ control เต็มที่:

```bash
# 1. SSH เข้า VPS
ssh root@your-server-ip

# 2. ติดตั้ง Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone repository
git clone https://github.com/YOUR_USERNAME/werewolf-game.git
cd werewolf-game

# 4. Build & Start
npm install
npm run build

# 5. Run with PM2
npm install -g pm2
pm2 start server/server.js --name werewolf-server
pm2 save
pm2 startup

# 6. Setup Nginx
sudo apt install nginx
# แก้ไข /etc/nginx/sites-available/default ให้ reverse proxy ไปที่ port 3000
sudo systemctl restart nginx
```

---

## 📝 หมายเหตุสำคัญ

### WebSocket CORS
โค้ดตั้งค่า CORS ไว้แล้วที่:
```javascript
// server/server.js
cors: {
  origin: "*",
  methods: ["GET", "POST"]
}
```

### Environment Variables
- **VITE_API_URL**: URL ของ backend (สำหรับ frontend)
- **PORT**: Port ที่ server จะรัน (Railway/Render จะ set ให้อัตโนมัติ)

### ราคา (ประมาณการ)
- **Railway**: $5 credit/เดือน (ฟรี) → พอเล่นสบายๆ
- **Render**: 750 ชั่วโมง/เดือน (ฟรี) → เกินต้องจ่าย $7/เดือน
- **VPS**: $5-10/เดือน (DigitalOcean, Linode)

---

## 🐛 Troubleshooting

### ปัญหา: WebSocket ไม่เชื่อมต่อ
**แก้**: ตรวจสอบว่า `VITE_API_URL` ตั้งค่าถูกต้อง และใช้ `https://` (ไม่ใช่ `http://`)

### ปัญหา: Build failed
**แก้**: ลองลบ `node_modules` แล้ว install ใหม่:
```bash
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

### ปัญหา: Render sleep เร็วเกินไป
**แก้**: ใช้ Railway แทน หรือ upgrade เป็น paid plan ($7/เดือน)

---

## 🎉 สรุป

**แนะนำสำหรับมือใหม่**: Railway
- Deploy ง่ายที่สุด
- ไม่ต้องกังวลเรื่อง sleep
- มี free credit ใช้ได้เลย

**แนะนำสำหรับประหยัด**: Render
- Free tier ดี
- ยอมรับ auto-sleep ได้

**แนะนำสำหรับ Pro**: VPS
- ควบคุมได้ทุกอย่าง
- Performance ดีที่สุด

---

Made with ❤️ for Werewolf Game

