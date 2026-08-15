"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { rankCandidates } from "@/lib/adaptive";
import { scheduleReview } from "@/lib/review";
import { SUBJECTS, type Confidence, type Question, type QuestionStats } from "@/lib/types";

type SessionState = "setup" | "active" | "done";

export default function QuizPage() {
  const questions = useLiveQuery(() => db.questions.toArray(), []) ?? [];
  const [subject, setSubject] = useState("all");
  const [topic, setTopic] = useState("all");
  const [year, setYear] = useState("all");
  const [count, setCount] = useState(5);
  const [session, setSession] = useState<SessionState>("setup");
  const [queue, setQueue] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; uncertain: boolean } | null>(null);
  const [startedAt, setStartedAt] = useState(0);

  const topics = useMemo(() => [...new Set(questions.filter((q) => subject === "all" || q.subject === subject).map((q) => q.topic))], [questions, subject]);
  const years = useMemo(() => [...new Set(questions.map((q) => q.year))].sort((a, b) => b - a), [questions]);

  async function startQuiz() {
    const filtered = questions.filter((q) => (subject === "all" || q.subject === subject) && (topic === "all" || q.topic === topic) && (year === "all" || q.year === Number(year)));
    const [attempts, reviews] = await Promise.all([db.attempts.toArray(), db.reviewStates.toArray()]);
    const stats = new Map<string, QuestionStats>();
    for (const attempt of attempts) {
      const current = stats.get(attempt.questionId) ?? { attempts: 0, correct: 0, wrongRate: 0 };
      current.attempts += 1;
      current.correct += Number(attempt.correct);
      current.wrongRate = 1 - current.correct / current.attempts;
      if (!current.lastAnsweredAt || attempt.answeredAt > current.lastAnsweredAt) current.lastAnsweredAt = attempt.answeredAt;
      stats.set(attempt.questionId, current);
    }
    const reviewMap = new Map(reviews.map((r) => [r.questionId, r]));
    const ranked = rankCandidates(filtered.map((question) => ({ question, stats: stats.get(question.id), review: reviewMap.get(question.id) })));
    setQueue(ranked.slice(0, count).map((item) => item.question));
    setIndex(0); setSelected(null); setFeedback(null); setStartedAt(Date.now()); setSession(ranked.length ? "active" : "setup");
  }

  async function answer(confidence: Confidence) {
    if (selected === null || feedback) return;
    const question = queue[index];
    const correct = selected === question.answer;
    const now = new Date();
    const prior = await db.reviewStates.get(question.id);
    const review = scheduleReview(prior, correct, confidence, now, question.id);
    await db.transaction("rw", db.attempts, db.reviewStates, async () => {
      await db.attempts.add({
        id: crypto.randomUUID(), questionId: question.id, answeredAt: now.toISOString(), selectedAnswer: selected,
        correct, confidence, elapsedSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)), mode: "practice",
      });
      await db.reviewStates.put(review);
    });
    setFeedback({ correct, uncertain: confidence <= 2 });
  }

  function next() {
    if (index + 1 >= queue.length) { setSession("done"); return; }
    setIndex((value) => value + 1); setSelected(null); setFeedback(null); setStartedAt(Date.now());
  }

  if (session === "setup") return (
    <section className="mx-auto max-w-3xl">
      <p className="eyebrow">ADAPTIVE QUIZ</p><h1 className="mt-2 text-3xl font-black">いま解くべき問題から。</h1>
      <p className="mt-2 text-[#63766f]">未出題・誤答率・復習期限・最後に解いた日をもとに順番を決めます。</p>
      <div className="card mt-7 p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="科目"><select value={subject} onChange={(e) => { setSubject(e.target.value); setTopic("all"); }} className="focus-ring w-full rounded-xl border border-[#ccd6d1] bg-white p-3"><option value="all">全科目</option>{SUBJECTS.map((value) => <option key={value}>{value}</option>)}</select></Field>
          <Field label="論点"><select value={topic} onChange={(e) => setTopic(e.target.value)} className="focus-ring w-full rounded-xl border border-[#ccd6d1] bg-white p-3"><option value="all">すべて</option>{topics.map((value) => <option key={value}>{value}</option>)}</select></Field>
          <Field label="年度タグ"><select value={year} onChange={(e) => setYear(e.target.value)} className="focus-ring w-full rounded-xl border border-[#ccd6d1] bg-white p-3"><option value="all">すべて</option>{years.map((value) => <option key={value}>{value}</option>)}</select></Field>
        </div>
        <fieldset className="mt-7"><legend className="text-sm font-black">問題数</legend><div className="mt-2 grid grid-cols-4 gap-2">{[1, 5, 10, 20].map((value) => <button key={value} type="button" onClick={() => setCount(value)} className={`focus-ring rounded-xl border p-3 font-black ${count === value ? "border-[#153a32] bg-[#153a32] text-white" : "border-[#ccd6d1]"}`}>{value}問</button>)}</div></fieldset>
        <button type="button" onClick={() => void startQuiz()} disabled={!questions.length} className="focus-ring mt-7 w-full rounded-xl bg-[#d6f05d] p-4 font-black text-[#153a32] disabled:opacity-50" data-testid="start-quiz">{questions.length ? "優先問題でスタート" : "問題を準備しています…"}</button>
      </div>
    </section>
  );

  if (session === "done") return <section className="mx-auto max-w-xl text-center"><div className="card p-8"><span className="text-5xl">✓</span><h1 className="mt-4 text-2xl font-black">セッション完了</h1><p className="mt-2 text-[#63766f]">履歴と次の復習日を端末に保存しました。</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={() => setSession("setup")} className="focus-ring rounded-xl border border-[#ccd6d1] p-3 font-bold">条件を変える</button><button onClick={() => void startQuiz()} className="focus-ring rounded-xl bg-[#153a32] p-3 font-bold text-white">もう一度</button></div></div></section>;

  const question = queue[index];
  return (
    <section className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between text-sm"><span className="font-bold text-[#53665f]">{question.subject} · {question.topic}</span><span className="tabular-nums">{index + 1} / {queue.length}</span></div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#3b7565] transition-all" style={{ width: `${(index + 1) / queue.length * 100}%` }} /></div>
      <article className="card mt-5 p-5 md:p-8" data-testid="quiz-card">
        <div className="flex gap-2 text-xs font-bold text-[#63766f]"><span className="rounded-full bg-[#edf0eb] px-3 py-1">{question.year}</span>{question.tags.map((tag) => <span key={tag} className="rounded-full bg-[#edf0eb] px-3 py-1">{tag}</span>)}</div>
        <h1 className="mt-5 text-lg font-bold leading-8 md:text-xl">{question.question}</h1>
        <div className="mt-6 space-y-3" role="radiogroup" aria-label="選択肢">
          {question.choices.map((choice, choiceIndex) => {
            const isAnswer = feedback && choiceIndex === question.answer;
            const isWrongSelection = feedback && choiceIndex === selected && !feedback.correct;
            return <button key={choice} type="button" role="radio" aria-checked={selected === choiceIndex} disabled={!!feedback} onClick={() => setSelected(choiceIndex)} className={`focus-ring flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${isAnswer ? "border-[#3b7565] bg-[#e8f4ef]" : isWrongSelection ? "border-[#dc6b53] bg-[#fff0eb]" : selected === choiceIndex ? "border-[#153a32] bg-[#edf3f0]" : "border-[#dce3da] hover:border-[#8aa097]"}`} data-testid={`choice-${choiceIndex}`}><span className="grid size-7 shrink-0 place-items-center rounded-full border border-current text-sm font-black">{String.fromCharCode(65 + choiceIndex)}</span><span>{choice}</span></button>;
          })}
        </div>
        {!feedback ? <div className="mt-6 grid grid-cols-[.8fr_1.2fr] gap-3"><button disabled={selected === null} onClick={() => void answer(1)} className="focus-ring rounded-xl border border-[#b7a45f] bg-[#fff9df] p-3 font-black disabled:opacity-40" data-testid="unsure-answer">迷った</button><button disabled={selected === null} onClick={() => void answer(3)} className="focus-ring rounded-xl bg-[#153a32] p-3 font-black text-white disabled:opacity-40" data-testid="submit-answer">回答する</button></div> : <div className={`mt-6 rounded-xl p-5 ${feedback.correct ? "bg-[#e8f4ef]" : "bg-[#fff0eb]"}`} data-testid="feedback"><p className="font-black">{feedback.correct ? feedback.uncertain ? "正解。でも復習対象に追加しました" : "正解！" : "不正解。次はここを押さえよう"}</p><p className="mt-2 text-sm leading-6">{question.explanation}</p><button onClick={next} className="focus-ring mt-4 w-full rounded-xl bg-[#153a32] p-3 font-black text-white" data-testid="next-question">{index + 1 === queue.length ? "結果へ" : "次の問題"}</button></div>}
      </article>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="mb-2 block text-sm font-black">{label}</span>{children}</label>; }
