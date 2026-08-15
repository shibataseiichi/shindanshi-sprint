import type { Question, QuestionStats, ReviewState } from "./types";

export interface AdaptiveCandidate {
  question: Question;
  stats?: QuestionStats;
  review?: ReviewState;
}

export interface AdaptiveWeights {
  unseen: number;
  wrongRate: number;
  due: number;
  recency: number;
}

export const DEFAULT_WEIGHTS: AdaptiveWeights = {
  unseen: 100,
  wrongRate: 50,
  due: 40,
  recency: 30,
};

const DAY = 86_400_000;

export function adaptiveScore(
  candidate: AdaptiveCandidate,
  now = new Date(),
  weights = DEFAULT_WEIGHTS,
): number {
  const { stats, review } = candidate;
  const unseen = !stats?.attempts ? 1 : 0;
  const wrongRate = stats?.wrongRate ?? 0;
  const due = review ? Math.max(0, Math.min(1, (now.getTime() - new Date(review.dueAt).getTime()) / (7 * DAY) + 0.5)) : 0;
  const daysSince = stats?.lastAnsweredAt
    ? Math.max(0, (now.getTime() - new Date(stats.lastAnsweredAt).getTime()) / DAY)
    : 0;
  const recency = stats?.attempts ? Math.min(1, daysSince / 30) : 0;

  return unseen * weights.unseen + wrongRate * weights.wrongRate + due * weights.due + recency * weights.recency;
}

export function rankCandidates(candidates: AdaptiveCandidate[], now = new Date()): AdaptiveCandidate[] {
  return [...candidates].sort((a, b) => {
    const delta = adaptiveScore(b, now) - adaptiveScore(a, now);
    return delta || a.question.id.localeCompare(b.question.id);
  });
}
