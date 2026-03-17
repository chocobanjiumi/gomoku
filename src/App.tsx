import { useEffect, useRef } from 'react';
import { Arinova } from '@arinova-ai/spaces-sdk';
import { useGameStore } from './stores/gameStore';
import LoginScreen from './components/LoginScreen';
import AgentSelectScreen from './components/AgentSelectScreen';
import GameBoard from './components/GameBoard';
import StatusBar from './components/StatusBar';
import AIThinkingOverlay from './components/AIThinkingOverlay';
import GameOverModal from './components/GameOverModal';

// Initialize SDK once
Arinova.init({ appId: 'gomoku' });

export default function App() {
  const { screen, isAiThinking, gameOver, tickTimer } = useGameStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (screen === 'game' && !gameOver) {
      timerRef.current = setInterval(() => {
        tickTimer();
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [screen, gameOver, tickTimer]);

  if (screen === 'login') {
    return <LoginScreen />;
  }

  if (screen === 'agent-select') {
    return <AgentSelectScreen />;
  }

  return (
    <div className="game-screen">
      <StatusBar />
      <div className="board-container">
        <GameBoard />
        {isAiThinking && <AIThinkingOverlay />}
      </div>
      {gameOver && <GameOverModal />}
    </div>
  );
}
