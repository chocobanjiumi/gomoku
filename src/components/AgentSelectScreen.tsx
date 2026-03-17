import { useEffect, useState } from 'react';
import { Arinova } from '@arinova-ai/spaces-sdk';
import { useGameStore } from '../stores/gameStore';

interface Agent {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
}

export default function AgentSelectScreen() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, selectAgent, user } = useGameStore();

  useEffect(() => {
    if (!accessToken) return;

    const fetchAgents = async () => {
      try {
        const result = await Arinova.user.agents(accessToken);
        setAgents(result as Agent[]);
      } catch (err) {
        setError('無法取得 AI 列表，請重試');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [accessToken]);

  return (
    <div className="agent-select-screen">
      <div className="agent-select-header">
        <h2>選擇對手</h2>
        <p>歡迎，{user?.name ?? '玩家'}！請選擇一位 AI 對手</p>
      </div>

      {loading && (
        <div className="agent-loading">
          <div className="loading-spinner" />
          <p>載入 AI 列表中...</p>
        </div>
      )}

      {error && <div className="agent-error">{error}</div>}

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

      {!loading && agents.length === 0 && !error && (
        <div className="no-agents">
          <p>尚無可用的 AI 對手</p>
          <p className="no-agents-hint">請先在 Arinova 平台新增 Agent</p>
        </div>
      )}
    </div>
  );
}
