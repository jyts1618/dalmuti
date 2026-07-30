import { createDeck, describeCards, shuffleDeck, sortHand } from "@/game/deck";
import { canPlayCards, calculateFinishOrder, getNextActivePlayer, getSelectedCards, isTrickComplete } from "@/game/gameRules";
import { getRevolutionCandidate, getRevolutionType } from "@/game/revolution";
import {
  assignRolesFromFinishOrder,
  drawInitialRoles,
  getRolesForPlayerCount,
  reverseRolesForGreaterRevolution,
  sortPlayersByRole,
} from "@/game/roleAssignment";
import { getRequiredReturnCount, processTaxation } from "@/game/taxation";
import type { Card, GameAction, GameActionLog, GameState, Player, PlayedSet } from "@/types/game";

const AI_NAMES = ["아서", "엘레나", "로빈", "마르코", "소피아", "레오", "아이리스"];

export const initialGameState: GameState = {
  version: "1.0.0",
  phase: "setup",
  aiDifficulty: "normal",
  roundNumber: 1,
  players: [],
  currentPlayerId: null,
  leadPlayerId: null,
  lastPlayedById: null,
  currentTrick: null,
  consecutivePassCount: 0,
  finishOrder: [],
  revolutionType: "none",
  actionLog: [],
  selectedCardIds: [],
  roleDraws: [],
  pendingRevolutionPlayerId: null,
  roundHistory: [],
};

function createLog(message: string): GameActionLog {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    message,
    createdAt: new Date().toISOString(),
  };
}

function withLog(state: GameState, message: string): GameState {
  return {
    ...state,
    actionLog: [createLog(message), ...state.actionLog].slice(0, 80),
  };
}

function createPlayers(playerCount: number, humanName: string): Player[] {
  const trimmedName = humanName.trim() || "나";
  const roles = getRolesForPlayerCount(playerCount);
  const names = new Set([trimmedName]);

  const human: Player = {
    id: "player-human",
    name: trimmedName,
    type: "human",
    hand: [],
    role: roles[0],
    seatIndex: 0,
    hasPassedLastTurn: false,
    finishOrder: null,
    isFinished: false,
  };

  const aiPlayers = Array.from({ length: playerCount - 1 }, (_, index) => {
    let name = AI_NAMES[index] ?? `AI ${index + 1}`;
    let suffix = 2;
    while (names.has(name)) {
      name = `${AI_NAMES[index] ?? "AI"} ${suffix}`;
      suffix += 1;
    }
    names.add(name);

    return {
      id: `player-ai-${index + 1}`,
      name,
      type: "ai" as const,
      hand: [],
      role: roles[index + 1],
      seatIndex: index + 1,
      hasPassedLastTurn: false,
      finishOrder: null,
      isFinished: false,
    };
  });

  return [human, ...aiPlayers];
}

export function dealCards(players: Player[], random: () => number = Math.random): Player[] {
  const deck = shuffleDeck(createDeck(), random);
  const ordered = sortPlayersByRole(players).map((player) => ({
    ...player,
    hand: [] as Card[],
    hasPassedLastTurn: false,
    finishOrder: null,
    isFinished: false,
  }));

  deck.forEach((card, index) => {
    const playerIndex = index % ordered.length;
    ordered[playerIndex].hand.push(card);
  });

  return ordered.map((player) => ({ ...player, hand: sortHand(player.hand) }));
}

function prepareDealtState(state: GameState, players: Player[]): GameState {
  const dealtPlayers = dealCards(players);
  const candidate = getRevolutionCandidate(dealtPlayers);
  const revolutionType = getRevolutionType(candidate);
  const shouldAskHuman = candidate?.type === "human";
  const nextPlayers = candidate?.type === "ai" && revolutionType === "greater" ? reverseRolesForGreaterRevolution(dealtPlayers) : dealtPlayers;

  const message = candidate
    ? candidate.type === "ai"
      ? `${candidate.name}가 ${revolutionType === "greater" ? "대혁명" : "혁명"}을 선언했습니다. 이번 라운드는 세금을 생략합니다.`
      : "조커 2장을 받았습니다. 혁명을 선언할 수 있습니다."
    : "카드 분배가 끝났습니다. 세금 단계를 진행하세요.";

  return withLog(
    {
      ...state,
      phase: "taxation",
      players: nextPlayers,
      currentPlayerId: null,
      leadPlayerId: null,
      lastPlayedById: null,
      currentTrick: null,
      consecutivePassCount: 0,
      finishOrder: [],
      selectedCardIds: [],
      revolutionType: candidate?.type === "ai" ? revolutionType : "none",
      pendingRevolutionPlayerId: shouldAskHuman ? candidate.id : null,
    },
    message,
  );
}

function startPlaying(state: GameState, players: Player[]): GameState {
  const ordered = sortPlayersByRole(players);
  const firstPlayer = ordered.find((player) => !player.isFinished && player.hand.length > 0) ?? null;

  return withLog(
    {
      ...state,
      phase: "playing",
      players: ordered,
      currentPlayerId: firstPlayer?.id ?? null,
      leadPlayerId: firstPlayer?.id ?? null,
      lastPlayedById: null,
      currentTrick: null,
      consecutivePassCount: 0,
      selectedCardIds: [],
      pendingRevolutionPlayerId: null,
    },
    firstPlayer ? `${firstPlayer.name}가 첫 트릭을 시작합니다.` : "라운드를 시작할 플레이어가 없습니다.",
  );
}

function completeRoundIfNeeded(state: GameState, players: Player[], finishOrder: string[]): GameState | null {
  if (finishOrder.length < players.length) return null;

  const user = players.find((player) => player.type === "human");
  const userRank = user ? finishOrder.indexOf(user.id) + 1 : 0;
  const roundHistory = [
    ...state.roundHistory,
    { roundNumber: state.roundNumber, userRank, finishOrder },
  ];

  return withLog(
    {
      ...state,
      phase: "roundResult",
      players,
      currentPlayerId: null,
      leadPlayerId: null,
      lastPlayedById: null,
      currentTrick: null,
      consecutivePassCount: 0,
      finishOrder,
      selectedCardIds: [],
      roundHistory,
    },
    "라운드가 종료되었습니다.",
  );
}

function markFinishedPlayers(players: Player[], finishOrder: string[]): Player[] {
  return players.map((player) => {
    const index = finishOrder.indexOf(player.id);
    return {
      ...player,
      isFinished: index >= 0 || player.hand.length === 0,
      finishOrder: index >= 0 ? index + 1 : player.finishOrder,
    };
  });
}

function nextAfterTrick(state: GameState, players: Player[], fallbackId: string): string | null {
  const lastPlayedBy = state.lastPlayedById ? players.find((player) => player.id === state.lastPlayedById) : null;
  if (lastPlayedBy && !lastPlayedBy.isFinished && lastPlayedBy.hand.length > 0) {
    return lastPlayedBy.id;
  }
  return getNextActivePlayer(players, state.lastPlayedById ?? fallbackId)?.id ?? null;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  try {
    switch (action.type) {
      case "CREATE_GAME": {
        const playerCount = Math.min(8, Math.max(4, action.payload.playerCount));
        return withLog(
          {
            ...initialGameState,
            phase: "drawingRoles",
            aiDifficulty: action.payload.aiDifficulty,
            players: createPlayers(playerCount, action.payload.humanName),
          },
          `총 ${playerCount}명이 참여하는 새 게임을 만들었습니다. AI 난이도는 ${action.payload.aiDifficulty === "easy" ? "쉬움" : action.payload.aiDifficulty === "hard" ? "어려움" : "보통"}입니다.`,
        );
      }

      case "DRAW_INITIAL_ROLES": {
        if (state.phase !== "drawingRoles") return withLog(state, "지금은 계급 추첨을 할 수 없습니다.");
        const { players, roleDraws } = drawInitialRoles(state.players);
        return withLog(
          { ...state, players, roleDraws },
          "첫 라운드 계급 추첨이 완료되었습니다.",
        );
      }

      case "DEAL_CARDS": {
        if (state.phase !== "drawingRoles" && state.phase !== "dealing") {
          return withLog(state, "지금은 카드를 분배할 수 없습니다.");
        }
        return prepareDealtState({ ...state, phase: "dealing" }, state.players);
      }

      case "DECLARE_REVOLUTION": {
        if (state.phase !== "taxation" || !state.pendingRevolutionPlayerId) {
          return withLog(state, "지금은 혁명을 선언할 수 없습니다.");
        }

        if (!action.payload.declare) {
          return withLog(
            { ...state, pendingRevolutionPlayerId: null, revolutionType: "none" },
            "혁명을 선언하지 않았습니다. 세금 단계를 진행합니다.",
          );
        }

        const player = state.players.find((item) => item.id === (action.payload.playerId ?? state.pendingRevolutionPlayerId)) ?? null;
        const revolutionType = getRevolutionType(player);
        const players = revolutionType === "greater" ? reverseRolesForGreaterRevolution(state.players) : state.players;

        return startPlaying(
          {
            ...state,
            players,
            revolutionType,
            pendingRevolutionPlayerId: null,
          },
          players,
        );
      }

      case "PROCESS_TAXATION": {
        if (state.phase !== "taxation") return withLog(state, "지금은 세금을 처리할 수 없습니다.");
        if (state.pendingRevolutionPlayerId) return withLog(state, "혁명 선언 여부를 먼저 선택하세요.");

        if (state.revolutionType !== "none") {
          return startPlaying(state, state.players);
        }

        const human = state.players.find((player) => player.type === "human");
        const requiredCount = human ? getRequiredReturnCount(state.players, human.id) : 0;
        const returnCardIds = action.payload?.returnCardIds ?? [];

        if (requiredCount !== returnCardIds.length) {
          return withLog(state, `${requiredCount}장의 세금 반환 카드를 선택해야 합니다.`);
        }

        const taxedPlayers = processTaxation(state.players, returnCardIds);
        return startPlaying(withLog({ ...state, players: taxedPlayers }, "세금 교환이 완료되었습니다."), taxedPlayers);
      }

      case "SELECT_CARD": {
        if (state.phase !== "playing" && state.phase !== "taxation") return state;
        const human = state.players.find((player) => player.type === "human");
        if (!human || human.isFinished) return state;
        if (state.phase === "playing" && state.currentPlayerId !== human.id) return state;

        const selected = state.selectedCardIds.includes(action.payload.cardId)
          ? state.selectedCardIds.filter((id) => id !== action.payload.cardId)
          : [...state.selectedCardIds, action.payload.cardId];

        return { ...state, selectedCardIds: selected };
      }

      case "CLEAR_SELECTION":
        return { ...state, selectedCardIds: [] };

      case "PLAY_CARDS": {
        if (state.phase !== "playing") return withLog(state, "지금은 카드를 낼 수 없습니다.");
        if (state.currentPlayerId !== action.payload.playerId) return withLog(state, "현재 차례인 플레이어만 카드를 낼 수 있습니다.");

        const player = state.players.find((item) => item.id === action.payload.playerId);
        if (!player || player.isFinished) return withLog(state, "카드를 낼 플레이어를 찾을 수 없습니다.");

        const cards = getSelectedCards(player.hand, action.payload.cardIds);
        const validation = canPlayCards(cards, state.currentTrick);
        if (!validation.valid) return withLog(state, validation.reason);

        const rank = cards.find((card) => !card.isJoker)?.rank ?? 13;
        const playedSet: PlayedSet = {
          cards,
          rank,
          count: cards.length,
          playedById: player.id,
        };
        const playedIds = new Set(cards.map((card) => card.id));
        let nextPlayers = state.players.map((item) =>
          item.id === player.id
            ? {
                ...item,
                hand: sortHand(item.hand.filter((card) => !playedIds.has(card.id))),
                hasPassedLastTurn: false,
              }
            : { ...item, hasPassedLastTurn: false },
        );

        let nextFinishOrder = calculateFinishOrder(nextPlayers, state.finishOrder);
        nextPlayers = markFinishedPlayers(nextPlayers, nextFinishOrder);
        nextFinishOrder = calculateFinishOrder(nextPlayers, nextFinishOrder);
        nextPlayers = markFinishedPlayers(nextPlayers, nextFinishOrder);

        const completedRound = completeRoundIfNeeded(
          {
            ...state,
            players: nextPlayers,
            currentTrick: playedSet,
            lastPlayedById: player.id,
            finishOrder: nextFinishOrder,
          },
          nextPlayers,
          nextFinishOrder,
        );
        if (completedRound) return completedRound;

        const nextPlayer = getNextActivePlayer(nextPlayers, player.id);
        return withLog(
          {
            ...state,
            players: nextPlayers,
            currentTrick: playedSet,
            lastPlayedById: player.id,
            leadPlayerId: player.id,
            consecutivePassCount: 0,
            currentPlayerId: nextPlayer?.id ?? null,
            finishOrder: nextFinishOrder,
            selectedCardIds: [],
          },
          `${player.name}가 ${describeCards(cards)}을 냈습니다.`,
        );
      }

      case "PASS_TURN": {
        if (state.phase !== "playing") return withLog(state, "지금은 패스할 수 없습니다.");
        if (state.currentPlayerId !== action.payload.playerId) return withLog(state, "현재 차례인 플레이어만 패스할 수 있습니다.");

        const player = state.players.find((item) => item.id === action.payload.playerId);
        if (!player) return state;

        const nextPassCount = state.consecutivePassCount + 1;
        const passPlayers = state.players.map((item) =>
          item.id === player.id ? { ...item, hasPassedLastTurn: true } : item,
        );

        if (isTrickComplete(passPlayers, nextPassCount, state.currentTrick)) {
          const currentPlayerId = nextAfterTrick(state, passPlayers, player.id);
          return withLog(
            {
              ...state,
              players: passPlayers.map((item) => ({ ...item, hasPassedLastTurn: false })),
              currentPlayerId,
              leadPlayerId: currentPlayerId,
              currentTrick: null,
              consecutivePassCount: 0,
              selectedCardIds: [],
            },
            `${player.name}가 패스했습니다. 트릭이 종료되었습니다.`,
          );
        }

        const nextPlayer = getNextActivePlayer(passPlayers, player.id);
        return withLog(
          {
            ...state,
            players: passPlayers,
            currentPlayerId: nextPlayer?.id ?? null,
            consecutivePassCount: nextPassCount,
            selectedCardIds: [],
          },
          `${player.name}가 패스했습니다.`,
        );
      }

      case "END_TRICK": {
        if (state.phase !== "playing") return state;
        const currentPlayerId = nextAfterTrick(state, state.players, state.currentPlayerId ?? "");
        return withLog(
          {
            ...state,
            currentPlayerId,
            leadPlayerId: currentPlayerId,
            currentTrick: null,
            consecutivePassCount: 0,
            selectedCardIds: [],
          },
          "트릭이 종료되었습니다.",
        );
      }

      case "FINISH_PLAYER": {
        const finishOrder = calculateFinishOrder(state.players, state.finishOrder);
        return { ...state, finishOrder, players: markFinishedPlayers(state.players, finishOrder) };
      }

      case "END_ROUND": {
        const finishOrder = calculateFinishOrder(state.players, state.finishOrder);
        const players = markFinishedPlayers(state.players, finishOrder);
        return completeRoundIfNeeded(state, players, finishOrder) ?? state;
      }

      case "PREPARE_NEXT_ROUND": {
        if (state.phase !== "roundResult") return withLog(state, "라운드 결과 화면에서만 다음 라운드를 시작할 수 있습니다.");
        const nextPlayers = assignRolesFromFinishOrder(state.players, state.finishOrder);
        return prepareDealtState(
          {
            ...state,
            roundNumber: state.roundNumber + 1,
            players: nextPlayers,
            roleDraws: [],
            revolutionType: "none",
            finishOrder: [],
          },
          nextPlayers,
        );
      }

      case "END_GAME":
        return withLog({ ...state, phase: "gameEnd", selectedCardIds: [] }, "현재 게임을 종료했습니다.");

      case "RESET_GAME":
        return initialGameState;

      case "RESTORE_GAME":
        return action.payload.state.version === "1.0.0"
          ? { ...action.payload.state, aiDifficulty: action.payload.state.aiDifficulty ?? "normal" }
          : initialGameState;

      default:
        return state;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return withLog(state, message);
  }
}
