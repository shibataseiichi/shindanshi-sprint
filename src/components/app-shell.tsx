"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { db } from "@/lib/db";
import { SAMPLE_QUESTIONS } from "@/lib/seed";

const links = [
  { href: "/", label: "ホーム", icon: "⌂" },
  { href: "/quiz", label: "演習", icon: "✎" },
  { href: "/notebook", label: "弱点", icon: "◎" },
  { href: "/data", label: "データ", icon: "⇄" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    void db.questions.bulkPut(SAMPLE_QUESTIONS);
  }, []);

  return (
    <div className="min-h-dvh pb-24 md:pb-8">
      <header className="sticky top-0 z-30 border-b border-[#dce3da] bg-[#f5f7f2]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg">
            <span className="grid size-9 place-items-center rounded-xl bg-[#153a32] font-black text-[#d6f05d]">S</span>
            <span><b className="block leading-tight">診断士 Sprint</b><small className="text-[#63766f]">2027 一次・二次</small></span>
          </Link>
          <nav className="hidden gap-2 md:flex" aria-label="メインナビゲーション">
            {links.map((link) => <NavLink key={link.href} {...link} active={pathname === link.href} />)}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">{children}</main>
      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-4 rounded-2xl border border-[#dce3da] bg-white/95 p-1.5 shadow-xl backdrop-blur md:hidden" aria-label="メインナビゲーション">
        {links.map((link) => <NavLink key={link.href} {...link} active={pathname === link.href} />)}
      </nav>
    </div>
  );
}

function NavLink({ href, label, icon, active }: { href: string; label: string; icon: string; active: boolean }) {
  return <Link href={href} className={`focus-ring flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${active ? "bg-[#153a32] text-white" : "text-[#5d716b] hover:bg-[#e9eee7]"}`}><span>{icon}</span>{label}</Link>;
}
