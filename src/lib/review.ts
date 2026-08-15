import type { Confidence, ReviewState } from "./types";

const DAY = 86_400_000;

export function scheduleReview(
  previous: ReviewState | undefined,
  correct: boolean,
  confidence: Confidence,
  now = new Date(),
  questionId = previous?.questionId ?? "",
): ReviewState {
  const base: ReviewState = previous ?? {
    questionId,
    stability: 1,
    difficulty: 5,
    dueAt: now.toISOString(),
    lapses: 0,
    consecutiveCorrect: 0,
  };
  const uncertain = confidence <= 2;
  const success = correct && !uncertain;
  const stability = success
    ? Math.min(365, base.stability * (1.45 + confidence * 0.18))
    : Math.max(0.5, base.stability * (correct ? 0.8 : 0.45));
  const difficulty = Math.max(1, Math.min(10, base.difficulty + (success ? -0.25 : correct ? 0.25 : 0.8)));
  const intervalDays = success ? Math.max(1, Math.round(stability)) : correct ? 1 : 0.25;

  return {
    ...base,
    questionId,
    stability,
    difficulty,
    dueAt: new Date(now.getTime() + intervalDays * DAY).toISOString(),
    lapses: base.lapses + (correct ? 0 : 1),
    consecutiveCorrect: correct ? base.consecutiveCorrect + 1 : 0,
  };
}
