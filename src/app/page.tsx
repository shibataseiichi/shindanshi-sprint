"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { SUBJECTS } from "@/lib/types";

const DAY = 86_400_000;

export default function DashboardPage() {
  const data = useLiveQuery(async () => {
    const [questions, attempts, reviews] = await Promise.all([db.questions.toArray(), db.attempts.toArray(), db.reviewStates.toArray()]);
    return { questions, attempts, reviews };
  }, []);

  if (!data) return <Loading />;
  const now = new Date();
  const todayKey = dayKey(now);
  const today = data.attempts.filter((a) => dayKey(new Date(a.answeredAt)) === todayKey).length;
  const due = data.reviews.filter((r) => new Date(r.dueAt) <= now && r.consecutiveCorrect < 3).length;
  const questionMap = new Map(data.questions.map((q) => [q.id, q]));
  const subjectStats = SUBJECTS.map((subject) => {
    const attempts = data.attempts.filter((a) => questionMap.get(a.questionId)?.subject === subject);
    const correct = attempts.filter((a) => a.correct).length;
    const accuracy = attempts.length ? Math.round(correct / attempts.length * 100) : null;
    const smoothed = (correct + 1) / (attempts.length + 2);
    const probability = attempts.length ? Math.round(100 / (1 + Math.exp(-(smoothed - .6) * 12))) : null;
    return { subject, attempts: attempts.length, accuracy, probability };
  });
  const risk = subjectStats.filter((s) => s.accuracy !== null && s.accuracy < 40);
  const trend = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now.getTime() - (29 - index) * DAY);
    return { date, count: data.attempts.filter((a) => dayKey(new Date(a.answeredAt)) === dayKey(date)).length };
  });
  const maxCount = Math.max(1, ...trend.map((d) => d.count));

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.25fr_.75fr]">
        <div className="card overflow-hidden bg-[#153a32] p-6 text-white md:p-8">
          <p className="eyebrow !text-[#c7d8d1]">TODAY</p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div><h1 className="text-3xl font-black tracking-tight md:text-4xl">今日も、1問から。</h1><p className="mt-2 text-[#c7d8d1]">弱点を先回りした問題をすぐに始められます。</p></div>
            <div className="shrink-0 text-right"><span className="text-5xl font-black text-[#d6f05d]">{today}</span><span className="ml-1 text-sm">問</span></div>
          </div>
          <Link href="/quiz" className="focus-ring mt-7 inline-flex rounded-xl bg-[#d6f05d] px-5 py-3 font-black text-[#153a32]">今日の演習を始める →</Link>
        </div>
        <div className="card grid grid-cols-2 divide-x divide-[#dce3da] p-6">
          <Metric label="要復習" value={`${due}`} unit="問" note="期限到来" />
          <Metric label="総演習" value={`${data.attempts.length}`} unit="問" note="この端末" />
        </div>
      </section>

      {risk.length > 0 && <section className="rounded-2xl border border-[#e99a87] bg-[#fff0eb] p-4" role="alert"><b>40点未満リスク</b><p className="mt-1 text-sm">{risk.map((s) => s.subject).join("、")} が現在40%未満です。弱点演習を優先しましょう。</p></section>}

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="card p-5 md:p-6">
          <div className="flex items-end justify-between"><div><p className="eyebrow">SUBJECTS</p><h2 className="mt-1 text-xl font-black">7科目の現在地</h2></div><span className="text-xs text-[#63766f]">正答率 / 60点到達確率</span></div>
          <div className="mt-5 space-y-4">
            {subjectStats.map((stat) => <SubjectRow key={stat.subject} {...stat} />)}
          </div>
        </div>
        <div className="card p-5 md:p-6">
          <p className="eyebrow">LAST 30 DAYS</p><h2 className="mt-1 text-xl font-black">学習のリズム</h2>
          <div className="mt-8 flex h-44 items-end gap-1" aria-label="直近30日の演習数">
            {trend.map((point, index) => <div key={dayKey(point.date)} title={`${point.date.toLocaleDateString("ja-JP")}: ${point.count}問`} className={`min-h-1 flex-1 rounded-t ${index === 29 ? "bg-[#d6f05d]" : "bg-[#8eb2a6]"}`} style={{ height: `${Math.max(3, point.count / maxCount * 100)}%` }} />)}
          </div>
          <div className="mt-2 flex justify-between text-xs text-[#63766f]"><span>30日前</span><span>今日</span></div>
        </div>
      </section>
    </div>
  );
}

function SubjectRow({ subject, attempts, accuracy, probability }: { subject: string; attempts: number; accuracy: number | null; probability: number | null }) {
  return <div><div className="flex justify-between gap-3 text-sm"><b>{subject}</b><span className="tabular-nums text-[#53665f]">{accuracy === null ? "未着手" : `${accuracy}% / ${probability}%`}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0eb]"><div className={`h-full rounded-full ${accuracy !== null && accuracy < 40 ? "bg-[#dc6b53]" : "bg-[#3b7565]"}`} style={{ width: `${accuracy ?? 0}%` }} /></div><p className="mt-1 text-right text-[11px] text-[#7a8b85]">{attempts}問</p></div>;
}

function Metric({ label, value, unit, note }: { label: string; value: string; unit: string; note: string }) {
  return <div className="px-3 first:pl-0 last:pr-0"><p className="eyebrow">{label}</p><p className="mt-4"><span className="text-4xl font-black">{value}</span><span className="ml-1 text-sm">{unit}</span></p><p className="mt-2 text-xs text-[#63766f]">{note}</p></div>;
}
function Loading() { return <div className="card animate-pulse p-8 text-[#63766f]">学習データを読み込んでいます…</div>; }
function dayKey(date: Date) { return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`; }
