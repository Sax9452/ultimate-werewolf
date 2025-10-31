# 🐺 มนุษย์หมาป่า - เกมหาหมาป่าออนไลน์

เกมมนุษย์หมาป่าแบบเรียลไทม์ ออนไลน์ มัลติเพลย์เยอร์ รองรับภาษาไทย 100% พร้อมระบบ AI Bot ที่ฉลาดและระบบตั้งค่าห้องแบบครบครัน

![Version](https://img.shields.io/badge/version-2.0.1-purple)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Cross--Platform-blue)
![Language](https://img.shields.io/badge/language-ไทย%20100%25-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 🎮 เกี่ยวกับเกม

**เกมมนุษย์หมาป่า** เป็นเกมปาร์ตี้มัลติเพลย์เยอร์ออนไลน์ ผู้เล่นจะได้รับบทบาทลับและต้องร่วมมือกัน (หรือต่อสู้กัน) เพื่อบรรลุเป้าหมายของทีม

✨ **ภาษาไทย 100%** - ทุกอย่างเป็นภาษาไทยหมด  
🎭 **11 บทบาท** - หลากหลายและสนุก  
⚙️ **ตั้งค่าได้** - Host ปรับเวลาและบทบาทได้  
🤖 **AI Bot ฉลาด** - เล่นคนเดียวก็ได้  
♾️ **ไม่จำกัดผู้เล่น** - เพิ่มได้เท่าไหร่ก็ได้

### Roles

- **👨‍🌾 Villagers** - Work together to identify and eliminate werewolves
- **🐺 Werewolves** - Secretly eliminate villagers without being discovered
- **🔮 Seer** - Can investigate one player each night to reveal their role
- **⚕️ Doctor** - Can protect one player from werewolf attacks each night

### Game Phases

**🌙 Night Phase (60 seconds)**
- Werewolves choose a victim
- Seer investigates a player
- Doctor protects someone

**☀️ Day Phase (3 minutes)**
- Players discuss and debate
- Vote to eliminate a suspect
- Can skip vote (risky!)

### Win Conditions

- **Villagers win** when all werewolves are eliminated
- **Werewolves win** when they equal or outnumber the villagers

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Zustand** - Lightweight state management
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Socket.io** - WebSocket library for real-time bidirectional communication
- **nanoid** - Unique ID generation for lobby codes

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd pogdenk
```

2. **Install dependencies**
```bash
npm run install:all
```

This will install dependencies for both the root project, server, and client.

## 🎯 Running the Game

### Development Mode

Run both server and client concurrently:
```bash
npm run dev
```

Or run them separately:

**Server (Terminal 1)**
```bash
npm run server
```

**Client (Terminal 2)**
```bash
npm run client
```

### Access the Game

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

## 🚀 Deployment

### Deploy ง่ายๆ ด้วย Railway (แนะนำ)

**ข้อดี**: ไม่มี auto-sleep, WebSocket ทำงานได้ดี, Free $5 credit/เดือน

1. Push โค้ดไป GitHub
2. ไปที่ [Railway.app](https://railway.app)
3. Connect GitHub repository
4. Deploy Backend → ตั้ง environment variable:
   ```
   PORT=3000
   ```
5. Deploy Frontend → ตั้ง environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

### Deploy ด้วย Render

**ข้อดี**: Free 750 ชม./เดือน

1. Push โค้ดไป GitHub
2. ไปที่ [Render.com](https://render.com)
3. Import repository
4. Render จะอ่านไฟล์ `render.yaml` และ deploy อัตโนมัติ

💡 **Tip**: ตั้งค่า Environment Variables:
- Backend: `SPECTATOR_KEY=your-secret-key-here`
- Frontend: `VITE_SPECTATOR_KEY=your-secret-key-here`

## 🎨 Features

### ✨ Implemented Features

- ✅ **Real-time Multiplayer** - Powered by WebSockets (Socket.io)
- ✅ **Lobby System** - Create or join private lobbies with codes
- ✅ **Smart AI Bots** - Add intelligent AI players with different personalities
- ✅ **Unlimited Players** - No player limit, add as many humans and bots as you want
- ✅ **Role Assignment** - Automatic balanced role distribution
- ✅ **Night Actions** - Role-specific abilities (kill, protect, investigate)
- ✅ **Day Voting** - Democratic elimination with skip option
- ✅ **Live Chat** - Text communication during all phases (AI bots chat too!)
- ✅ **Game Log** - Real-time event tracking
- ✅ **Phase Timers** - Automatic phase transitions
- ✅ **Modern UI/UX** - Glass morphism, gradients, smooth animations
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Player Status** - Live tracking of votes and player states
- ✅ **Game Over Screen** - Role reveals and winner announcement

### 🔮 Planned Features

- 🎤 Voice Chat (WebRTC integration)
- 🏆 Ranked Mode with ELO system
- 🎭 Additional Roles (Hunter, Witch, Bodyguard)
- 🎨 Cosmetic Shop (skins, emotes, avatars)
- 📊 Player Statistics and Match History
- 🌍 Public Matchmaking
- 🎵 Enhanced Sound Effects and Music
- 🏅 Achievement System
- 👥 Friend System
- 📱 Native Mobile Apps (React Native)

## 🎮 How to Play

1. **Enter your name** on the home screen
2. **Create a lobby** or **join with a code**
3. **Add AI bots** if you want (host only) - unlimited players supported!
4. Wait for **3+ players** to join (mix of humans and bots)
5. **Host starts the game**
6. **Receive your secret role**
7. **Night Phase**: Use your role ability (if applicable)
8. **Day Phase**: Discuss and vote to eliminate suspects
9. **Repeat** until one team wins!

### 🤖 AI Bot Features

- **Smart Decision Making**: AI bots have different personalities (aggressive, defensive, analytical, strategic)
- **Realistic Behavior**: Bots vote, use abilities, and even chat during day phase
- **Role-Specific AI**: Each role has specialized AI logic
  - Werewolf bots strategically choose victims
  - Seer bots investigate suspicious players
  - Doctor bots protect vulnerable players
- **No Limit**: Add as many bots as you want to fill your game!

## 🏗️ Project Structure

```
pogdenk/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── HomePage.jsx
│   │   │   ├── Lobby.jsx
│   │   │   ├── Game.jsx
│   │   │   ├── GameOver.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── PlayerList.jsx
│   │   │   ├── GameLog.jsx
│   │   │   ├── NightActions.jsx
│   │   │   └── VotingPanel.jsx
│   │   ├── services/      # Socket.io service
│   │   ├── store/         # Zustand state management
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── package.json
├── server/                # Node.js backend
│   ├── game/             # Game logic
│   │   ├── GameManager.js   # Manages lobbies and games
│   │   ├── Game.js          # Core game logic
│   │   ├── constants.js     # Game constants
│   │   └── roleAssignment.js
│   ├── server.js         # Express & Socket.io server
│   └── package.json
└── package.json          # Root package.json
```

## 🎨 Design Philosophy

- **Modern Aesthetics** - Dark theme with purple/pink gradients
- **Glass Morphism** - Translucent cards with backdrop blur
- **Smooth Animations** - Framer Motion for all transitions
- **Minimal UI** - Clean, distraction-free interface
- **Mobile-First** - Responsive design for all screen sizes
- **Accessibility** - High contrast, readable fonts

## 🔧 Configuration

### Server Port
Edit `server/server.js`:
```javascript
const PORT = process.env.PORT || 3000;
```

### Client API URL
Edit `client/src/services/socket.js`:
```javascript
this.socket = io('http://localhost:3000');
```

### Game Settings
Edit `server/game/constants.js`:
```javascript
export const PHASE_DURATIONS = {
  night: 60,  // seconds
  day: 180    // seconds
};
```

## 🐛 Troubleshooting

**WebSocket Connection Issues**
- Ensure server is running on port 3000
- Check CORS settings in `server/server.js`
- Verify client Socket.io URL matches server address

**Installation Errors**
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`
- Use Node 16+ LTS version

**Build Errors**
- Clear Vite cache: `cd client && rm -rf node_modules/.vite`
- Rebuild: `npm run build`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Future Roadmap

### Phase 1 (Current) ✅
- Core gameplay mechanics
- Basic roles (Villager, Werewolf, Seer, Doctor)
- Lobby system
- Real-time chat

### Phase 2
- Voice chat integration
- Additional roles (Hunter, Witch, Bodyguard)
- Enhanced UI/UX
- Sound effects and music

### Phase 3
- Ranked matchmaking
- Player statistics
- Achievement system
- Cosmetic shop

### Phase 4
- Mobile apps (iOS/Android)
- Tournament mode
- Spectator mode
- Replays

## 🙏 Credits

**Game Design**: Based on the classic Werewolf/Mafia party game

**Built with** ❤️ using modern web technologies

---

**Enjoy the game and trust no one! 🐺**

