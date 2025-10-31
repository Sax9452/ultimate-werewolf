# 🧪 Comprehensive Test Plan - Werewolf Game

**Version**: 2.0.1  
**Date**: 30 October 2024  
**Status**: 🟡 In Progress

---

## 📋 Table of Contents

1. [Gameplay Mechanics Testing](#1-gameplay-mechanics-testing)
2. [Multiplayer Connectivity Testing](#2-multiplayer-connectivity-testing)
3. [UI/UX Testing](#3-uiux-testing)
4. [Server and Performance Testing](#4-server-and-performance-testing)
5. [AI Testing](#5-ai-testing)
6. [Stress Testing](#6-stress-testing)
7. [Cross-Platform Testing](#7-cross-platform-testing)
8. [Regression Testing](#8-regression-testing)
9. [Bug Tracking & Reporting](#9-bug-tracking--reporting)

---

## 1. Gameplay Mechanics Testing

### 1.1 Roles Verification

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-001 | **Werewolf Kill Action** | Werewolf can select a target during night phase and the target is marked as dead | 🔴 Critical | ⏳ Pending |
| TC-002 | **Seer Investigation** | Seer can investigate one player per night and receive correct role information | 🔴 Critical | ⏳ Pending |
| TC-003 | **Bodyguard Protection** | Bodyguard can protect a player and prevent werewolf kill (target survives) | 🔴 Critical | ⏳ Pending |
| TC-004 | **Bodyguard Same Target Prevention** | Bodyguard cannot protect the same person two nights in a row (error notification shown) | 🟠 High | ⏳ Pending |
| TC-005 | **Witch Potions** | Witch can use save potion (saves target) and kill potion (kills target) | 🔴 Critical | ⏳ Pending |
| TC-006 | **Hunter Revenge** | When Hunter dies, they can shoot one player (target dies) | 🔴 Critical | ⏳ Pending |
| TC-007 | **Cupid Pairing** | Cupid can pair two players (lovers die together) | 🔴 Critical | ⏳ Pending |
| TC-008 | **Alpha Werewolf Conversion** | Alpha Werewolf can convert one villager to werewolf | 🔴 Critical | ⏳ Pending |
| TC-009 | **Fool Win Condition** | Fool wins if they are lynched (special win condition) | 🟠 High | ⏳ Pending |
| TC-010 | **Traitor Visibility** | Traitor can see werewolf team but wolves don't see traitor | 🟠 High | ⏳ Pending |
| TC-011 | **Villager Basic Role** | Villager has no special abilities (cannot perform night actions) | 🟢 Medium | ⏳ Pending |
| TC-012 | **Wolf Cub Special Behavior** | Wolf Cub behaves like werewolf but has special mechanics | 🟠 High | ⏳ Pending |

#### Test Procedures

**TC-001: Werewolf Kill Action**
1. Create game with at least 3 players (1 werewolf, 2 villagers)
2. Start game (night phase begins)
3. Werewolf selects a target player
4. Night phase ends
5. **Expected**: Target player is marked as dead, game log shows kill action

**TC-002: Seer Investigation**
1. Create game with Seer and Villagers
2. Night phase begins
3. Seer selects a target to investigate
4. **Expected**: Seer receives notification showing target's role (Werewolf/Villager)

**TC-003: Bodyguard Protection**
1. Create game with Werewolf, Bodyguard, and Villager
2. Night phase: Werewolf targets Villager, Bodyguard protects Villager
3. **Expected**: Villager survives, game log shows protection

**TC-004: Bodyguard Same Target Prevention**
1. Create game with Bodyguard
2. Night 1: Bodyguard protects Player A
3. Night 2: Bodyguard tries to protect Player A again
4. **Expected**: Error notification "⚠️ ไม่สามารถปกป้องคนเดิม 2 คืนติดกันได้"

---

### 1.2 Voting System

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-013 | **Single Vote** | Player can vote for one target during day phase | 🔴 Critical | ⏳ Pending |
| TC-014 | **Vote Change** | Player can change their vote before phase ends | 🟠 High | ⏳ Pending |
| TC-015 | **Skip Vote** | Player can skip voting (vote counts as "skip") | 🟢 Medium | ⏳ Pending |
| TC-016 | **Tie-Breaking** | When two players receive equal votes, both are eliminated | 🔴 Critical | ⏳ Pending |
| TC-017 | **Majority Vote** | Player with most votes is eliminated | 🔴 Critical | ⏳ Pending |
| TC-018 | **Vote Recording** | All votes are recorded correctly and displayed in game logs | 🟠 High | ⏳ Pending |
| TC-019 | **Real-time Vote Update** | Vote counts update in real-time for all players | 🟠 High | ⏳ Pending |
| TC-020 | **Dead Player Vote** | Dead players cannot vote | 🔴 Critical | ⏳ Pending |

#### Test Procedures

**TC-013: Single Vote**
1. Start game with 5 players
2. Day phase begins
3. Player A votes for Player B
4. **Expected**: Vote is recorded, Player B vote count = 1

**TC-016: Tie-Breaking**
1. Start game with 6 players
2. Day phase: 3 players vote for A, 3 players vote for B
3. **Expected**: Both A and B are eliminated (tie = both die)

---

### 1.3 Game Flow

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-021 | **Phase Transitions** | Game transitions smoothly between night/day phases | 🔴 Critical | ⏳ Pending |
| TC-022 | **Phase Timers** | Night phase (60s) and Day phase (180s) timers work correctly | 🔴 Critical | ⏳ Pending |
| TC-023 | **Early Phase End** | Phase ends early when all actions complete (night) or all votes cast (day) | 🟠 High | ⏳ Pending |
| TC-024 | **Win Condition - Villagers Win** | Game ends when all werewolves are eliminated | 🔴 Critical | ⏳ Pending |
| TC-025 | **Win Condition - Werewolves Win** | Game ends when werewolves equal or outnumber villagers | 🔴 Critical | ⏳ Pending |
| TC-026 | **Win Condition - Lovers Win** | Game ends when lovers survive and eliminate all enemies | 🟠 High | ⏳ Pending |
| TC-027 | **Game Log Display** | Game logs display correctly at game end showing all actions | 🟢 Medium | ⏳ Pending |
| TC-028 | **Role Assignment** | All players receive valid roles at game start | 🔴 Critical | ⏳ Pending |

---

## 2. Multiplayer Connectivity Testing

### 2.1 Player Connection

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-029 | **Single Player Join** | Player can join lobby successfully | 🔴 Critical | ⏳ Pending |
| TC-030 | **Multiple Players Join** | 10+ players can join same lobby without issues | 🔴 Critical | ⏳ Pending |
| TC-031 | **Lobby Full Prevention** | Players cannot join when lobby is full (30 players) | 🟠 High | ⏳ Pending |
| TC-032 | **Duplicate Name Prevention** | Players cannot join with duplicate names | 🟠 High | ⏳ Pending |
| TC-033 | **Invalid Lobby Code** | Player cannot join with invalid lobby code | 🟢 Medium | ⏳ Pending |
| TC-034 | **Connection Recovery** | Player can reconnect after temporary disconnection | 🟠 High | ⏳ Pending |
| TC-035 | **Simultaneous Connections** | 20 players can connect simultaneously without server crash | 🔴 Critical | ⏳ Pending |

---

### 2.2 Latency and Lag

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-036 | **Action Response Time** | Actions (vote, night action) register within 1 second | 🔴 Critical | ⏳ Pending |
| TC-037 | **Game State Sync** | Game state updates synchronize across all players within 2 seconds | 🔴 Critical | ⏳ Pending |
| TC-038 | **Poor Connection Handling** | Game handles slow/unstable connections gracefully | 🟠 High | ⏳ Pending |
| TC-039 | **Reconnection During Game** | Player can rejoin game after disconnection | 🟠 High | ⏳ Pending |
| TC-040 | **Network Fluctuation** | Game recovers from temporary network issues | 🟠 High | ⏳ Pending |

---

## 3. UI/UX Testing

### 3.1 Menus and Navigation

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-041 | **Home Page Navigation** | Home page displays correctly with create/join options | 🟢 Medium | ⏳ Pending |
| TC-042 | **Lobby Page** | Lobby page shows player list, settings, start button | 🟢 Medium | ⏳ Pending |
| TC-043 | **Game Page** | Game page displays player list, actions, chat, logs | 🟢 Medium | ⏳ Pending |
| TC-044 | **Game Over Page** | Game over page shows winner, all roles, detailed logs | 🟢 Medium | ⏳ Pending |
| TC-045 | **Button Responsiveness** | All buttons respond to clicks immediately | 🟠 High | ⏳ Pending |
| TC-046 | **Settings Accessibility** | Lobby settings are easily accessible and functional | 🟢 Medium | ⏳ Pending |

---

### 3.2 In-Game HUD

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-047 | **Player List Display** | Player list shows all players with correct status (alive/dead) | 🔴 Critical | ⏳ Pending |
| TC-048 | **Role Visibility** | Players see their own role and werewolf team members | 🔴 Critical | ⏳ Pending |
| TC-049 | **Spectator Mode** | Spectator mode shows all roles correctly | 🟠 High | ⏳ Pending |
| TC-050 | **Vote Count Display** | Vote counts display correctly and update in real-time | 🟠 High | ⏳ Pending |
| TC-051 | **Phase Indicator** | Current phase (night/day) and day number display correctly | 🟠 High | ⏳ Pending |
| TC-052 | **Timer Display** | Phase timer displays correctly and counts down | 🟠 High | ⏳ Pending |
| TC-053 | **Action Buttons** | Action buttons appear/disappear based on player role and phase | 🔴 Critical | ⏳ Pending |

---

### 3.3 Text and Feedback

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-054 | **Notification Messages** | All notifications (error, success, info) display correctly | 🟢 Medium | ⏳ Pending |
| TC-055 | **Chat Messages** | Chat messages send/receive correctly and display in chat window | 🟠 High | ⏳ Pending |
| TC-056 | **Werewolf Chat** | Werewolf team chat works correctly (only werewolves see it) | 🔴 Critical | ⏳ Pending |
| TC-057 | **Game Log Clarity** | Game logs are clear, readable, and show all actions | 🟢 Medium | ⏳ Pending |
| TC-058 | **Action Confirmation** | Actions (vote, night action) show confirmation feedback | 🟠 High | ⏳ Pending |
| TC-059 | **Error Messages** | Error messages are clear and helpful (Thai language) | 🟠 High | ⏳ Pending |

---

## 4. Server and Performance Testing

### 4.1 Server Stability

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-060 | **5 Players Load** | Server handles 5 players without crashes or lag | 🔴 Critical | ⏳ Pending |
| TC-061 | **10 Players Load** | Server handles 10 players without crashes or lag | 🔴 Critical | ⏳ Pending |
| TC-062 | **20 Players Load** | Server handles 20 players without crashes or lag | 🟠 High | ⏳ Pending |
| TC-063 | **30 Players Load** | Server handles maximum capacity (30 players) without crashes | 🟠 High | ⏳ Pending |
| TC-064 | **Multiple Lobbies** | Server handles 10+ simultaneous lobbies | 🟠 High | ⏳ Pending |
| TC-065 | **Rate Limiting** | Rate limiting prevents DoS attacks (100 req/min/IP) | 🟠 High | ⏳ Pending |

---

### 4.2 Game Performance

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-066 | **Frame Rate** | Game maintains 60 FPS on modern browsers | 🟢 Medium | ⏳ Pending |
| TC-067 | **Memory Usage** | Memory usage remains stable during extended gameplay (30+ minutes) | 🟠 High | ⏳ Pending |
| TC-068 | **Memory Leak Check** | No memory leaks after multiple games (5+ games) | 🟠 High | ⏳ Pending |
| TC-069 | **Mobile Performance** | Game performs well on mobile devices (30+ FPS) | 🟠 High | ⏳ Pending |
| TC-070 | **Browser Compatibility** | Game works on Chrome, Firefox, Safari, Edge | 🟠 High | ⏳ Pending |

---

### 4.3 Disconnection Handling

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-071 | **Graceful Disconnection** | Game handles player disconnection gracefully | 🔴 Critical | ⏳ Pending |
| TC-072 | **Reconnection During Lobby** | Player can reconnect and rejoin lobby | 🟠 High | ⏳ Pending |
| TC-073 | **Disconnection During Game** | Disconnected player is marked as inactive, game continues | 🔴 Critical | ⏳ Pending |
| TC-074 | **Host Disconnection** | Game handles host disconnection (new host assigned or game ends) | 🟠 High | ⏳ Pending |
| TC-075 | **Network Reconnection** | Player can reconnect after network issue and resume game | 🟠 High | ⏳ Pending |

---

## 5. AI Testing

### 5.1 AI Behavior

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-076 | **AI Werewolf Actions** | AI werewolves make reasonable kill decisions | 🟠 High | ⏳ Pending |
| TC-077 | **AI Seer Actions** | AI seer investigates players strategically | 🟠 High | ⏳ Pending |
| TC-078 | **AI Bodyguard Actions** | AI bodyguard protects players effectively | 🟠 High | ⏳ Pending |
| TC-079 | **AI Voting** | AI players vote logically during day phase | 🟠 High | ⏳ Pending |
| TC-080 | **AI No Exploitation** | AI doesn't exploit game mechanics or break immersion | 🟠 High | ⏳ Pending |
| TC-081 | **Mixed AI/Human Game** | Games with AI and human players work correctly | 🟠 High | ⏳ Pending |

---

## 6. Stress Testing

### 6.1 High Player Load

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-082 | **Maximum Capacity** | 30 players in single lobby without crashes | 🟠 High | ⏳ Pending |
| TC-083 | **Simultaneous Actions** | 30 players performing actions simultaneously doesn't crash | 🟠 High | ⏳ Pending |
| TC-084 | **Rapid Voting** | 30 players voting rapidly doesn't cause lag | 🟠 High | ⏳ Pending |
| TC-085 | **Multiple Games** | 10+ simultaneous games without server crash | 🟠 High | ⏳ Pending |

---

### 6.2 Network Stress

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-086 | **High Ping** | Game handles high ping (500ms+) gracefully | 🟢 Medium | ⏳ Pending |
| TC-087 | **Fluctuating Connection** | Game handles fluctuating Wi-Fi connection | 🟠 High | ⏳ Pending |
| TC-088 | **Desynchronization** | Game handles desynchronization without breaking | 🟠 High | ⏳ Pending |
| TC-089 | **Lag Spikes** | Game recovers from lag spikes | 🟠 High | ⏳ Pending |

---

## 7. Cross-Platform Testing

### 7.1 Device Compatibility

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-090 | **Desktop (Windows)** | Game works on Windows 10/11 | 🔴 Critical | ⏳ Pending |
| TC-091 | **Desktop (Mac)** | Game works on macOS | 🟠 High | ⏳ Pending |
| TC-092 | **Mobile (Android)** | Game works on Android devices (Chrome) | 🟠 High | ⏳ Pending |
| TC-093 | **Mobile (iOS)** | Game works on iOS devices (Safari) | 🟠 High | ⏳ Pending |
| TC-094 | **Tablet** | Game works on tablets (iPad, Android tablets) | 🟢 Medium | ⏳ Pending |
| TC-095 | **Responsive Design** | UI adapts correctly to different screen sizes | 🟠 High | ⏳ Pending |

---

### 7.2 Browser Compatibility

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-096 | **Chrome** | Game works on latest Chrome | 🔴 Critical | ⏳ Pending |
| TC-097 | **Firefox** | Game works on latest Firefox | 🟠 High | ⏳ Pending |
| TC-098 | **Safari** | Game works on latest Safari | 🟠 High | ⏳ Pending |
| TC-099 | **Edge** | Game works on latest Edge | 🟠 High | ⏳ Pending |
| TC-100 | **Mobile Browsers** | Game works on mobile Chrome, Safari | 🟠 High | ⏳ Pending |

---

## 8. Regression Testing

### 8.1 Bug Fix Verification

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-101 | **Spectator Mode Fix** | Spectator mode shows all roles correctly | 🔴 Critical | ⏳ Pending |
| TC-102 | **Detailed Logs Fix** | Game logs show all actions correctly | 🟠 High | ⏳ Pending |
| TC-103 | **Kick Player Fix** | Host can kick players from lobby | 🟠 High | ⏳ Pending |
| TC-104 | **Bodyguard Notification Fix** | Error notification shows when protecting same target twice | 🟢 Medium | ⏳ Pending |
| TC-105 | **Input Validation** | Input validation prevents XSS attacks | 🟠 High | ⏳ Pending |
| TC-106 | **Rate Limiting** | Rate limiting prevents DoS attacks | 🟠 High | ⏳ Pending |

---

### 8.2 Feature Compatibility

#### Test Cases

| ID | Test Case | Expected Result | Priority | Status |
|----|-----------|----------------|----------|--------|
| TC-107 | **New Features Don't Break Old** | New features don't break existing functionality | 🔴 Critical | ⏳ Pending |
| TC-108 | **Backward Compatibility** | Game remains compatible with previous version clients | 🟠 High | ⏳ Pending |

---

## 9. Bug Tracking & Reporting

### 9.1 Bug Documentation Template

```markdown
## Bug Report Template

**Bug ID**: BUG-001
**Title**: [Short description]
**Severity**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
**Status**: 🆕 New / 🔄 In Progress / ✅ Fixed / ❌ Won't Fix
**Reported By**: [Name]
**Reported Date**: [Date]
**Assigned To**: [Developer]

### Description
[Detailed description of the bug]

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- **OS**: [Windows 10 / macOS / Android / iOS]
- **Browser**: [Chrome 120 / Firefox 121 / Safari 17]
- **Device**: [Desktop / Mobile / Tablet]
- **Game Version**: [2.0.1]
- **Server**: [Production / Development]

### Screenshots/Videos
[Attach screenshots or videos if applicable]

### Logs
```
[Relevant error logs or console output]
```

### Additional Notes
[Any other relevant information]
```

---

### 9.2 Bug Priority Guidelines

| Priority | Description | Response Time | Examples |
|----------|-------------|---------------|-----------|
| 🔴 **Critical** | Game-breaking bugs that prevent gameplay | < 24 hours | Server crash, role abilities broken, voting doesn't work |
| 🟠 **High** | Major bugs that significantly impact gameplay | < 48 hours | UI broken, connection issues, wrong win conditions |
| 🟡 **Medium** | Bugs that affect user experience but don't break gameplay | < 1 week | UI glitches, minor display issues, performance degradation |
| 🟢 **Low** | Minor cosmetic issues or edge cases | < 2 weeks | Text typos, color inconsistencies, minor UI tweaks |

---

## 📊 Test Execution Status

### Summary Statistics

- **Total Test Cases**: 108
- **Critical**: 30
- **High**: 40
- **Medium**: 28
- **Low**: 10

### Progress Tracking

| Category | Total | Passed | Failed | Pending | Pass Rate |
|----------|-------|--------|--------|---------|-----------|
| Gameplay Mechanics | 28 | 0 | 0 | 28 | 0% |
| Multiplayer Connectivity | 12 | 0 | 0 | 12 | 0% |
| UI/UX | 19 | 0 | 0 | 19 | 0% |
| Server & Performance | 16 | 0 | 0 | 16 | 0% |
| AI Testing | 6 | 0 | 0 | 6 | 0% |
| Stress Testing | 8 | 0 | 0 | 8 | 0% |
| Cross-Platform | 11 | 0 | 0 | 11 | 0% |
| Regression | 8 | 0 | 0 | 8 | 0% |
| **Total** | **108** | **0** | **0** | **108** | **0%** |

---

## 📝 Notes

### Testing Tools

- **Unit Testing**: Jest (backend), Vitest (frontend)
- **Integration Testing**: Manual + Automated
- **Performance Testing**: Browser DevTools, Lighthouse
- **Stress Testing**: Custom scripts, k6 (planned)
- **Cross-Platform**: Real devices + BrowserStack (optional)

### Testing Schedule

- **Week 1**: Gameplay Mechanics, Multiplayer Connectivity
- **Week 2**: UI/UX, Server & Performance
- **Week 3**: AI, Stress Testing, Cross-Platform
- **Week 4**: Regression Testing, Bug Fixes

---

## ✅ Sign-off

**Test Plan Created By**: AI Code Assistant  
**Date**: 30 October 2024  
**Approved By**: [Pending]  
**Last Updated**: 30 October 2024

---

*This test plan is a living document and will be updated as testing progresses.*

