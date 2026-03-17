import { Arinova } from '@arinova-ai/spaces-sdk';

export default function LoginScreen() {
  const handleLogin = () => {
    Arinova.login();
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
        <button className="login-btn" onClick={handleLogin}>
          Login with Arinova
        </button>
        <p className="login-footer">與 AI 對弈，挑戰智慧</p>
      </div>
    </div>
  );
}
