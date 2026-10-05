import {
  ArrowLeft,
  ArrowRight,
  Bot,
  RotateCcw,
  Sparkles,
  Swords,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ArcadeDifficultyNotice from "./ArcadeDifficultyNotice";
import {
  chooseDominoBotMove,
  dealDominoRound,
  getDominoPipTotal,
  getDominoWinnerPoints,
  drawDominoUntilPlayable,
  sortDominoHand,
  getPlayableDominoSides,
  hasPlayableDominoTile,
  placeDominoTile,
  type DominoDifficulty,
  type DominoSide,
  type DominoTile,
} from "@/features/portfolio/utils/domino";

type GameMode = "bot" | "local";
type DominoVariant = "quick" | "classic";
type DominoRules = "draw" | "block";
type MatchTarget = 1 | 2 | 3;
type Turn = "player" | "opponent";
type Winner = Turn | "draw" | null;
type PendingMove = { owner: Turn; index: number; sides: DominoSide[] } | null;
