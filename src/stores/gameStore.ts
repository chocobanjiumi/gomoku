import { create } from 'zustand';
import { createEmptyBoard, checkWin, isBoardFull, isValidMove, type Board } from '../utils/gomoku';
import type { MoveRecord } from '../utils/agentPrompt';

type Screen = 'login' | 'agent-select' | 'game';

interface AgentInfo {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
}

interface UserInfo {
  id: string;
  name: string;
}

interface GameState {
  screen: Screen;
  accessToken: string | null;
  user: UserInfo | null;
  selectedAgent: AgentInfo | null;
  board: Board;
  currentTurn: 'player' | 'ai';
  isAiThinking: boolean;
  gameOver: boolean;
  winner: 'player' | 'ai' | 'draw' | null;
  winLine: [number, number][] | null;
  moveHistory: MoveRecord[];
  timer: { player: number; ai: number };
  lastMove: { row: number; col: number } | null;

  // Actions
  setLogin: (user: UserInfo, accessToken: string) => void;
  setScreen: (screen: Screen) => void;
  selectAgent: (agent: AgentInfo) => void;
  placeStone: (row: number, col: number, player: 1 | 2) => {
    win: boolean;
    draw: boolean;
    winLine: [number, number][] | null;
  };
  setAiThinking: (thinking: boolean) => void;
  setGameOver: (winner: 'player' | 'ai' | 'draw', winLine?: [number, number][]) => void;
  resetGame: () => void;
  tickTimer: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'login',
  accessToken: null,
  user: null,
  selectedAgent: null,
  board: createEmptyBoard(),
  currentTurn: 'player',
  isAiThinking: false,
  gameOver: false,
  winner: null,
  winLine: null,
  moveHistory: [],
  timer: { player: 0, ai: 0 },
  lastMove: null,

  setLogin: (user, accessToken) => set({ user, accessToken, screen: 'agent-select' }),

  setScreen: (screen) => set({ screen }),

  selectAgent: (agent) =>
    set({
      selectedAgent: agent,
      screen: 'game',
      board: createEmptyBoard(),
      currentTurn: 'player',
      isAiThinking: false,
      gameOver: false,
      winner: null,
      winLine: null,
      moveHistory: [],
      timer: { player: 0, ai: 0 },
      lastMove: null,
    }),

  placeStone: (row, col, player) => {
    const state = get();
    if (!isValidMove(state.board, row, col)) {
      return { win: false, draw: false, winLine: null };
    }

    const newBoard = state.board.map((r) => [...r]) as Board;
    newBoard[row][col] = player;

    const newHistory: MoveRecord[] = [...state.moveHistory, { row, col, player }];
    const wl = checkWin(newBoard, row, col, player);
    const draw = !wl && isBoardFull(newBoard);

    set({
      board: newBoard,
      moveHistory: newHistory,
      lastMove: { row, col },
      currentTurn: player === 1 ? 'ai' : 'player',
    });

    return { win: !!wl, draw, winLine: wl };
  },

  setAiThinking: (thinking) => set({ isAiThinking: thinking }),

  setGameOver: (winner, winLine) =>
    set({
      gameOver: true,
      winner,
      winLine: winLine ?? null,
    }),

  resetGame: () =>
    set({
      board: createEmptyBoard(),
      currentTurn: 'player',
      isAiThinking: false,
      gameOver: false,
      winner: null,
      winLine: null,
      moveHistory: [],
      timer: { player: 0, ai: 0 },
      lastMove: null,
    }),

  tickTimer: () => {
    const state = get();
    if (state.gameOver) return;
    const side = state.currentTurn === 'player' ? 'player' : 'ai';
    set({
      timer: { ...state.timer, [side]: state.timer[side] + 1 },
    });
  },
}));
