"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { apiAdminResolve, apiGetOrder, OrderDto } from "../../../_lib/api";
import { money, statusLabel } from "../../../_lib/catalog";

export default function AdminOrderDetail() {
  const pathname = usePathname();
  const orderId = useMemo(() => (pathname.split("/").filter(Boolean).pop() || ""), [pathname]);

  const [o, setO] = useState<OrderDto | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [note, setNote] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);

  async function load() {
    setErr(null);
    try {
      const data = await apiGetOrder(orderId);
      setO(data);
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : String(e));
    }
  }

  useEffect(() => { if (orderId) load(); }, [orderId]);

  async function resolve(result: string) {
    if (acting) return;
    setActing(true);
    try {
      const data = await apiAdminResolve(orderId, {
        result,
        refundAmount: result === "refund_partial" ? refundAmount : null,
        note: note.trim() ? note.trim() : null,
      });
      setO(data);
      alert("처리 완료");
    } catch (e: any) {
      alert(e?.message ? String(e.message) : String(e));
    } finally {
      setActing(false);
    }
  }

  if (!orderId) return <div className="text-sm text-zinc-500">라우팅 준비 중...</div>;
  if (err) return <div className="rounded-2xl border p-4 text-sm font-bold text-red-600">오류: {err}</div>;
  if (!o) return <div className="text-sm text-zinc-500">불러오는 중...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-black">관리자 · 분쟁 처리</h1>

      <div className="rounded-2xl border p-4">
        <div className="font-black">{String(o.product?.title ?? "상품")}</div>
        <div className="mt-1 text-sm text-zinc-700">주문ID: {o.orderId}</div>
        <div className="mt-1 text-sm text-zinc-700">금액: {money(o.amount)}</div>
        <div className="mt-2 font-black">상태: {statusLabel(o.status)}</div>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="font-black">이슈 내용</div>
        {o.dispute ? (
          <div className="mt-2 text-sm space-y-1">
            <div className="font-bold text-red-600">사유: {o.dispute.reason}</div>
            <div className="font-bold text-red-600">요청: {o.dispute.requestType}</div>
            {o.dispute.note ? <div>메모: {o.dispute.note}</div> : null}
          </div>
        ) : (
          <div className="mt-2 text-sm text-zinc-600">분쟁 정보가 없습니다.</div>
        )}
      </div>

      <div className="rounded-2xl border p-4 space-y-2">
        <div className="font-black">처리 메모(선택)</div>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border p-3" placeholder="운영자 판단 근거/안내 문구" />

        <div className="font-black mt-2">부분환불 금액(선택)</div>
        <input value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value || 0))} className="w-full rounded-xl border p-3" inputMode="numeric" />
      </div>

      <div className="rounded-2xl border p-4 space-y-2">
        <div className="font-black">처리 버튼</div>
        <button disabled={acting} onClick={() => resolve("rerun")} className="w-full rounded-xl bg-black p-3 text-white font-bold disabled:opacity-60">
          재집행 승인
        </button>
        <button disabled={acting} onClick={() => resolve("refund_partial")} className="w-full rounded-xl border p-3 font-bold disabled:opacity-60">
          부분환불 승인
        </button>
        <button disabled={acting} onClick={() => resolve("refund_full")} className="w-full rounded-xl border p-3 font-bold disabled:opacity-60">
          전액환불 승인
        </button>
        <button disabled={acting} onClick={() => resolve("reject")} className="w-full rounded-xl border p-3 font-bold disabled:opacity-60">
          이슈 기각(반려)
        </button>
      </div>

      <button onClick={load} className="w-full rounded-xl border p-3 font-bold">새로고침</button>
    </div>
  );
}
