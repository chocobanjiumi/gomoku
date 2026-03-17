import { useEffect, useRef } from 'react';
import { Arinova } from '@arinova-ai/spaces-sdk';
import { useGameStore } from './stores/gameStore';
import LoginScreen from './components/LoginScreen';
import AgentSelectScreen from './components/AgentSelectScreen';
import GameBoard from './components/GameBoard';
import StatusBar from './components/StatusBar';
import AIThinkingOverlay from './components/AIThinkingOverlay';
import GameOverModal from './components/GameOverModal';

export default function App() {
  const { screen, setLogin, isAiThinking, gameOver, tickTimer } = useGameStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize SDK and handle callback
  useEffect(() => {
    Arinova.init({ appId: 'gomoku' });

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      Arinova.handleCallback({
        code,
        clientId: 'gomoku',
        redirectUri: window.location.origin,
      } as Parameters<typeof Arinova.handleCallback>[0])
        .then((result: { user: { id: string; name: string }; accessToken: string }) => {
          setLogin(
            { id: result.user.id, name: result.user.name },
            result.accessToken
          );
          // Clean URL
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch((err: unknown) => {
          console.error('Auth callback failed:', err);
        });
    }
  }, [setLogin]);

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
