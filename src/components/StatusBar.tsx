import { useGameStore } from '../stores/gameStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function StatusBar() {
  const { user, selectedAgent, currentTurn, timer, gameOver } = useGameStore();

  return (
    <div className="status-bar">
      <div className={`status-side player-side ${currentTurn === 'player' && !gameOver ? 'active' : ''}`}>
        <div className="status-stone black" />
        <div className="status-info">
          <span className="status-name">{user?.name ?? '玩家'}</span>
          <span className="status-role">黑子</span>
        </div>
        <span className="status-timer">{formatTime(timer.player)}</span>
      </div>

      <div className="status-vs">VS</div>

      <div className={`status-side ai-side ${currentTurn === 'ai' && !gameOver ? 'active' : ''}`}>
        <span className="status-timer">{formatTime(timer.ai)}</span>
        <div className="status-info">
          <span className="status-name">{selectedAgent?.name ?? 'AI'}</span>
          <span className="status-role">白子</span>
        </div>
        <div className="status-stone white" />
      </div>
    </div>
  );
}
