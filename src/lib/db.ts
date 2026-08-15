import Dexie, { type EntityTable } from "dexie";
import type { Attempt, Question, ReviewState } from "./types";

class SprintDatabase extends Dexie {
  questions!: EntityTable<Question, "id">;
  attempts!: EntityTable<Attempt, "id">;
  reviewStates!: EntityTable<ReviewState, "questionId">;

  constructor() {
    super("shindanshi-sprint-v2");
    this.version(1).stores({
      questions: "id, stage, subject, topic, year, *tags",
      attempts: "id, questionId, answeredAt, correct, confidence, mode",
      reviewStates: "questionId, dueAt, consecutiveCorrect",
    });
  }
}

export const db = new SprintDatabase();
