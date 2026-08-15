"use client";

import { useRef, useState } from "react";
import { db } from "@/lib/db";
import type { Attempt, Question, ReviewState } from "@/lib/types";

interface Backup {
  schemaVersion: 1;
  exportedAt: string;
  questions: Question[];
  attempts: Attempt[];
  reviewStates: ReviewState[];
}

export default function DataPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  async function exportData() {
    const [questions, attempts, reviewStates] = await Promise.all([db.questions.toArray(), db.attempts.toArray(), db.reviewStates.toArray()]);
    const backup: Backup = { schemaVersion: 1, exportedAt: new Date().toISOString(), questions, attempts, reviewStates };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shindanshi-sprint-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("バックアップを書き出しました。");
  }

  async function importData(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isBackup(parsed)) throw new Error("形式が一致しません");
      if (!window.confirm("現在の端末データを、このバックアップで置き換えます。続けますか？")) return;
      await db.transaction("rw", db.questions, db.attempts, db.reviewStates, async () => {
        await Promise.all([db.questions.clear(), db.attempts.clear(), db.reviewStates.clear()]);
        await db.questions.bulkPut(parsed.questions);
        await db.attempts.bulkPut(parsed.attempts);
        await db.reviewStates.bulkPut(parsed.reviewStates);
      });
      setMessage(`復元しました（問題 ${parsed.questions.length}件、履歴 ${parsed.attempts.length}件）。`);
    } catch (error) {
      setMessage(`読み込めませんでした: ${error instanceof Error ? error.message : "不明なエラー"}`);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return <section className="mx-auto max-w-3xl"><p className="eyebrow">OFFLINE DATA</p><h1 className="mt-2 text-3xl font-black">学習データ</h1><p className="mt-2 text-[#63766f]">データはこの端末のIndexedDBに保存されます。機種変更や定期保全のため、JSONバックアップを保存してください。</p><div className="mt-7 grid gap-4 md:grid-cols-2"><div className="card p-6"><span className="text-3xl">↓</span><h2 className="mt-3 text-lg font-black">エクスポート</h2><p className="mt-2 text-sm leading-6 text-[#63766f]">問題、回答履歴、復習状態、自分のメモを1ファイルにまとめます。</p><button onClick={() => void exportData()} className="focus-ring mt-5 w-full rounded-xl bg-[#153a32] p-3 font-black text-white">JSONを書き出す</button></div><div className="card p-6"><span className="text-3xl">↑</span><h2 className="mt-3 text-lg font-black">インポート</h2><p className="mt-2 text-sm leading-6 text-[#63766f]">このアプリから書き出したJSONで、現在の端末データを置き換えます。</p><input ref={fileRef} type="file" accept="application/json,.json" onChange={(e) => { const file = e.target.files?.[0]; if (file) void importData(file); }} className="focus-ring mt-5 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[#d6f05d] file:px-4 file:py-3 file:font-black file:text-[#153a32]" /></div></div>{message && <p className="mt-4 rounded-xl bg-white p-4 text-sm" role="status">{message}</p>}<aside className="mt-6 rounded-xl border border-[#e5d69a] bg-[#fff9df] p-4 text-sm leading-6"><b>問題データの取り扱い</b><br />市販教材を無断で複製せず、オリジナル問題、利用許諾を得たデータ、再利用条件が明確な資料のみを使ってください。</aside></section>;
}

function isBackup(value: unknown): value is Backup {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Backup>;
  return candidate.schemaVersion === 1 && Array.isArray(candidate.questions) && Array.isArray(candidate.attempts) && Array.isArray(candidate.reviewStates);
}
