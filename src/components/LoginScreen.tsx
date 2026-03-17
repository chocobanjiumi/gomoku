import { useState } from 'react';
import { Arinova } from '@arinova-ai/spaces-sdk';
import { useGameStore } from '../stores/gameStore';

export default function LoginScreen() {
  const setLogin = useGameStore((s) => s.setLogin);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, accessToken, agents } = await Arinova.connect({ timeout: 10000 });
      setLogin(
        { id: user.id, name: user.name },
        accessToken,
        (agents ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          avatar: a.avatarUrl ?? undefined,
          description: a.description ?? undefined,
        })),
      );
    } catch (err) {
      console.error('Login failed:', err);
      setError('登入失敗，請重試。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h1 className="login-title">五子棋</h1>
        <p className="login-subtitle">Gomoku - Five in a Row</p>
        <div className="login-decoration">
          <span className="stone-icon black-stone" />
          <span className="stone-icon white-stone" />
        </div>
        <button className="login-btn" onClick={handleLogin} disabled={isLoading}>
          {isLoading ? '連線中...' : 'Login with Arinova'}
        </button>
        {error && <p className="login-error">{error}</p>}
        <p className="login-footer">與 AI 對弈，挑戰智慧</p>
      </div>
    </div>
  );
}
