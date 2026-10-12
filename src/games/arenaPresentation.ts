import type { ActionId, ActionState } from "../lib/actionCollection";
import type { MotionState } from "../lib/motionExpansion";

export type ArenaGoal = {
  label: string;
  objective: string;
  value: number;
  target: number;
  unit: string;
};

const motionObjectives: Record<string, string> = {
  rhythm: "Mantenha o ritmo por 45 segundos sem perder todas as vidas.",
  balloons: "Capture os balões e evite × por 45 segundos.",
  meteors: "Proteja a base dos meteoros por 45 segundos.",
  balance: "Mantenha a esfera na plataforma por 45 segundos.",
  ski: "Atravesse as portas e evite árvores por 45 segundos.",
  turret: "Defenda a base dos inimigos por 45 segundos.",
};

export function motionGoal(s: MotionState): ArenaGoal {
  if (s.id === "stack") return { label: "Torre", objective: "Empilhe 12 andares mantendo apoio entre os blocos.", value: s.progress, target: 12, unit: "andares" };
  if (s.id === "crossroad") return { label: "Travessias", objective: "Alcance a calçada superior 3 vezes sem perder todas as vidas.", value: s.progress, target: 3, unit: "travessias" };
  if (s.id === "rope") return { label: "Saltos limpos", objective: "Salte a corda 20 vezes sem perder todas as vidas.", value: s.progress, target: 20, unit: "saltos" };
  if (s.id === "ricochet") {
    const target = 7 + s.difficulty;
    const remaining = s.objects.filter(o => o.kind === "target" && o.active).length;
    return { label: "Alvos destruídos", objective: `Destrua os ${target} alvos com até 8 disparos.`, value: target - remaining, target, unit: "alvos" };
  }
  return { label: "Resistência", objective: motionObjectives[s.id] ?? "Conclua a arena em 45 segundos.", value: Math.floor(s.time), target: 45, unit: "s" };
}

export function actionTarget(id: ActionId) {
  return id === "pong" ? 500 : id === "pouso" ? 1000 : id === "esquiva" || id === "drift" ? 900 : 600;
}

export function actionOutcome(s: ActionState) {
  if (s.won) return "Objetivo alcançado. Missão concluída!";
  if (s.lives <= 0) return "As vidas se esgotaram. Uma nova tentativa começa do zero.";
  if (s.mode === "mission" && s.time >= 180) return "O tempo da missão terminou antes da meta.";
  return "Partida encerrada. Reveja sua estratégia e tente novamente.";
}

export const actionHints: Record<ActionId, string> = {
  breakout: "Mova a raquete para ajustar o ângulo do rebote.",
  pong: "Mova a raquete para cima e para baixo; antecipe a bola.",
  asteroides: "Gire, impulsione a nave e dispare para abrir caminho.",
  invasores: "Mova para os lados e mantenha o disparo pressionado.",
  runner: "Segure para um salto alto; solte cedo para encurtá-lo.",
  voo: "Toque para bater as asas e recuperar a altitude.",
  jetpack: "Segure para subir; solte para economizar combustível.",
  esquiva: "Antecipe as ameaças e corrija a inércia com as direções.",
  pouso: "Dose o motor e corrija os lados para pousar suavemente.",
  drift: "Acelere, vire e freie nas curvas; siga os checkpoints.",
};

export const motionHints: Record<string, string> = {
  rhythm: "Toque nas faixas ou use 1–4 quando a nota cruzar a linha.",
  balloons: "Toque no balão ou use seu número; evite os marcados com ×.",
  meteors: "Deslize ou use as direções para posicionar o escudo.",
  stack: "Toque na arena ou use Ação para soltar o bloco.",
  balance: "Deslize ou use as direções para inclinar a plataforma.",
  ski: "Deslize ou use as direções para antecipar cada curva.",
  crossroad: "Deslize ou use as quatro direções para avançar entre as faixas.",
  rope: "Toque na arena ou use Ação antes da corda passar pelos pés.",
  turret: "Deslize para mirar e toque na arena ou em Ação para disparar.",
  ricochet: "Deslize para mirar; toque ou use Ação para lançar a esfera.",
};
