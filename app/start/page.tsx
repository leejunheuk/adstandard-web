"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiCreateLead } from "../_lib/api";
import {
  AskAnswers,
  GoalType,
  PlatformType,
  recommendProducts,
} from "../_lib/catalog";

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

export default function StartPage() {
  const router = useRouter();

  const [industry, setIndustry] = useState<string>("요식업");
  const [goal, setGoal] = useState<GoalType>("awareness");
  const [platform, setPlatform] = useState<PlatformType>("instagram");
  const [budget, setBudget] = useState<number>(200000);
  const [needFastDelivery, setNeedFastDelivery] = useState<boolean>(false);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const answers: AskAnswers = useMemo(
    () => ({ goal, platform, budget, needFastDelivery, verifiedOnly }),
    [goal, platform, budget, needFastDelivery, verifiedOnly]
  );

  const recommended = useMemo(() => recommendProducts(answers), [answers]);

  async function onSubmit() {
    if (saving) return;
    setErr(null);
    setSaving(true);
    try {
      const recIds = recommended.map((p) => p.id);
      const lead = await apiCreateLead({
        industry,
        goal,
        platform,
        budget,
        recommendedProductIds: recIds,
      });

      // 추천 결과 페이지로 이동 (리드ID/입력값을 쿼리로 넘김)
      const q = new URLSearchParams({
        leadId: lead.leadId,
        industry,
        goal,
        platform,
        budget: String(budget),
        needFastDelivery: needFastDelivery ? "1" : "0",
        verifiedOnly: verifiedOnly ? "1" : "0",
      }).toString();

      router.push(`/products?${q}`);
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black">추천 시작</h1>

      <div className="rounded-2xl border border-zinc-200 p-4 space-y-3">
        <label className="block text-sm font-black">업종</label>
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
          <div className="mt-2 flex gap-2">
            {(["instagram", "youtube", "tiktok"] as PlatformType[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`flex-1 rounded-xl border p-3 text-sm font-bold ${
                  platform === p ? "border-black bg-black text-white" : "border-zinc-200"
                }`}
              >
                {p === "instagram" ? "인스타" : p === "youtube" ? "유튜브" : "틱톡"}
              </button>
            ))}
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
          onClick={onSubmit}
          disabled={saving}
          className="mt-2 w-full rounded-xl bg-black px-4 py-3 text-white font-black disabled:opacity-60"
        >
          {saving ? "저장/추천중..." : `추천 보기 (예상 ${recommended.length}개)`}
        </button>

        {err && <div className="text-sm font-bold text-red-600">리드 저장 실패: {err}</div>}
      </div>
    </div>
  );
}
