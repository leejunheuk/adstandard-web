"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiListOrders, OrderDto } from "../_lib/api";
import { money, statusLabel } from "../_lib/catalog";

export default function OrderListPage() {
  const [items, setItems] = useState<OrderDto[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const dto = await apiListOrders();
      setItems(dto.items);
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : String(e));
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-black">주문 목록</h1>
        <button onClick={load} className="rounded-lg border border-zinc-200 px-3 py-1 font-bold">
          새로고침
        </button>
      </div>

      {err && (
        <div className="rounded-2xl border border-zinc-200 p-4 text-sm font-bold text-red-600">
          불러오기 실패: {err}
        </div>
      )}

      {items.length === 0 && !err ? (
        <div className="rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-600">
          주문이 없습니다.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((o) => {
            const title = String(o.product?.title ?? "상품");
            return (
              <Link
                key={o.orderId}
                href={`/order/${o.orderId}`}
                className="block rounded-2xl border border-zinc-200 p-4"
              >
                <div className="font-black">{title}</div>
                <div className="mt-1 text-sm text-zinc-700">
                  주문ID: {o.orderId} · {o.createdAt}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="font-black">{statusLabel(o.status)}</div>
                  <div className="font-black">{money(o.amount)}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
