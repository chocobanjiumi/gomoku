export default function AIThinkingOverlay() {
  return (
    <div className="ai-thinking-overlay">
      <div className="ai-thinking-scan" />
      <div className="ai-thinking-content">
        <div className="ai-thinking-dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </div>
        <p className="ai-thinking-text">思考中...</p>
      </div>
    </div>
  );
}
