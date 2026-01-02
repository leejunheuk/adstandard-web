"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGetOrder, apiPay, OrderDto } from "../../_lib/api";
import { money, statusLabel } from "../../_lib/catalog";

export default function CheckoutPage() {
  const params = useParams<{ orderId: string }>();
  const router = useRouter();
  const orderId = params.orderId;

  const [o, setO] = useState<OrderDto | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  async function load() {
    setErr(null);
    try {
      const data = await apiGetOrder(orderId);
      setO(data);
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : String(e));
    }
  }

async function pay() {
  if (paying) return;
  setPaying(true);
  try {
    const data = await apiPay(orderId);
    setO(data);

    // ✅ 응답에 들어있는 orderId로 이동 (가장 안전)
    const oid = data.orderId;
    router.push(`/order/${oid}`);
  } catch (e: any) {
    setErr(e?.message ? String(e.message) : String(e));
  } finally {
    setPaying(false);
  }
}


  useEffect(() => {
    load();
  }, [orderId]);

  if (err) {
    return (
      <div className="rounded-2xl border border-zinc-200 p-4">
        <div className="font-black text-red-600">불러오기 실패: {err}</div>
        <button onClick={load} className="mt-3 w-full rounded-xl border border-zinc-200 p-3 font-bold">
          다시 시도
        </button>
      </div>
    );
  }

  if (!o) return <div className="text-sm text-zinc-500">불러오는 중...</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 p-4">
        <div className="font-black">주문 요약</div>
        <div className="mt-2 text-sm text-zinc-700">주문ID: {o.orderId}</div>
        <div className="text-sm text-zinc-700">금액: {money(o.amount)}</div>
        <div className="mt-2 font-black">상태: {statusLabel(o.status)}</div>
        <div className="mt-1 text-sm text-zinc-600">
          에스크로: {o.escrowHold ? "holding" : "off"}
        </div>
      </div>

      <button
        onClick={pay}
        disabled={paying}
        className="w-full rounded-xl bg-black px-4 py-3 text-white font-black disabled:opacity-60"
      >
        {paying ? "처리중..." : "결제 완료 처리 (holding 시작)"}
      </button>

      {err && <div className="text-sm font-bold text-red-600">{err}</div>}
    </div>
  );
}
