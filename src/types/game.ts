export type PlayerType = "human" | "ai";

export type PlayerRole =
  | "grandDalmuti"
  | "lesserDalmuti"
  | "merchant"
  | "lesserPeon"
  | "greaterPeon";

export type GamePhase =
  | "setup"
  | "drawingRoles"
  | "dealing"
  | "taxation"
  | "playing"
  | "roundResult"
  | "gameEnd";

export type RevolutionType = "none" | "normal" | "greater";

export type Card = {
  id: string;
  rank: number | null;
  name: string;
  isJoker: boolean;
};

export type Player = {
  id: string;
  name: string;
  type: PlayerType;
  hand: Card[];
  role: PlayerRole;
  seatIndex: number;
  hasPassedLastTurn: boolean;
  finishOrder: number | null;
  isFinished: boolean;
};

export type PlayedSet = {
  cards: Card[];
  rank: number;
  count: number;
  playedById: string;
};

export type RoleDraw = {
  playerId: string;
  card: Card;
  assignedRole: PlayerRole;
};

export type GameActionLog = {
  id: string;
  message: string;
  createdAt: string;
};

export type RoundHistoryEntry = {
  roundNumber: number;
  userRank: number;
  finishOrder: string[];
};

export type GameState = {
  version: "1.0.0";
  phase: GamePhase;
  roundNumber: number;
  players: Player[];
  currentPlayerId: string | null;
  leadPlayerId: string | null;
  lastPlayedById: string | null;
  currentTrick: PlayedSet | null;
  consecutivePassCount: number;
  finishOrder: string[];
  revolutionType: RevolutionType;
  actionLog: GameActionLog[];
  selectedCardIds: string[];
  roleDraws: RoleDraw[];
  pendingRevolutionPlayerId: string | null;
  roundHistory: RoundHistoryEntry[];
};

export type SavedGame = {
  version: "1.0.0";
  savedAt: string;
  gameState: GameState;
};

export type GameAction =
  | {
      type: "CREATE_GAME";
      payload: { playerCount: number; humanName: string };
    }
  | { type: "DRAW_INITIAL_ROLES" }
  | { type: "DEAL_CARDS" }
  | {
      type: "DECLARE_REVOLUTION";
      payload: { declare: boolean; playerId?: string };
    }
  | { type: "PROCESS_TAXATION"; payload?: { returnCardIds?: string[] } }
  | { type: "SELECT_CARD"; payload: { cardId: string } }
  | { type: "CLEAR_SELECTION" }
  | { type: "PLAY_CARDS"; payload: { playerId: string; cardIds: string[] } }
  | { type: "PASS_TURN"; payload: { playerId: string } }
  | { type: "END_TRICK" }
  | { type: "FINISH_PLAYER"; payload: { playerId: string } }
  | { type: "END_ROUND" }
  | { type: "PREPARE_NEXT_ROUND" }
  | { type: "END_GAME" }
  | { type: "RESET_GAME" }
  | { type: "RESTORE_GAME"; payload: { state: GameState } };

export type ValidationResult = {
  valid: boolean;
  reason: string;
};

export type AiAction =
  | { kind: "play"; cards: Card[]; message: string }
  | { kind: "pass"; message: string };
