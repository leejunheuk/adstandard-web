"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiHealthV2, HealthV2 } from "./_lib/api";

export default function HomePage() {
  const [health, setHealth] = useState<HealthV2 | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function ping() {
    setHealth(null);
    setErr(null);
    try {
      const h = await apiHealthV2();
      setHealth(h);
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : String(e));
    }
  }

  useEffect(() => {
    ping();
  }, []);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 p-4">
        <h1 className="text-xl font-black leading-tight">
          업종 → 목적 → 플랫폼 → 예산
          <br />
          4가지만 고르면
          <br />
          표준 광고상품을 추천합니다
        </h1>

        <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
          테스트 런칭용 MVP입니다. 추천 카드에서 <b>표준가/하한/상한</b>을 확인하고
          주문 생성까지 이어집니다.
        </p>

        <div className="mt-4 rounded-xl border border-zinc-200 p-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-bold">서버 연결</div>
            <button
              onClick={ping}
              className="rounded-lg border border-zinc-200 px-3 py-1 font-semibold"
            >
              새로고침
            </button>
          </div>

          <div className="mt-2">
            {health && (
              <div className="text-emerald-700 font-bold">
                OK · {health.status} · {health.version || "step2"} · {health.db}
              </div>
            )}
            {err && <div className="text-red-600 font-bold">오류: {err}</div>}
            {!health && !err && <div className="text-zinc-500">확인중...</div>}
          </div>
        </div>

        <Link
          href="/onboarding"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-white font-bold"
        >
          추천 시작하기
        </Link>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/a/start"
          className="rounded-xl border border-zinc-200 p-4 text-center font-bold"
        >
          추천 퍼널
        </Link>
        <Link
          href="/order"
          className="rounded-xl border border-zinc-200 p-4 text-center font-bold"
        >
          주문 목록
        </Link>
      </div>
    </div>
  );
}
