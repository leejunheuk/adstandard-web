"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import {
  apiGetOrder,
  apiSellerStart,
  apiSubmitProof,
  apiSellerDelivered,
  apiBuyerConfirm,
  apiCreateDispute,
  OrderDto,
} from "../../_lib/api";
import { money, statusLabel } from "../../_lib/catalog";

export default function OrderDetailPage() {
  const pathname = usePathname();

  // ✅ useParams 대신 URL에서 orderId를 직접 파싱 (가장 안정적)
  const orderId = useMemo(() => {
    // 예: /order/O1767250113243
    const parts = (pathname || "").split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "";
    // 혹시 쿼리스트링/해시가 붙는 경우 방어
    return last.split("?")[0].split("#")[0];
  }, [pathname]);

  const [o, setO] = useState<OrderDto | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [acting, setActing] = useState(false);
  const [sellerView, setSellerView] = useState(true);

  async function load() {
    // ✅ orderId 없을 땐 에러가 아니라 대기
    if (!orderId) return;

    setErr(null);
    try {
      const data = await apiGetOrder(orderId);
      setO(data);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function doAction(fn: () => Promise<OrderDto>) {
    if (acting) return;
    setActing(true);
    try {
      const data = await fn();
      setO(data);
    } catch (e: any) {
      alert(e?.message ?? String(e));
    } finally {
      setActing(false);
    }
  }

  // ✅ 여기서 절대 실패 화면 띄우지 말고, orderId 준비될 때까지 대기
  if (!orderId) {
    return <div className="text-sm text-zinc-500">라우팅 준비 중...</div>;
  }

  if (err) {
    return (
      <div className="rounded-2xl border p-4">
        <div className="font-black text-red-600">불러오기 실패: {err}</div>
        <div className="mt-2 text-xs text-zinc-500">현재 orderId: {orderId}</div>
        <button onClick={load} className="mt-3 w-full rounded-xl border p-3 font-bold">
          다시 시도
        </button>
      </div>
    );
  }

  if (!o) return <div className="text-sm text-zinc-500">불러오는 중...</div>;

  return (
    <div className="space-y-4">
      {/* 역할 토글 */}
      <div className="rounded-2xl border p-3 flex gap-2">
        <button
          onClick={() => setSellerView(true)}
          className={`flex-1 rounded-xl p-2 font-bold ${sellerView ? "bg-black text-white" : "border"}`}
        >
          판매자
        </button>
        <button
          onClick={() => setSellerView(false)}
          className={`flex-1 rounded-xl p-2 font-bold ${!sellerView ? "bg-black text-white" : "border"}`}
        >
          구매자
        </button>
      </div>

      {/* 주문 요약 */}
      <div className="rounded-2xl border p-4">
        <div className="font-black">{String(o.product?.title ?? "상품")}</div>
        <div className="mt-1 text-sm">주문ID: {o.orderId}</div>
        <div className="mt-1 text-sm">금액: {money(o.amount)}</div>
        <div className="mt-2 font-black">상태: {statusLabel(o.status)}</div>
        <div className="mt-1 text-sm text-zinc-600">에스크로: {o.escrowHold ? "holding" : "off"}</div>
      </div>

      {/* 증빙 */}
      <div className="rounded-2xl border p-4">
        <div className="font-black">증빙</div>
        {o.proof ? (
          <div className="mt-2 text-sm space-y-1">
            <div className="font-bold">URL: {o.proof.url}</div>
            {o.proof.note && <div>메모: {o.proof.note}</div>}
            <div className="text-zinc-500">제출: {o.proof.submittedAt}</div>
          </div>
        ) : (
          <div className="mt-2 text-sm text-zinc-600">아직 증빙이 없습니다.</div>
        )}
      </div>

      {/* 액션 */}
      <div className="rounded-2xl border p-4 space-y-2">
        <div className="font-black">액션</div>

        {sellerView ? (
          <>
            {o.status === "escrow_holding" && (
              <button
                disabled={acting}
                onClick={() => doAction(() => apiSellerStart(o.orderId))}
                className="w-full rounded-xl bg-black p-3 text-white font-bold disabled:opacity-60"
              >
                집행 시작
              </button>
            )}

            {o.status === "in_progress" && (
              <>
                <ProofForm
                  disabled={acting}
                  onSubmit={(url, note) => doAction(() => apiSubmitProof(o.orderId, { url, note }))}
                />
                <button
                  disabled={acting || !o.proof}
                  onClick={() => doAction(() => apiSellerDelivered(o.orderId))}
                  className="w-full rounded-xl bg-black p-3 text-white font-bold disabled:opacity-60"
                >
                  집행 완료
                </button>
              </>
            )}

            {o.status === "disputed" && <Hint text="이슈 접수 상태입니다. 운영자 처리 단계입니다." />}
            {o.status === "buyer_confirmed" && <Hint text="구매자 확인완료 상태입니다." />}
          </>
        ) : (
          <>
            {o.status === "delivered" && (
              <>
                <BuyerChecklist
                  disabled={acting}
                  onConfirm={(a, b) =>
                    doAction(() => apiBuyerConfirm(o.orderId, { contentChecked: a, conditionChecked: b }))
                  }
                />
                <DisputeForm
                  disabled={acting}
                  onSubmit={(r, t, n) => doAction(() => apiCreateDispute(o.orderId, { reason: r, requestType: t, note: n }))}
                />
              </>
            )}

            {o.status === "disputed" && <Hint text="이미 이슈가 접수되었습니다. 운영자 처리를 기다립니다." />}
            {o.status === "buyer_confirmed" && <Hint text="이미 확인완료 처리되었습니다." />}
          </>
        )}
      </div>

      <button onClick={load} className="w-full rounded-xl border p-3 font-bold">
        새로고침
      </button>
    </div>
  );
}

function Hint({ text }: { text: string }) {
  return <div className="rounded-xl border p-3 text-sm text-zinc-600">{text}</div>;
}

function ProofForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (url: string, note?: string | null) => void;
}) {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");

  return (
    <div className="space-y-2">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="증빙 URL (https://...)"
        className="w-full rounded-xl border p-3"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="메모(선택)"
        className="w-full rounded-xl border p-3"
      />
      <button
        disabled={disabled || !(url.startsWith("http://") || url.startsWith("https://"))}
        onClick={() => onSubmit(url.trim(), note.trim() ? note.trim() : null)}
        className="w-full rounded-xl border p-3 font-bold disabled:opacity-60"
      >
        증빙 저장
      </button>
    </div>
  );
}

function BuyerChecklist({
  disabled,
  onConfirm,
}: {
  disabled: boolean;
  onConfirm: (a: boolean, b: boolean) => void;
}) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 border rounded-xl p-3">
        <input type="checkbox" checked={a} onChange={(e) => setA(e.target.checked)} />
        콘텐츠 업로드 확인
      </label>
      <label className="flex items-center gap-2 border rounded-xl p-3">
        <input type="checkbox" checked={b} onChange={(e) => setB(e.target.checked)} />
        기간/조건 준수 확인
      </label>
      <button
        disabled={disabled || !a || !b}
        onClick={() => onConfirm(a, b)}
        className="w-full rounded-xl bg-black p-3 text-white font-bold disabled:opacity-60"
      >
        확인 완료
      </button>
    </div>
  );
}

function DisputeForm({
  disabled,
  onSubmit,
}: {
  disabled: boolean;
  onSubmit: (reason: string, type: string, note?: string | null) => void;
}) {
  const reasons = ["미게시/링크 오류", "기간 미준수", "조건 미이행", "성과 불만", "기타"];
  const types = ["재집행 요청", "부분환불 요청", "운영자 중재 요청"];

  const [reason, setReason] = useState(reasons[0]);
  const [type, setType] = useState(types[0]);
  const [note, setNote] = useState("");

  return (
    <div className="space-y-2">
      <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border p-3">
        {reasons.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border p-3">
        {types.map((t) => (
          <option key={t}>{t}</option>
        ))}
      </select>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="메모(선택)"
        className="w-full rounded-xl border p-3"
      />
      <button
        disabled={disabled}
        onClick={() => onSubmit(reason, type, note.trim() ? note.trim() : null)}
        className="w-full rounded-xl border p-3 font-bold"
      >
        이슈 접수
      </button>
    </div>
  );
}
