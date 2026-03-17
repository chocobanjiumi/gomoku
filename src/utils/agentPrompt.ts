import type { Board } from './gomoku';
import { BOARD_SIZE, isValidMove } from './gomoku';

export interface MoveRecord {
  row: number;
  col: number;
  player: 1 | 2;
}

export function buildBoardPrompt(board: Board, moveHistory: MoveRecord[]): string {
  let s = '   ';
  for (let c = 0; c < BOARD_SIZE; c++) {
    s += (c < 10 ? ' ' : '') + c + ' ';
  }
  s += '\n';

  for (let r = 0; r < BOARD_SIZE; r++) {
    s += (r < 10 ? ' ' : '') + r + ' ';
    for (let c = 0; c < BOARD_SIZE; c++) {
      const v = board[r][c];
      s += ' ' + (v === 0 ? '.' : v === 1 ? 'X' : 'O') + ' ';
    }
    s += '\n';
  }

  if (moveHistory.length > 0) {
    const recent = moveHistory.slice(-5);
    s += '\n最近落子：';
    for (const m of recent) {
      s += `${m.player === 1 ? 'X' : 'O'}(${m.row},${m.col}) `;
    }
  }

  return s;
}

export function buildAgentPrompt(board: Board, moveHistory: MoveRecord[]): string {
  const boardStr = buildBoardPrompt(board, moveHistory);
  return `你是五子棋 AI，執白子(O)。棋盤如下（X=黑/玩家, O=白/AI, .=空）：

${boardStr}

規則：你必須且只能回覆一個合法落子座標，格式為 row,col（例如 7,7）。
- 只輸出數字和逗號，不要有任何其他文字、解釋或標點
- row 和 col 範圍是 0-14
- 必須落在空位（.）上
回覆：`;
}

export function buildRetryPrompt(): string {
  return `格式錯誤。請只回覆 row,col（例如 7,7），不要有任何其他文字。回覆：`;
}

/**
 * Parse agent response into a valid move.
 * Returns null if parsing fails or the move is invalid (occupied/out of bounds).
 * Does NOT fallback to random — caller decides what to do on null.
 */
export function parseAgentMove(
  response: string,
  board: Board
): { row: number; col: number } | null {
  const patterns = [
    /(\d{1,2})\s*,\s*(\d{1,2})/,
    /(\d{1,2})\s+(\d{1,2})/,
    /\((\d{1,2})\s*,\s*(\d{1,2})\)/,
  ];

  for (const pattern of patterns) {
    const match = response.match(pattern);
    if (match) {
      const row = parseInt(match[1], 10);
      const col = parseInt(match[2], 10);
      if (isValidMove(board, row, col)) {
        return { row, col };
      }
    }
  }

  return null;
}
