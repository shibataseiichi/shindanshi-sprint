export const SUBJECTS = [
  "経済学・経済政策",
  "財務・会計",
  "企業経営理論",
  "運営管理",
  "経営法務",
  "経営情報システム",
  "中小企業経営・政策",
] as const;

export type Subject = (typeof SUBJECTS)[number];
export type Confidence = 1 | 2 | 3 | 4;
export type QuizMode = "practice" | "exam";

export interface Question {
  id: string;
  stage: 1 | 2;
  subject: Subject;
  topic: string;
  subtopic: string;
  year: number;
  source: string;
  license: string;
  sourceUrl?: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  tags: string[];
}

export interface Attempt {
  id: string;
  questionId: string;
  answeredAt: string;
  selectedAnswer: number;
  correct: boolean;
  confidence: Confidence;
  elapsedSeconds: number;
  mode: QuizMode;
}

export interface ReviewState {
  questionId: string;
  stability: number;
  difficulty: number;
  dueAt: string;
  lapses: number;
  consecutiveCorrect: number;
  note?: string;
}

export interface QuestionStats {
  attempts: number;
  correct: number;
  wrongRate: number;
  lastAnsweredAt?: string;
}
