"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiCreateOrderV2, apiGetAProductsV2, ProductCardV2 } from "../../_lib/api";

function money(n: any) {
  const v = Number(n || 0);
  return `${v.toLocaleString("ko-KR")}원`;
}

export default function AdvertiserProductsPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const leadId = sp.get("leadId") || "";
  const anonUserId = "user0001"; // Step3: 테스트 고정(원하면 Step3.5에서 lead에서 읽도록 확장)

  const [items, setItems] = useState<ProductCardV2[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      if (!leadId) {
        setErr("leadId가 없습니다. /a/start에서 다시 진행해주세요.");
        setLoading(false);
        return;
      }
      setErr(null);
      setLoading(true);
      try {
        const res = await apiGetAProductsV2(leadId);
        setItems(res.items || []);
      } catch (e: any) {
        setErr(e?.message ? String(e.message) : String(e));
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [leadId]);

  async function selectProduct(productId: string) {
    try {
      const order = await apiCreateOrderV2({
        anonUserId,
        leadId,
        productId,
        productSnapshot: {},
        payload: {},
      });
      router.push(`/a/order/${encodeURIComponent(order.orderId)}`);
    } catch (e: any) {
      alert(e?.message ? String(e.message) : String(e));
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-zinc-200 p-4">
        <div className="font-black">추천 상품(광고주)</div>
        <div className="mt-1 text-xs text-zinc-500">Lead: {leadId || "-"}</div>
        <div className="mt-2 text-xs text-zinc-500">
          ※ 가격 정형화를 위해 표준가/하한/상한을 함께 제공합니다.
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-600">
          불러오는 중...
        </div>
      )}

      {err && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          실패: {err}
        </div>
      )}

      {!loading && !err && items.length === 0 && (
        <div className="rounded-2xl border border-zinc-200 p-6 text-center text-sm text-zinc-600">
          추천 결과가 없습니다.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <div className="space-y-3">
          {items.map((it) => {
            const q = it.quote || ({} as any);
            const eligible = q.eligible !== false;

            return (
              <div
                key={it.id}
                className={`block rounded-2xl border border-zinc-200 p-4 ${eligible ? "" : "opacity-70"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black">{it.title}</div>
                    <div className="mt-1 text-sm text-zinc-700">
                      {it.code} · {it.platform} · {it.conditionsSummary}
                    </div>
                    {it.summary && (
                      <div className="mt-1 text-xs text-zinc-500">{it.summary}</div>
                    )}
                  </div>

                  <button
                    onClick={() => selectProduct(it.id)}
                    className="shrink-0 rounded-xl bg-black px-4 py-2 text-white font-black"
                  >
                    선택
                  </button>
                </div>

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
                  근거: {(q.reasons || []).slice(0, 2).join(" / ")}
                  {(q.reasons || []).length > 2 ? " ..." : ""}
                </div>

                {!eligible && (
                  <div className="mt-2 text-xs font-bold text-red-600">
                    예산 초과(eligible=false) — 테스트용 표시
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
