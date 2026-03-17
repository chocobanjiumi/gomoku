import { useGameStore } from '../stores/gameStore';
import { BOARD_SIZE } from '../utils/gomoku';
import { Arinova } from '@arinova-ai/spaces-sdk';
import { buildAgentPrompt, buildRetryPrompt, parseAgentMove } from '../utils/agentPrompt';
import { useState } from 'react';

const PADDING = 30;
const CELL_SIZE = 36;
const BOARD_PX = CELL_SIZE * (BOARD_SIZE - 1) + PADDING * 2;
const STONE_R = CELL_SIZE * 0.43;

const STAR_POINTS: [number, number][] = [
  [3, 3], [3, 11], [7, 7], [11, 3], [11, 11],
];

function toX(col: number) {
  return PADDING + col * CELL_SIZE;
}
function toY(row: number) {
  return PADDING + row * CELL_SIZE;
}

export default function GameBoard() {
  const { board, currentTurn, isAiThinking, gameOver, winLine, lastMove, placeStone, setAiThinking, setGameOver, accessToken, selectedAgent, moveHistory } = useGameStore();
  const [hoverPos, setHoverPos] = useState<{ row: number; col: number } | null>(null);

  const handleClick = (row: number, col: number) => {
    if (currentTurn !== 'player' || isAiThinking || gameOver) return;
    if (board[row][col] !== 0) return;

    const result = placeStone(row, col, 1);
    if (result.win) {
      setGameOver('player', result.winLine ?? undefined);
      return;
    }
    if (result.draw) {
      setGameOver('draw');
      return;
    }

    // Trigger AI turn
    triggerAiTurn();
  };

  const [aiError, setAiError] = useState<string | null>(null);

  const triggerAiTurn = async () => {
    setAiThinking(true);
    setAiError(null);
    try {
      const currentState = useGameStore.getState();
      const prompt = buildAgentPrompt(currentState.board, currentState.moveHistory);

      // First attempt
      const { response } = await Arinova.agent.chat({
        agentId: selectedAgent!.id,
        prompt,
        accessToken: accessToken!,
      });

      let boardNow = useGameStore.getState().board;
      let move = parseAgentMove(response, boardNow);

      // If first attempt failed, retry once with stricter prompt
      if (!move) {
        const retry = await Arinova.agent.chat({
          agentId: selectedAgent!.id,
          prompt: buildRetryPrompt(),
          accessToken: accessToken!,
        });
        boardNow = useGameStore.getState().board;
        move = parseAgentMove(retry.response, boardNow);
      }

      // If still no valid move, show error — do NOT random fallback
      if (!move) {
        setAiError('AI 無法決定落子位置，請重新開局或換一個 AI 對手。');
        useGameStore.getState().setAiThinking(false);
        return;
      }

      const aiResult = useGameStore.getState().placeStone(move.row, move.col, 2);

      if (aiResult.win) {
        useGameStore.getState().setGameOver('ai', aiResult.winLine ?? undefined);
      } else if (aiResult.draw) {
        useGameStore.getState().setGameOver('draw');
      }
    } catch (err) {
      console.error('AI move error:', err);
      setAiError('AI 連線失敗，請稍後再試。');
    } finally {
      useGameStore.getState().setAiThinking(false);
    }
  };

  const isWinCell = (r: number, c: number) =>
    winLine?.some(([wr, wc]) => wr === r && wc === c) ?? false;

  const isLastMove = (r: number, c: number) =>
    lastMove?.row === r && lastMove?.col === c;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (currentTurn !== 'player' || isAiThinking || gameOver) {
      setHoverPos(null);
      return;
    }
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = BOARD_PX / rect.width;
    const scaleY = BOARD_PX / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const col = Math.round((mx - PADDING) / CELL_SIZE);
    const row = Math.round((my - PADDING) / CELL_SIZE);
    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && board[row][col] === 0) {
      setHoverPos({ row, col });
    } else {
      setHoverPos(null);
    }
  };

  return (
    <>
    {aiError && (
      <div className="ai-error-banner">
        <span>{aiError}</span>
        <button onClick={() => setAiError(null)}>✕</button>
      </div>
    )}
    <svg
      className="game-board-svg"
      viewBox={`0 0 ${BOARD_PX} ${BOARD_PX}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverPos(null)}
    >
      {/* Background */}
      <rect x="0" y="0" width={BOARD_PX} height={BOARD_PX} fill="#DEB887" rx="4" />

      {/* Grid lines */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => (
        <g key={`grid-${i}`}>
          <line
            x1={toX(0)} y1={toY(i)} x2={toX(BOARD_SIZE - 1)} y2={toY(i)}
            stroke="#8B7355" strokeWidth="1"
          />
          <line
            x1={toX(i)} y1={toY(0)} x2={toX(i)} y2={toY(BOARD_SIZE - 1)}
            stroke="#8B7355" strokeWidth="1"
          />
        </g>
      ))}

      {/* Star points */}
      {STAR_POINTS.map(([r, c]) => (
        <circle key={`star-${r}-${c}`} cx={toX(c)} cy={toY(r)} r="4" fill="#8B7355" />
      ))}

      {/* Hover preview */}
      {hoverPos && (
        <circle
          cx={toX(hoverPos.col)}
          cy={toY(hoverPos.row)}
          r={STONE_R}
          fill="rgba(0,0,0,0.3)"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* Stones */}
      {board.map((rowArr, r) =>
        rowArr.map((cell, c) => {
          if (cell === 0) return null;
          const isBlack = cell === 1;
          const win = isWinCell(r, c);
          const last = isLastMove(r, c);
          const gradId = isBlack ? 'blackGrad' : 'whiteGrad';

          return (
            <g key={`stone-${r}-${c}`} className="stone-group">
              {/* Shadow */}
              <circle
                cx={toX(c) + 2}
                cy={toY(r) + 2}
                r={STONE_R}
                fill="rgba(0,0,0,0.2)"
              />
              {/* Stone */}
              <circle
                cx={toX(c)}
                cy={toY(r)}
                r={STONE_R}
                fill={`url(#${gradId})`}
                className={`stone ${win ? 'win-stone' : ''} stone-place`}
              />
              {/* Last move indicator */}
              {last && (
                <circle
                  cx={toX(c)}
                  cy={toY(r)}
                  r={STONE_R * 0.25}
                  fill={isBlack ? '#fff' : '#000'}
                  opacity="0.7"
                />
              )}
              {/* Win glow */}
              {win && (
                <circle
                  cx={toX(c)}
                  cy={toY(r)}
                  r={STONE_R + 3}
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="2"
                  className="win-glow"
                />
              )}
            </g>
          );
        })
      )}

      {/* Click targets */}
      {board.map((rowArr, r) =>
        rowArr.map((cell, c) => {
          if (cell !== 0) return null;
          return (
            <rect
              key={`click-${r}-${c}`}
              x={toX(c) - CELL_SIZE / 2}
              y={toY(r) - CELL_SIZE / 2}
              width={CELL_SIZE}
              height={CELL_SIZE}
              fill="transparent"
              style={{ cursor: currentTurn === 'player' && !isAiThinking && !gameOver ? 'pointer' : 'default' }}
              onClick={() => handleClick(r, c)}
            />
          );
        })
      )}

      {/* Gradient definitions */}
      <defs>
        <radialGradient id="blackGrad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#111" />
        </radialGradient>
        <radialGradient id="whiteGrad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="#ccc" />
        </radialGradient>
      </defs>
    </svg>
    </>
  );
}
