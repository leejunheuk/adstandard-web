// app/_lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://192.168.0.14:8000";

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * ✅ 이 프로젝트는 서버가 2종류 응답을 섞어 쓸 수 있습니다.
 * - (Step2 FastAPI) { ok: true, data: ... } / { ok:false, error:{message} }
 * - (과거/다른 서버) 일반 JSON 또는 FastAPI {"detail": "..."}
 *
 * 그래서 "가능하면 래핑을 풀고", 아니면 원본 JSON을 그대로 반환합니다.
 */
async function okJson<T>(res: Response): Promise<T> {
  const j = await res.json().catch(() => null);

  if (res.ok) {
    // Step2 래핑 응답이면 data를 풀어서 반환
    if (j && typeof j === "object" && "ok" in j && "data" in j) {
      if ((j as any).ok === true) return (j as any).data as T;
      const msg = (j as any)?.error?.message || "요청 실패";
      throw new ApiError(String(msg));
    }
    // 일반 응답이면 그대로 반환
    return j as T;
  }

  // 에러 응답 처리
  let msg = `HTTP ${res.status}`;
  if (j && typeof j === "object") {
    msg =
      (j as any)?.error?.message ||
      (j as any)?.detail ||
      msg;
  }
  throw new ApiError(String(msg));
}

// --------------------------------------------------
// ✅ 레거시 DTO/함수 (기존 페이지 컴파일 유지용)
// --------------------------------------------------
export type LeadDto = {
  leadId: string;
  industry: string;
  goal: string;
  platform: string;
  budget: number;
  recommendedProductIds: string[];
  createdAt: string;
};

export type ProofDto = { url: string; note?: string | null; submittedAt: string };

export type DisputeDto = {
  reason: string;
  requestType: string;
  note?: string | null;
  createdAt: string;
};

export type OrderDto = {
  orderId: string;
  status: string;
  escrowHold: boolean;
  amount: number;
  product: Record<string, any>;
  answers: Record<string, any>;
  proof: ProofDto | null;
  buyerChecklist: { contentChecked: boolean; conditionChecked: boolean };
  dispute: DisputeDto | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderListDto = { items: OrderDto[]; count: number };

export async function apiHealth() {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  // 레거시 페이지가 {ok, ts}를 기대할 수 있어도 일단 그대로 반환
  return okJson<any>(res);
}

export async function apiCreateLead(body: {
  industry: string;
  goal: string;
  platform: string;
  budget: number;
  recommendedProductIds: string[];
}) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return okJson<LeadDto>(res);
}

export async function apiCreateOrder(body: {
  product: Record<string, any>;
  answers: Record<string, any>;
  amount: number;
}) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return okJson<OrderDto>(res);
}

export async function apiListOrders() {
  const res = await fetch(`${API_BASE}/orders`, { cache: "no-store" });
  return okJson<OrderListDto>(res);
}

export async function apiGetOrder(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}`, { cache: "no-store" });
  return okJson<OrderDto>(res);
}

export async function apiPay(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/pay`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ method: "card" }),
  });
  return okJson<OrderDto>(res);
}

export async function apiSellerStart(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/seller`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start" }),
  });
  return okJson<OrderDto>(res);
}

export async function apiSubmitProof(orderId: string, body: { url: string; note?: string | null }) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/proof`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return okJson<OrderDto>(res);
}

export async function apiSellerDelivered(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/seller`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delivered" }),
  });
  return okJson<OrderDto>(res);
}

export async function apiBuyerConfirm(orderId: string, body: { contentChecked: boolean; conditionChecked: boolean }) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/buyer/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return okJson<OrderDto>(res);
}

export async function apiCreateDispute(orderId: string, body: { reason: string; requestType: string; note?: string | null }) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/dispute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return okJson<OrderDto>(res);
}

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || "dev-admin-key";

export async function apiAdminListDisputes() {
  // 레거시 코드가 header로 보내던 방식 유지
  const res = await fetch(`${API_BASE}/admin/disputes`, {
    cache: "no-store",
    headers: { "x-admin-key": ADMIN_KEY },
  });
  return okJson<{ items: OrderDto[]; count: number }>(res);
}

export async function apiAdminResolve(orderId: string, body: { result: string; refundAmount?: number | null; note?: string | null }) {
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-key": ADMIN_KEY },
    body: JSON.stringify(body),
  });
  return okJson<OrderDto>(res);
}

// --------------------------------------------------
// ✅ Step2/Step3(V2) DTO/함수 (현재 FastAPI main.py 기준)
// --------------------------------------------------
export type HealthV2 = {
  status: string;
  db: string;
  version?: string;
};

export type LeadV2 = {
  leadId: string;
  createdAtMs: number;
  anonUserId: string;
  industry: string;
  goal: string;
  platform: string;
  budget: number;
  needFastDelivery: boolean;
  verifiedOnly: boolean;
  onlyWithinBudget: boolean;
  sort: string;
  extra: Record<string, any>;
};

export type QuoteV2 = {
  standardPrice: number;
  floorPrice: number;
  ceilingPrice: number;
  eligible: boolean;
  score: number;
  reasons: string[];
  applied: {
    verifiedOnly: boolean;
    needFastDelivery: boolean;
    qty: number;
    durationDays: number;
  };
};

export type ProductCardV2 = {
  id: string;
  title: string;
  summary?: string;
  platform?: string;
  code: string;
  options: Record<string, any>;
  conditionsSummary: string;
  quote: QuoteV2;
  score: number;
  cta: { label: string; action: string; productId: string };
};

export type AProductsV2 = { leadId: string; items: ProductCardV2[] };

export type OrderV2 = {
  orderId: string;
  createdAtMs: number;
  anonUserId: string;
  leadId?: string | null;
  productId: string;
  productSnapshot: Record<string, any>;
  status: string;
  evidence: any[];
  buyerVerdict?: string | null;
  buyerIssue?: string | null;
  adminVerdict?: string | null;
  adminMemo?: string | null;
  payload: Record<string, any>;
};

export async function apiHealthV2() {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  return okJson<HealthV2>(res);
}

export async function apiCreateLeadV2(body: {
  anonUserId: string;
  industry: string;
  goal: string;
  platform: string;
  budget: number;
  needFastDelivery?: boolean;
  verifiedOnly?: boolean;
  onlyWithinBudget?: boolean;
  sort?: string;
  extra?: Record<string, any>;
}) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      needFastDelivery: false,
      verifiedOnly: false,
      onlyWithinBudget: true,
      sort: "recommended",
      extra: {},
      ...body,
    }),
  });
  return okJson<LeadV2>(res);
}

export async function apiGetAProductsV2(leadId: string) {
  const res = await fetch(`${API_BASE}/a/products?leadId=${encodeURIComponent(leadId)}`, {
    cache: "no-store",
  });
  return okJson<AProductsV2>(res);
}

export async function apiCreateOrderV2(body: {
  anonUserId: string;
  leadId?: string | null;
  productId: string;
  productSnapshot?: Record<string, any>;
  payload?: Record<string, any>;
}) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productSnapshot: {},
      payload: {},
      ...body,
    }),
  });
  return okJson<OrderV2>(res);
}

export async function apiGetOrderV2(orderId: string) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`, {
    cache: "no-store",
  });
  return okJson<OrderV2>(res);
}
