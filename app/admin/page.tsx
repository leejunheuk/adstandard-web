"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { API_BASE, ApiError } from "../_lib/api";

type DisputeItem = {
  disputeId: string;
  createdAtMs: number;
  orderId: string;
  anonUserId: string;
  status: "open" | "resolved";
  reason: string;
  evidence?: any[];
  resolution?: {
    resolutionId: string;
    createdAtMs: number;
    result: "reexecute_approved" | "refund_approved" | "rejected";
    memo?: string | null;
  };
};
type ResolutionResult = "reexecute_approved" | "refund_approved" | "rejected";


const ADMIN_KEY =
  process.env.NEXT_PUBLIC_ADMIN_KEY || "dev-admin-key";

function badge(text: string) {
  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs font-black text-zinc-700">
      {text}
    </span>
  );
}

function fmtTime(ms: number) {
  if (!ms) return "-";
  const d = new Date(ms);
  return d.toLocaleString("ko-KR");
}

export default function AdminPage() {
  const [tab, setTab] = useState<"open" | "resolved" | "all">("open");
  const [items, setItems] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const filteredQuery = useMemo(() => {
    if (tab === "all") return "";
    // 서버 스펙: processed=true => resolved만 / processed=false => open만
    return tab === "resolved" ? "&processed=true" : "&processed=false";
  }, [tab]);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const url = `${API_BASE}/admin/disputes?adminKey=${encodeURIComponent(
        ADMIN_KEY
      )}${filteredQuery}`;

      const res = await fetch(url, { cache: "no-store" });
      const j = await res.json().catch(() => null);

      if (!res.ok || !j?.ok) {
        const msg = j?.error?.message || j?.detail || `HTTP ${res.status}`;
        throw new ApiError(String(msg));
      }

      // 서버는 {ok:true, data:[...]} 형태
      setItems((j.data || []) as DisputeItem[]);
    } catch (e: any) {
      setErr(e?.message ? String(e.message) : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function resolve(disputeId: string, result: ResolutionResult) {
    const memo = window.prompt("처리 메모(선택)를 입력하세요. 비워도 됩니다.") || "";

    try {
      const url = `${API_BASE}/admin/disputes/${encodeURIComponent(
        disputeId
      )}/resolve`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminKey: ADMIN_KEY,
          result,
          memo: memo || null,
        }),
      });

      const j = await res.json().catch(() => null);
      if (!res.ok || !j?.ok) {
        const msg = j?.error?.message || j?.detail || `HTTP ${res.status}`;
        throw new ApiError(String(msg));
      }

      // 처리 후 재조회
      await load();
      alert("처리 완료");
    } catch (e: any) {
      alert(e?.message ? String(e.message) : String(e));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 p-4">
        <div className="text-sm font-bold text-zinc-500">운영자(Admin)</div>
        <h1 className="mt-1 text-xl font-black leading-tight">
          분쟁 처리 (최소 UX)
        </h1>
        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          미처리/처리됨 필터로 분쟁을 보고, 재집행/환불/기각을 결정합니다.
          <br />
          처리 메모는 주문 상세에도 노출됩니다.
        </p>

        <div className="mt-4 flex gap-2">
          <TabButton active={tab === "open"} onClick={() => setTab("open")}>
            미처리
          </TabButton>
          <TabButton active={tab === "resolved"} onClick={() => setTab("resolved")}>
            처리됨
          </TabButton>
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>
            전체
          </TabButton>

          <button
            onClick={load}
            className="ml-auto rounded-xl border border-zinc-200 px-3 py-2 text-sm font-black"
          >
            새로고침
          </button>
        </div>

        <div className="mt-2 text-xs text-zinc-500">
          AdminKey는 <b>NEXT_PUBLIC_ADMIN_KEY</b> 또는 기본값 dev-admin-key를 사용합니다.
        </div>
      </section>

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
          분쟁이 없습니다.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <div className="space-y-3">
          {items.map((d) => (
            <div key={d.disputeId} className="rounded-2xl border border-zinc-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {badge(d.status === "open" ? "미처리" : "처리됨")}
                    {badge(fmtTime(d.createdAtMs))}
                  </div>
                  <div className="mt-2 text-sm font-black text-zinc-900">
                    사유: {d.reason}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    disputeId: {d.disputeId}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    orderId:{" "}
                    <Link
                      className="font-bold underline"
                      href={`/a/order/${encodeURIComponent(d.orderId)}`}
                    >
                      {d.orderId}
                    </Link>
                  </div>
                </div>

                {d.status === "open" ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => resolve(d.disputeId, "reexecute_approved")}
                      className="rounded-xl bg-black px-3 py-2 text-sm font-black text-white"
                    >
                      재집행 승인
                    </button>
                    <button
                      onClick={() => resolve(d.disputeId, "refund_approved")}
                      className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-black"
                    >
                      환불 승인
                    </button>
                    <button
                      onClick={() => resolve(d.disputeId, "rejected")}
                      className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-black"
                    >
                      기각
                    </button>
                  </div>
                ) : (
                  <div className="text-right">
                    <div className="text-sm font-black">
                      결과: {labelResult(d?.resolution?.result)}
                    </div>
                    {d?.resolution?.memo && (
                      <div className="mt-1 text-xs text-zinc-600">
                        메모: {d.resolution.memo}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm font-black ${
        active ? "border-black bg-black text-white" : "border-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}

function labelResult(r?: string) {
  if (r === "reexecute_approved") return "재집행 승인";
  if (r === "refund_approved") return "환불 승인";
  if (r === "rejected") return "기각";
  return "-";
}
