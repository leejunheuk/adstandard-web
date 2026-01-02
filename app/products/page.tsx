"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Catalog,
  AskAnswers,
  productCode,
  productReason,
  money,
  goalLabel,
  platformLabel,
  recommendProducts,
} from "../_lib/catalog";

export default function ProductsPage() {
  const sp = useSearchParams();

  const leadId = sp.get("leadId") || "";
  const industry = sp.get("industry") || "요식업";
  const goal = (sp.get("goal") || "awareness") as any;
  const platform = (sp.get("platform") || "instagram") as any;
  const budget = Number(sp.get("budget") || 0);
  const needFastDelivery = sp.get("needFastDelivery") === "1";
  const verifiedOnly = sp.get("verifiedOnly") === "1";

  const answers: AskAnswers = {
    goal,
    platform,
    budget,
    needFastDelivery,
    verifiedOnly,
  };

  const list = useMemo(() => recommendProducts(answers), [sp.toString()]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 p-4">
        <div className="font-black">추천 조건</div>
        <div className="mt-1 text-sm text-zinc-700">
          {industry} · {goalLabel(goal)} · {platformLabel(platform)} · 예산 {money(budget)}
        </div>
        {leadId && <div className="mt-1 text-xs text-zinc-500">Lead: {leadId}</div>}
      </div>

      {list.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-600">
          조건에 맞는 상품이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}?${new URLSearchParams({
                leadId,
                industry,
                goal: String(goal),
                platform: String(platform),
                budget: String(budget),
                needFastDelivery: needFastDelivery ? "1" : "0",
                verifiedOnly: verifiedOnly ? "1" : "0",
              }).toString()}`}
              className="block rounded-2xl border border-zinc-200 p-4"
            >
              <div className="font-black">{p.title}</div>
              <div className="mt-1 text-sm text-zinc-700">
                {productCode(p)} · {productReason(p, answers)}
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="font-black">{money(p.price)}</div>
                <div className="text-sm text-zinc-600">ETA {p.etaDays}일</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
