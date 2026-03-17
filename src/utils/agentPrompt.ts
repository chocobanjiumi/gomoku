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
  return `你是五子棋 AI，執白子(O)。以下是目前棋盤（X=黑/玩家, O=白/AI, .=空）：

${boardStr}

請選擇下一步落子位置，只回覆 row,col 格式（例如 7,7）。不要加任何其他文字。`;
}

export function parseAgentMove(
  response: string,
  board: Board
): { row: number; col: number } {
  // Try to extract row,col pattern
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

  // Fallback: pick a random valid move
  const validMoves: { row: number; col: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) {
        validMoves.push({ row: r, col: c });
      }
    }
  }

  if (validMoves.length === 0) {
    return { row: 7, col: 7 }; // shouldn't happen
  }

  // Prefer moves near existing stones
  const occupied: { row: number; col: number }[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) occupied.push({ row: r, col: c });
    }
  }

  if (occupied.length > 0) {
    const nearby = validMoves.filter((m) =>
      occupied.some(
        (o) => Math.abs(o.row - m.row) <= 2 && Math.abs(o.col - m.col) <= 2
      )
    );
    if (nearby.length > 0) {
      return nearby[Math.floor(Math.random() * nearby.length)];
    }
  }

  return validMoves[Math.floor(Math.random() * validMoves.length)];
}
