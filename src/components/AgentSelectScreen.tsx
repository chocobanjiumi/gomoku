import { useGameStore } from '../stores/gameStore';

export default function AgentSelectScreen() {
  const { agents, selectAgent, user } = useGameStore();

  return (
    <div className="agent-select-screen">
      <div className="agent-select-header">
        <h2>選擇對手</h2>
        <p>歡迎，{user?.name ?? '玩家'}！請選擇一位 AI 對手</p>
      </div>

      <div className="agent-grid">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="agent-card"
            onClick={() => selectAgent(agent)}
          >
            <div className="agent-avatar">
              {agent.avatar ? (
                <img src={agent.avatar} alt={agent.name} />
              ) : (
                <div className="agent-avatar-placeholder">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h3 className="agent-name">{agent.name}</h3>
            {agent.description && (
              <p className="agent-desc">{agent.description}</p>
            )}
            <div className="agent-play-btn">開始對弈</div>
          </div>
        ))}
      </div>

      {agents.length === 0 && (
        <div className="no-agents">
          <p>尚無可用的 AI 對手</p>
          <p className="no-agents-hint">請先在 Arinova 平台新增 Agent</p>
        </div>
      )}
    </div>
  );
}
