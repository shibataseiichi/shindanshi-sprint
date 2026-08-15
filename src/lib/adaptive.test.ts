import { describe, expect, it } from "vitest";
import { adaptiveScore, rankCandidates } from "./adaptive";
import type { Question } from "./types";

const question = (id: string): Question => ({
  id, stage: 1, subject: "財務・会計", topic: "財務諸表", subtopic: "基礎", year: 2027,
  source: "test", license: "CC0", question: id, choices: ["A", "B"], answer: 0, explanation: "", tags: [],
});

describe("adaptiveScore", () => {
  const now = new Date("2027-01-31T00:00:00.000Z");

  it("未出題の問題を優先する", () => {
    const unseen = adaptiveScore({ question: question("unseen") }, now);
    const mastered = adaptiveScore({ question: question("seen"), stats: { attempts: 5, correct: 5, wrongRate: 0, lastAnsweredAt: "2027-01-30T00:00:00.000Z" } }, now);
    expect(unseen).toBeGreaterThan(mastered);
  });

  it("誤答率と期限超過が高い問題を上位にする", () => {
    const candidates = [
      { question: question("low"), stats: { attempts: 4, correct: 4, wrongRate: 0, lastAnsweredAt: "2027-01-30T00:00:00.000Z" }, review: { questionId: "low", stability: 3, difficulty: 3, dueAt: "2027-02-10T00:00:00.000Z", lapses: 0, consecutiveCorrect: 2 } },
      { question: question("high"), stats: { attempts: 4, correct: 1, wrongRate: .75, lastAnsweredAt: "2027-01-01T00:00:00.000Z" }, review: { questionId: "high", stability: 1, difficulty: 8, dueAt: "2027-01-20T00:00:00.000Z", lapses: 3, consecutiveCorrect: 0 } },
    ];
    expect(rankCandidates(candidates, now)[0].question.id).toBe("high");
  });

  it("同点ではID順で安定する", () => {
    expect(rankCandidates([{ question: question("b") }, { question: question("a") }], now).map((x) => x.question.id)).toEqual(["a", "b"]);
  });
});
