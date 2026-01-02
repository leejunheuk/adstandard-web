"use client";

import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 p-4">
        <div className="text-sm font-bold text-zinc-500">시작하기</div>
        <h1 className="mt-1 text-xl font-black leading-tight">
          어떤 유형이신가요?
        </h1>
        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          광고의기준은 무차별 가격형성을 막기 위해
          <b> 표준 패키지(코드) 기반</b>으로 가격을 정형화합니다.
        </p>
      </section>

      <div className="space-y-3">
        <button
          onClick={() => router.push("/a/start")}
          className="w-full rounded-2xl border border-zinc-200 p-4 text-left"
        >
          <div className="text-lg font-black">1) 광고주</div>
          <div className="mt-1 text-sm text-zinc-600">
            업종/목적/예산/플랫폼 입력 → 표준 상품 추천 → 주문/집행 관리
          </div>
        </button>

        <button
          onClick={() => router.push("/b/start")}
          className="w-full rounded-2xl border border-zinc-200 p-4 text-left"
        >
          <div className="text-lg font-black">2) 광고업체</div>
          <div className="mt-1 text-sm text-zinc-600">
            제공 가능한 표준 패키지 선택 → 상품 등록(뼈대) → 주문 집행
          </div>
        </button>

        <button
          onClick={() => router.push("/c/start")}
          className="w-full rounded-2xl border border-zinc-200 p-4 text-left"
        >
          <div className="text-lg font-black">3) 인플루언서</div>
          <div className="mt-1 text-sm text-zinc-600">
            채널/지표/희망 조건 입력(뼈대) → 표준단가 구간에 매칭
          </div>
        </button>
      </div>
    </div>
  );
}
