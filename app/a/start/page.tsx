"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiCreateLeadV2 } from "../../_lib/api";

const industries = [
  "요식업",
  "뷰티/미용",
  "의료/병원",
  "헬스/필라테스",
  "학원/교육",
  "이커머스",
  "부동산",
  "여행/숙박",
  "자동차/정비",
  "기타",
];

type GoalType = "awareness" | "sales" | "traffic";
type PlatformType = "instagram" | "naver" | "youtube" | "tiktok";

export default function AdvertiserStartPage() {
  const router = useRouter();

  // ✅ 테스트 익명ID(고정). 나중에 Step3.5에서 자동 생성/저장 가능
  const [anonUserId, setAnonUserId] = useState("user0001");

  const [industry, setIndustry] = useState("요식업");
  const [goal, setGoal] = useState<GoalType>("awareness");
  const [platform, setPlatform] = useState<PlatformType>("instagram");
  const [budget, setBudget] = useState<number>(200000);
  const [needFastDelivery, setNeedFastDelivery] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (saving) return;
    setSaving(true);
    setErr(null);

    try {
      const lead = await apiCreateLeadV2({
        anonUserId,
        industry,
        goal,
        platform,
        budget,
        needFastDelivery,
        verifiedOnly,
        onlyWithinBudget: true,
        sort: "recommended",
        extra: {},
      });

      router.push(`/a/products?leadId=${encodeURIComponent(lead.leadId)}`);
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 p-4">
        <div className="text-sm font-bold text-zinc-500">광고주</div>
        <h1 className="mt-1 text-xl font-black leading-tight">
          표준 단가(표준/하한/상한) 기반으로 추천드립니다
        </h1>
        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          입력값을 바탕으로 서버에서 표준 패키지(코드)만 추천합니다.
          <br />
          추천 리스트에서 <b>표준가/하한/상한</b>을 함께 확인하세요.
        </p>
      </section>

      <div className="rounded-2xl border border-zinc-200 p-4 space-y-3">
        <label className="block text-sm font-black">익명 ID(테스트)</label>
        <input
          value={anonUserId}
          onChange={(e) => setAnonUserId(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 p-3"
        />

        <label className="block text-sm font-black pt-2">업종</label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 p-3"
        >
          {industries.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>

        <div className="pt-2">
          <div className="text-sm font-black">목적</div>
          <div className="mt-2 flex gap-2">
            {(["awareness", "sales", "traffic"] as GoalType[]).map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`flex-1 rounded-xl border p-3 text-sm font-bold ${
                  goal === g ? "border-black bg-black text-white" : "border-zinc-200"
                }`}
              >
                {g === "awareness" ? "인지도" : g === "sales" ? "매출" : "유입"}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <div className="text-sm font-black">플랫폼</div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {(["instagram", "naver", "youtube", "tiktok"] as PlatformType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`rounded-xl border p-3 text-sm font-bold ${
                  platform === p ? "border-black bg-black text-white" : "border-zinc-200"
                }`}
              >
                {p === "instagram"
                  ? "인스타"
                  : p === "naver"
                  ? "네이버"
                  : p === "youtube"
                  ? "유튜브"
                  : "틱톡"}
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            * 현재 서버 카탈로그는 인스타/네이버 중심(테스트용)입니다.
          </div>
        </div>

        <div className="pt-2">
          <div className="text-sm font-black">예산(원)</div>
          <input
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value || 0))}
            inputMode="numeric"
            className="mt-2 w-full rounded-xl border border-zinc-200 p-3"
          />
        </div>

        <div className="pt-2 space-y-2">
          <label className="flex items-center justify-between rounded-xl border border-zinc-200 p-3">
            <div className="text-sm font-bold">빠른 집행 우선</div>
            <input
              type="checkbox"
              checked={needFastDelivery}
              onChange={(e) => setNeedFastDelivery(e.target.checked)}
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-zinc-200 p-3">
            <div className="text-sm font-bold">Verified 판매자만</div>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
            />
          </label>
        </div>

        <button
          onClick={submit}
          disabled={saving}
          className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white font-black disabled:opacity-60"
        >
          {saving ? "추천 생성중..." : "표준 상품 추천 보기"}
        </button>

        {err && <div className="text-sm font-bold text-red-600">실패: {err}</div>}
      </div>
    </div>
  );
}
