"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Attempt, Question, ReviewState } from "@/lib/types";

interface MistakeItem { question: Question; review?: ReviewState; attempts: Attempt[]; reason: string; }

export default function NotebookPage() {
  const data = useLiveQuery(async () => {
    const [questions, attempts, reviews] = await Promise.all([db.questions.toArray(), db.attempts.toArray(), db.reviewStates.toArray()]);
    const reviewMap = new Map(reviews.map((r) => [r.questionId, r]));
    return questions.flatMap<MistakeItem>((question) => {
      const history = attempts.filter((a) => a.questionId === question.id).sort((a, b) => b.answeredAt.localeCompare(a.answeredAt));
      const review = reviewMap.get(question.id);
      if (!history.length || (review?.consecutiveCorrect ?? 0) >= 3) return [];
      const wrong = history.some((a) => !a.correct);
      const unsure = history.some((a) => a.confidence <= 2);
      if (!wrong && !unsure) return [];
      return [{ question, review, attempts: history, reason: wrong && unsure ? "誤答・迷い" : wrong ? "誤答" : "迷い" }];
    });
  }, []);

  if (!data) return <div className="card p-8 text-[#63766f]">弱点データを読み込んでいます…</div>;

  return (
    <section>
      <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">MISTAKE NOTEBOOK</p><h1 className="mt-2 text-3xl font-black">弱点ノート</h1><p className="mt-2 text-[#63766f]">3回連続で正解すると、自動で卒業します。</p></div><span className="rounded-full bg-[#153a32] px-4 py-2 text-sm font-black text-white">{data.length}問</span></div>
      {data.length === 0 ? <div className="card mt-7 p-8 text-center"><span className="text-4xl">◎</span><h2 className="mt-3 font-black">弱点はまだありません</h2><p className="mt-2 text-sm text-[#63766f]">演習で間違えた問題や「迷った」問題がここに集まります。</p></div> : <div className="mt-7 grid gap-4">{data.map((item) => <NotebookCard key={item.question.id} item={item} />)}</div>}
    </section>
  );
}

function NotebookCard({ item }: { item: MistakeItem }) {
  const [note, setNote] = useState(item.review?.note ?? "");
  const [saved, setSaved] = useState(false);
  const latest = item.attempts[0];
  async function save() {
    if (!item.review) return;
    await db.reviewStates.update(item.question.id, { note });
    setSaved(true); window.setTimeout(() => setSaved(false), 1500);
  }
  return <article className="card p-5 md:p-6"><div className="flex flex-wrap items-center gap-2 text-xs font-bold"><span className="rounded-full bg-[#fff0eb] px-3 py-1 text-[#a43f2c]">{item.reason}</span><span className="text-[#63766f]">{item.question.subject} · {item.question.topic}</span><span className="ml-auto text-[#63766f]">連続正解 {item.review?.consecutiveCorrect ?? 0}/3</span></div><h2 className="mt-4 font-bold leading-7">{item.question.question}</h2><details className="mt-4 rounded-xl bg-[#f3f6f1] p-4"><summary className="cursor-pointer font-bold">解答と解説</summary><p className="mt-3 text-sm"><b>正解: {String.fromCharCode(65 + item.question.answer)}</b> {item.question.choices[item.question.answer]}</p><p className="mt-2 text-sm leading-6 text-[#53665f]">{item.question.explanation}</p></details><label className="mt-4 block"><span className="text-sm font-black">自分のメモ</span><textarea value={note} onChange={(e) => { setNote(e.target.value); setSaved(false); }} rows={3} placeholder="間違えた理由、覚え方、次に確認すること" className="focus-ring mt-2 w-full resize-y rounded-xl border border-[#ccd6d1] p-3" /></label><div className="mt-3 flex items-center justify-between"><span className="text-xs text-[#63766f]">最終回答: {new Date(latest.answeredAt).toLocaleDateString("ja-JP")}</span><button onClick={() => void save()} disabled={!item.review} className="focus-ring rounded-lg bg-[#153a32] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">{saved ? "保存済み ✓" : "メモを保存"}</button></div></article>;
}
