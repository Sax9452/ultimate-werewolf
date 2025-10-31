# 🧪 Testing Guide - Werewolf Game v2.0.1

**Quick Start Guide for Testing**

---

## 📚 Test Documentation

### Available Test Documents

1. **TEST_PLAN.md** - Comprehensive test plan with 108 test cases
   - Covers all aspects: gameplay, multiplayer, UI/UX, performance, security
   - Organized by categories with priority levels
   - Includes bug tracking templates

2. **TEST_CHECKLIST.md** - Quick manual testing checklist
   - Step-by-step checklist for manual testing
   - Covers all major features
   - Easy to use during testing sessions

3. **TESTING_GUIDE.md** - This file! Quick reference guide

---

## 🚀 Running Tests

### Backend Tests

```bash
cd server

# Run all tests
npm test

# Run specific test suites
npm run test:mechanics    # Game mechanics tests
npm run test:integration  # Multiplayer integration tests
npm run test:performance  # Performance/stress tests

# Watch mode (auto-run on file changes)
npm run test:watch
```

### Frontend Tests

```bash
cd client

# Run all tests
npm test

# UI mode (visual test runner)
npm run test:ui
```

---

## 📋 Test Files

### Backend Tests (`server/tests/`)

- **game.test.js** - Basic game logic tests
- **gameMechanics.test.js** - Comprehensive role abilities, voting, win conditions
- **integration.test.js** - Multiplayer scenarios, lobby management
- **performance.test.js** - Load testing, stress testing, performance

### Frontend Tests (`client/tests/`)

- **roleHelpers.test.js** - Role helper function tests
- **setup.js** - Test setup configuration

---

## 🎯 Quick Test Scenarios

### 1. Basic Game Flow (5 minutes)

```bash
1. Start server: cd server && npm start
2. Start client: cd client && npm run dev
3. Create lobby with 2 players
4. Start game
5. Complete 1 night phase + 1 day phase
6. Verify win condition works
```

### 2. Role Abilities (10 minutes)

```bash
1. Test each role:
   - Werewolf: Kill action
   - Seer: Investigation
   - Bodyguard: Protection
   - Witch: Save/Kill potions
   - Hunter: Revenge shot
2. Verify all actions logged correctly
```

### 3. Multiplayer (10 minutes)

```bash
1. Create lobby with 10 players
2. Test voting system
3. Test chat system
4. Test disconnection/reconnection
5. Verify game state syncs correctly
```

### 4. Spectator Mode (5 minutes)

```bash
1. Open game with ?key=Sax51821924
2. Join/create lobby
3. Start game
4. Verify can see all roles
5. Verify can play normally
```

### 5. Performance (15 minutes)

```bash
1. Test with 20+ players
2. Test multiple simultaneous actions
3. Test multiple lobbies
4. Check memory usage
5. Verify no crashes
```

---

## 🔍 Manual Testing Checklist

Use **TEST_CHECKLIST.md** for comprehensive manual testing.

### Quick Manual Tests

- [ ] **Setup**: Server starts, client connects
- [ ] **Lobby**: Create/join works
- [ ] **Roles**: All 11 roles work correctly
- [ ] **Voting**: Vote system works
- [ ] **Win Conditions**: All win conditions work
- [ ] **Chat**: Public + werewolf chat work
- [ ] **Spectator**: Spectator mode works
- [ ] **Multiplayer**: 10+ players work
- [ ] **Performance**: No lag with 20 players
- [ ] **Security**: Input validation works

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
## Bug Report

**Bug ID**: BUG-XXX
**Title**: [Short description]
**Severity**: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
**Status**: 🆕 New

### Steps to Reproduce
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Environment
- OS: [Windows 10 / macOS / Android / iOS]
- Browser: [Chrome 120 / Firefox 121 / Safari 17]
- Game Version: 2.0.1

### Screenshots/Logs
[Attach if available]
```

---

## 📊 Test Coverage Goals

### Current Status

- **Unit Tests**: ~40% coverage
- **Integration Tests**: ~30% coverage
- **Performance Tests**: ~20% coverage
- **Manual Tests**: Ongoing

### Target Goals

- **Unit Tests**: 80% coverage
- **Integration Tests**: 70% coverage
- **Performance Tests**: 100% of critical paths
- **Manual Tests**: 100% of test cases

---

## 🔧 Test Environment Setup

### Required Tools

- **Node.js**: v18+ (for server)
- **npm**: Latest version
- **Browser**: Chrome, Firefox, Safari, Edge
- **Devices**: Desktop, Mobile, Tablet (for cross-platform)

### Environment Variables

```bash
# Backend (.env)
NODE_ENV=test
PORT=3000
SPECTATOR_KEY=Sax51821924

# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_SPECTATOR_KEY=Sax51821924
```

---

## 📈 Test Metrics

### Key Metrics to Track

1. **Test Execution Rate**: % of tests run vs total
2. **Pass Rate**: % of tests passing
3. **Bug Discovery Rate**: Bugs found per test session
4. **Critical Bug Rate**: Critical bugs vs total bugs
5. **Test Coverage**: Code coverage percentage

### Tracking Template

| Date | Tests Run | Passed | Failed | Bugs Found | Critical Bugs |
|------|-----------|--------|--------|------------|---------------|
| 2024-10-30 | 0/108 | 0 | 0 | 0 | 0 |

---

## 🎓 Testing Best Practices

### For Testers

1. **Follow the Checklist**: Use TEST_CHECKLIST.md
2. **Report Immediately**: Don't wait, report bugs as you find them
3. **Be Detailed**: Include steps, screenshots, logs
4. **Test Edge Cases**: Try unusual combinations
5. **Test on Multiple Devices**: Desktop + Mobile

### For Developers

1. **Write Tests First**: TDD when possible
2. **Keep Tests Updated**: Update tests when adding features
3. **Run Tests Regularly**: Before commits, before releases
4. **Fix Bugs Promptly**: Critical bugs < 24 hours
5. **Document Changes**: Update test docs when changing features

---

## 🚨 Critical Test Scenarios

### Must-Test Before Release

1. ✅ **All Roles Work**: Every role's ability functions correctly
2. ✅ **Voting Works**: Voting system functions correctly
3. ✅ **Win Conditions**: All win conditions work
4. ✅ **Multiplayer**: 10+ players works without crashes
5. ✅ **Spectator Mode**: Spectator mode works correctly
6. ✅ **Security**: Input validation, rate limiting work
7. ✅ **Performance**: 20+ players without lag
8. ✅ **Cross-Platform**: Works on major browsers/devices

---

## 📞 Support

### Getting Help

- **Test Plan Issues**: See TEST_PLAN.md
- **Checklist Issues**: See TEST_CHECKLIST.md
- **Bug Reporting**: Use bug template above
- **Test Failures**: Check test logs, review code

---

## ✅ Next Steps

1. **Run Unit Tests**: `npm test` in server/client
2. **Run Manual Tests**: Use TEST_CHECKLIST.md
3. **Report Bugs**: Use bug template
4. **Track Progress**: Update test metrics
5. **Improve Coverage**: Add more tests

---

**Last Updated**: 30 October 2024  
**Version**: 2.0.1

