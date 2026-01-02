"use client";

import { useMemo, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { apiCreateOrder } from "../../_lib/api";
import {
  Catalog,
  money,
  productCode,
  platformLabel,
  goalLabel,
  productReason,
  AskAnswers,
} from "../../_lib/catalog";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();

  const id = params.id;
  const p = useMemo(() => Catalog.find((x) => x.id === id), [id]);

  const leadId = sp.get("leadId") || "";
  const industry = sp.get("industry") || "요식업";
  const goal = (sp.get("goal") || "awareness") as any;
  const platform = (sp.get("platform") || "instagram") as any;
  const budget = Number(sp.get("budget") || 0);
  const needFastDelivery = sp.get("needFastDelivery") === "1";
  const verifiedOnly = sp.get("verifiedOnly") === "1";

  const answers: AskAnswers = { goal, platform, budget, needFastDelivery, verifiedOnly };

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function createAndGoCheckout() {
    if (!p) return;
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const order = await apiCreateOrder({
        product: {
          ...p,
          code: productCode(p),
        },
        answers: {
          industry,
          leadId,
          goal,
          platform,
          budget,
          needFastDelivery,
          verifiedOnly,
        },
        amount: p.price,
      });
      router.push(`/checkout/${order.orderId}`);
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (!p) {
    return (
      <div className="rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-600">
        상품을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 p-4">
        <div className="text-lg font-black">{p.title}</div>
        <div className="mt-2 text-sm text-zinc-700">
          {productCode(p)} · {platformLabel(p.platform as any)} · {goalLabel(p.goal as any)}
        </div>
        <div className="mt-2 font-black">
          가격 {money(p.price)} · ETA {p.etaDays}일
        </div>
        <div className="mt-2 text-sm text-zinc-600">추천 근거: {productReason(p as any, answers)}</div>

        <div className="mt-4 text-sm text-zinc-700 whitespace-pre-line">
          {"증빙/검수/분쟁\n- 집행완료 전 URL 증빙 제출 필수\n- 구매자: 확인완료 또는 이슈 신고"}
        </div>
      </div>

      <button
        onClick={createAndGoCheckout}
        disabled={busy}
        className="w-full rounded-xl bg-black px-4 py-3 text-white font-black disabled:opacity-60"
      >
        {busy ? "주문 생성중..." : "결제하기 (주문 생성 → holding)"}
      </button>

      {err && <div className="text-sm font-bold text-red-600">주문 생성 실패: {err}</div>}
    </div>
  );
}
