import { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { socketService } from './services/socket';
import { soundManager } from './utils/sounds';
import HomePage from './components/HomePage';
import Lobby from './components/Lobby';
import Game from './components/Game';
import GameOver from './components/GameOver';
import SoundToggle from './components/SoundToggle';

function App() {
  const { gameState, setGameState } = useGameStore();
  const [currentView, setCurrentView] = useState('home'); // home, lobby, game, gameOver
  const [isSpectatorMode, setIsSpectatorMode] = useState(false);

  useEffect(() => {
    // ⭐ ตรวจสอบ Spectator Mode จาก URL parameter (ใช้ env var จาก Vite)
    const urlParams = new URLSearchParams(window.location.search);
    const spectatorKey = urlParams.get('key');
    
    if (spectatorKey) {
      sessionStorage.setItem('spectatorKey', spectatorKey);
      console.log('🔑 Spectator key detected:', spectatorKey);
    }
    
    socketService.connect();
    
    // Initialize sound manager on any user interaction
    const initSound = () => {
      soundManager.init();
      document.removeEventListener('click', initSound);
      document.removeEventListener('keydown', initSound);
    };
    document.addEventListener('click', initSound);
    document.addEventListener('keydown', initSound);

    socketService.on('lobbyCreated', ({ lobbyCode, lobby }) => {
      setGameState({ lobbyCode, lobby });
      setCurrentView('lobby');
      soundManager.playJoin();
    });

    socketService.on('joinedLobby', ({ lobbyCode, lobby }) => {
      setGameState({ lobbyCode, lobby });
      setCurrentView('lobby');
      soundManager.playJoin();
    });

    socketService.on('lobbyUpdated', (lobby) => {
      setGameState({ lobby });
    });

    // ⭐ รับ roleAssigned ก่อน gameState
    socketService.on('roleAssigned', ({ role, description }) => {
      console.log('🎭 Role Assigned:', role, description);
      setGameState({ 
        playerRole: role, 
        roleDescription: description,
        showRoleModal: true 
      });
    });

    // ⭐ รับ roleChanged เมื่อ role เปลี่ยน (เช่น ถูก Alpha กัดเป็นหมาป่า)
    socketService.on('roleChanged', ({ newRole, message }) => {
      console.log('🔄 Role Changed:', newRole, message);
      // เก็บข้อมูลไว้ แต่ไม่แสดง modal ทันที (จะแสดงตอนกลางคืนถัดไป)
      setGameState({ 
        playerRole: newRole,
        showRoleChangeNotification: false, // ไม่แสดงทันที
        roleChangeMessage: message
      });
    });

    socketService.on('gameState', (state) => {
      console.log('🎮 Game State:', state);
      setGameState({ 
        ...state, 
        isGameActive: true,
        isSpectatorMode: state.isSpectatorMode || false // ⭐ รับ spectator mode จาก server
      });
      setCurrentView('game');
    });

    socketService.on('gameOver', (data) => {
      setGameState({ gameOverData: data });
      setCurrentView('gameOver');
    });

    // ⭐ กลับไปห้องเดิมหลังเกมจบ
    socketService.on('backToLobby', ({ lobby }) => {
      console.log('🔙 กลับไปห้องเดิม:', lobby);
      setGameState({ 
        lobby, 
        isGameActive: false,
        gameOverData: null,
        playerRole: null,
        roleDescription: null,
        showRoleModal: false,
        phase: null,
        players: [],
        logs: []
      });
      setCurrentView('lobby');
    });

    socketService.on('error', (error) => {
      console.error('❌ Error:', error.message);
    });

    return () => {
      socketService.disconnect();
    };
  }, [setGameState]);

  const renderView = () => {
    switch (currentView) {
      case 'lobby':
        return <Lobby />;
      case 'game':
        return <Game />;
      case 'gameOver':
        return <GameOver onBackToHome={() => setCurrentView('home')} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-purple-500 opacity-10 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-pink-500 opacity-10 blur-3xl rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {renderView()}
      </div>

      {/* Sound Toggle */}
      <SoundToggle />
    </div>
  );
}

export default App;

