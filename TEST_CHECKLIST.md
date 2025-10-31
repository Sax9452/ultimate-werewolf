# ✅ Test Checklist - Werewolf Game

**Version**: 2.0.1  
**Date**: 30 October 2024  
**Use this checklist for manual testing**

---

## 🎮 Quick Test Checklist

### Pre-Game Setup
- [ ] Server starts without errors
- [ ] Client connects to server
- [ ] Health check endpoint (`/health`) returns OK
- [ ] Can create lobby
- [ ] Can join lobby with valid code
- [ ] Cannot join with invalid lobby code
- [ ] Cannot join when lobby is full (30 players)
- [ ] Cannot join with duplicate name

### Role Assignment
- [ ] All players receive roles at game start
- [ ] Roles are correctly assigned (no duplicates if not allowed)
- [ ] Role modal displays correctly
- [ ] Players can acknowledge their role

---

## 🐺 Role-Specific Tests

### Werewolf
- [ ] Can select kill target during night phase
- [ ] Target dies after night phase
- [ ] Game log shows kill action
- [ ] Werewolf team can see each other
- [ ] Werewolf chat works (only werewolves see it)

### Seer (หมอดู)
- [ ] Can investigate one player per night
- [ ] Receives correct role information (Werewolf/Villager)
- [ ] Notification displays correctly
- [ ] Cannot investigate same player twice (if limited)

### Bodyguard (บอดี้การ์ด)
- [ ] Can protect one player per night
- [ ] Protected player survives werewolf attack
- [ ] Cannot protect same person two nights in a row
- [ ] Error notification shows when trying to protect same target
- [ ] Game log shows protection

### Witch (แม่มด)
- [ ] Has save potion (1 use)
- [ ] Has kill potion (1 use)
- [ ] Can save target from werewolf kill
- [ ] Can kill target with kill potion
- [ ] Potions are consumed after use
- [ ] Cannot use potion twice

### Hunter (นักล่า)
- [ ] Can shoot one player when killed
- [ ] Target dies immediately
- [ ] Can shoot during day if lynched
- [ ] Can shoot during night if killed by werewolf

### Cupid (คิวปิด)
- [ ] Can pair two players on first night
- [ ] Lovers can see each other's role
- [ ] If one lover dies, both die
- [ ] Lovers win condition works

### Alpha Werewolf (อัลฟ่ามนุษย์หมาป่า)
- [ ] Can convert one villager to werewolf
- [ ] Converted player becomes werewolf
- [ ] Converted player sees werewolf team
- [ ] Can only convert once per game

### Fool (ตัวตลก)
- [ ] Wins if lynched during day phase
- [ ] Special win condition displays correctly

### Traitor (ผู้ทรยศ)
- [ ] Can see werewolf team
- [ ] Werewolves cannot see traitor
- [ ] Wins with werewolf team

### Villager (ชาวบ้าน)
- [ ] Has no special abilities
- [ ] Cannot perform night actions
- [ ] Can vote during day phase

---

## 🗳️ Voting System

### Basic Voting
- [ ] Can vote for one player during day phase
- [ ] Vote is recorded correctly
- [ ] Vote count displays in real-time
- [ ] Can change vote before phase ends
- [ ] Can skip vote
- [ ] Skip vote counts as "skip"

### Vote Results
- [ ] Player with most votes is eliminated
- [ ] Tie-breaking works correctly (both eliminated)
- [ ] All votes are logged
- [ ] Game log shows vote results

### Voting Restrictions
- [ ] Dead players cannot vote
- [ ] Cannot vote during night phase
- [ ] Cannot vote for self (if restricted)

---

## 🔄 Game Flow

### Phase Transitions
- [ ] Night phase → Day phase transition works
- [ ] Day phase → Night phase transition works
- [ ] Phase timer displays correctly
- [ ] Phase ends early when all actions complete
- [ ] Day number increments correctly

### Timers
- [ ] Night phase timer: 60 seconds (default)
- [ ] Day phase timer: 180 seconds (default)
- [ ] Timer counts down correctly
- [ ] Timer updates in real-time
- [ ] Game continues when timer expires

### Win Conditions
- [ ] **Villagers Win**: When all werewolves eliminated ✅
- [ ] **Werewolves Win**: When equal/outnumber villagers ✅
- [ ] **Lovers Win**: When lovers survive and eliminate enemies ✅
- [ ] **Fool Wins**: When fool is lynched ✅
- [ ] Win condition displays correctly
- [ ] Game over screen shows winner

---

## 👥 Multiplayer Tests

### Connection
- [ ] 2 players can connect ✅
- [ ] 5 players can connect ✅
- [ ] 10 players can connect ✅
- [ ] 20 players can connect ✅
- [ ] 30 players (max) can connect ✅
- [ ] Multiple lobbies work simultaneously

### Synchronization
- [ ] Game state syncs across all players
- [ ] Actions update in real-time
- [ ] Votes update in real-time
- [ ] Chat messages appear instantly
- [ ] No desynchronization issues

### Disconnection
- [ ] Player can disconnect and reconnect
- [ ] Game handles disconnection gracefully
- [ ] Disconnected player marked as inactive
- [ ] Game continues with remaining players
- [ ] Reconnection works during game

---

## 💬 Chat System

### Public Chat
- [ ] Can send chat messages
- [ ] Messages appear for all players
- [ ] Messages are in Thai
- [ ] Character limit works (200 chars)
- [ ] Chat history persists

### Werewolf Chat
- [ ] Only werewolves can see werewolf chat
- [ ] Werewolf chat separate from public chat
- [ ] Messages appear instantly
- [ ] Villagers cannot see werewolf chat

---

## 📜 Game Logs

### Log Display
- [ ] Game logs display at game end
- [ ] All actions are logged
- [ ] Logs show who did what
- [ ] Logs show when actions didn't happen
- [ ] Logs are color-coded by type
- [ ] Copy logs button works
- [ ] Logs are formatted correctly

### Log Content
- [ ] Werewolf kills are logged
- [ ] Seer investigations are logged
- [ ] Bodyguard protections are logged
- [ ] Witch actions are logged
- [ ] All votes are logged
- [ ] Day/Night phases are logged

---

## 🔍 Spectator Mode

### Spectator Features
- [ ] Can join with `?key=Sax51821924`
- [ ] Spectator key stored in sessionStorage
- [ ] Spectator mode badge displays
- [ ] Can see all player roles
- [ ] Can play normally (gets random role)
- [ ] Spectator key sent to server
- [ ] Server recognizes spectator mode

---

## 🎨 UI/UX Tests

### Home Page
- [ ] Create lobby button works
- [ ] Join lobby button works
- [ ] Input validation works
- [ ] Error messages display correctly
- [ ] Sound effects play

### Lobby Page
- [ ] Player list displays correctly
- [ ] Host can add bots
- [ ] Host can remove bots
- [ ] Host can kick players
- [ ] Host can change settings
- [ ] Start game button works
- [ ] Role distribution displays
- [ ] Lobby code displays correctly

### Game Page
- [ ] Player list displays all players
- [ ] Status indicators work (alive/dead)
- [ ] Action buttons appear/disappear correctly
- [ ] Night actions modal works
- [ ] Voting interface works
- [ ] Chat displays correctly
- [ ] Game logs display correctly
- [ ] Phase indicator works
- [ ] Timer displays correctly

### Game Over Page
- [ ] Winner displays correctly
- [ ] All roles are revealed
- [ ] Player status shows (alive/dead)
- [ ] Game logs display
- [ ] Copy logs button works
- [ ] Return to lobby button works

---

## 🔒 Security Tests

### Input Validation
- [ ] Player name validation (max 20 chars)
- [ ] Dangerous characters removed (`< > { } [ ]`)
- [ ] Lobby code validation (5 alphanumeric)
- [ ] Chat message validation (max 200 chars)
- [ ] No XSS attacks possible

### Rate Limiting
- [ ] Rate limiting works (100 req/min/IP)
- [ ] DoS attacks prevented
- [ ] JSON payload limit (10kb)

### Spectator Key
- [ ] Spectator key in environment variable
- [ ] Client uses `VITE_SPECTATOR_KEY`
- [ ] Server uses `SPECTATOR_KEY`
- [ ] Default fallback works

---

## 🚀 Performance Tests

### Load Testing
- [ ] 10 players: No lag ✅
- [ ] 20 players: No lag ✅
- [ ] 30 players: Minimal lag ✅
- [ ] Multiple games: Server stable ✅

### Memory
- [ ] No memory leaks after 5 games
- [ ] Memory usage stable during gameplay
- [ ] Memory cleared after game ends

### Browser Performance
- [ ] 60 FPS on desktop
- [ ] 30+ FPS on mobile
- [ ] No frame drops
- [ ] Smooth animations

---

## 🌐 Cross-Platform Tests

### Desktop
- [ ] Windows 10 ✅
- [ ] Windows 11 ✅
- [ ] macOS ✅
- [ ] Linux ✅

### Mobile
- [ ] Android (Chrome) ✅
- [ ] iOS (Safari) ✅
- [ ] Responsive design works

### Browsers
- [ ] Chrome (latest) ✅
- [ ] Firefox (latest) ✅
- [ ] Safari (latest) ✅
- [ ] Edge (latest) ✅

---

## 🤖 AI Bot Tests

### AI Behavior
- [ ] AI werewolves make reasonable kills
- [ ] AI seer investigates strategically
- [ ] AI bodyguard protects effectively
- [ ] AI votes logically
- [ ] AI doesn't exploit bugs
- [ ] AI-human games work correctly

---

## 🐛 Known Issues

### Fixed Issues
- ✅ Spectator mode shows all roles
- ✅ Detailed game logs work
- ✅ Kick player feature works
- ✅ Bodyguard same target prevention
- ✅ Input validation works
- ✅ Rate limiting works

### Pending Issues
- [ ] (None currently)

---

## 📝 Notes

### Test Environment
- **Server**: `http://localhost:3000`
- **Client**: `http://localhost:5173`
- **Test Key**: `Sax51821924`

### Test Accounts
- Use different browsers/incognito for multiple players
- Test with real devices (mobile, tablet)

### Reporting Bugs
- Use bug template from `TEST_PLAN.md`
- Include screenshots/logs
- Specify steps to reproduce

---

**Last Updated**: 30 October 2024  
**Next Review**: After next release

