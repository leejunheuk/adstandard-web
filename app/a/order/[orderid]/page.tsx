"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGetOrderV2, OrderV2 } from "../../../_lib/api";

function money(n: any) {
  const v = Number(n || 0);
  return `${v.toLocaleString("ko-KR")}원`;
}

export default function OrderDetailPage() {
  // ✅ Next 16: Client 페이지는 props params 대신 useParams() 사용
  const params = useParams();
  const orderId = String((params as any)?.orderid || "");

  const [order, setOrder] = useState<OrderV2 | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showSellerTest, setShowSellerTest] = useState(false);

  useEffect(() => {
    async function run() {
      if (!orderId) {
        setErr("orderId가 없습니다.");
        setLoading(false);
        return;
      }
      setErr(null);
      setLoading(true);
      try {
        const o = await apiGetOrderV2(orderId);
        setOrder(o);
      } catch (e: any) {
        setErr(e?.message ? String(e.message) : String(e));
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [orderId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-600">
        불러오는 중...
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
        실패: {err}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-600">
        주문이 없습니다.
      </div>
    );
  }

  const snap: any = order.productSnapshot || {};
  const q: any = snap.quote || {};

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-bold text-zinc-500">주문 상세</div>
            <h1 className="mt-1 text-xl font-black leading-tight">
              {snap.title || snap.id || order.productId}
            </h1>
            <div className="mt-1 text-xs text-zinc-500">
              orderId: {order.orderId} · status:{" "}
              <span className="font-bold text-zinc-900">{order.status}</span>
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              code: {snap.code || "-"} · platform: {snap.platform || "-"}
            </div>
          </div>

          <button
            onClick={() => setShowSellerTest((v) => !v)}
            className="shrink-0 rounded-xl border border-zinc-200 px-3 py-2 text-sm font-black"
          >
            판매자 화면(테스트)
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 p-4">
        <div className="font-black">주문 시점 고정 가격(스냅샷)</div>

        <div className="mt-3 rounded-xl border border-zinc-200 p-3 text-sm">
          <div className="flex items-center justify-between">
            <div className="font-black">표준가</div>
            <div className="font-black">{money(q.standardPrice)}</div>
          </div>
          <div className="mt-1 flex items-center justify-between text-zinc-600">
            <div>하한</div>
            <div className="font-semibold">{money(q.floorPrice)}</div>
          </div>
          <div className="mt-1 flex items-center justify-between text-zinc-600">
            <div>상한</div>
            <div className="font-semibold">{money(q.ceilingPrice)}</div>
          </div>
        </div>

        <div className="mt-2 text-xs text-zinc-500">
          근거(고정): {(q.reasons || []).slice(0, 3).join(" / ")}
          {(q.reasons || []).length > 3 ? " ..." : ""}
        </div>
      </section>

      {!showSellerTest ? (
        <section className="rounded-2xl border border-zinc-200 p-4">
          <div className="font-black">구매자 화면(기본)</div>
          <div className="mt-2 text-sm text-zinc-600 leading-relaxed">
            테스트 런칭용 최소 UX입니다. <br />
            Step 4 이후에 증빙/검수/이슈 플로우를 화면으로 확장합니다.
          </div>
          <div className="mt-3 text-xs text-zinc-500">
            buyerVerdict: {String(order.buyerVerdict)} / adminVerdict:{" "}
            {String(order.adminVerdict)}
          </div>
          {order.adminMemo && (
            <div className="mt-2 text-xs font-bold text-zinc-700">
              운영자 메모: {order.adminMemo}
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-2xl border border-zinc-200 p-4">
          <div className="font-black">판매자 화면(테스트)</div>
          <div className="mt-2 text-sm text-zinc-600 leading-relaxed">
            판매자 UX는 Step 4/집행 화면에서 분리합니다. <br />
            현재는 토글로만 노출합니다.
          </div>
          <div className="mt-3 text-xs text-zinc-500">
            evidence count: {(order.evidence || []).length}
          </div>
        </section>
      )}
    </div>
  );
}
