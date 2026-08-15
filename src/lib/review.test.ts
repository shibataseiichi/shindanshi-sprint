import { describe, expect, it } from "vitest";
import { scheduleReview } from "./review";

describe("scheduleReview", () => {
  const now = new Date("2027-01-01T00:00:00.000Z");

  it("確信のある正解は安定度と連続正解数を伸ばす", () => {
    const next = scheduleReview(undefined, true, 4, now, "q1");
    expect(next.stability).toBeGreaterThan(1);
    expect(next.consecutiveCorrect).toBe(1);
    expect(new Date(next.dueAt).getTime()).toBeGreaterThan(now.getTime());
  });

  it("迷った正解は弱点扱いで翌日に再出題する", () => {
    const next = scheduleReview(undefined, true, 1, now, "q1");
    expect(next.stability).toBeLessThan(1);
    expect(next.consecutiveCorrect).toBe(1);
    expect(next.dueAt).toBe("2027-01-02T00:00:00.000Z");
  });

  it("不正解は連続正解をリセットしlapseを増やす", () => {
    const previous = { questionId: "q1", stability: 10, difficulty: 4, dueAt: now.toISOString(), lapses: 1, consecutiveCorrect: 2 };
    const next = scheduleReview(previous, false, 2, now);
    expect(next.consecutiveCorrect).toBe(0);
    expect(next.lapses).toBe(2);
    expect(next.stability).toBeLessThan(previous.stability);
  });
});
