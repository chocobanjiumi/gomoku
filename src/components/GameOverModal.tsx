import { useGameStore } from '../stores/gameStore';

export default function GameOverModal() {
  const { winner, moveHistory, resetGame } = useGameStore();

  const winnerText = winner === 'player' ? '恭喜你贏了！' : winner === 'ai' ? 'AI 獲勝！' : '平局！';
  const emoji = winner === 'player' ? '' : winner === 'ai' ? '' : '';

  return (
    <div className="game-over-backdrop">
      <div className="confetti-container">
        {winner === 'player' &&
          Array.from({ length: 40 }, (_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6eb4', '#a855f7'][i % 6],
                width: `${6 + Math.random() * 8}px`,
                height: `${6 + Math.random() * 8}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
      </div>
      <div className="game-over-modal">
        <h2 className="game-over-title">{winnerText}</h2>
        <div className="game-over-stats">
          <div className="stat-item">
            <span className="stat-label">總手數</span>
            <span className="stat-value">{moveHistory.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">玩家手數</span>
            <span className="stat-value">{moveHistory.filter((m) => m.player === 1).length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">AI 手數</span>
            <span className="stat-value">{moveHistory.filter((m) => m.player === 2).length}</span>
          </div>
        </div>
        <button className="play-again-btn" onClick={resetGame}>
          再來一局
        </button>
      </div>
    </div>
  );
}
