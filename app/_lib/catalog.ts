// app/_lib/catalog.ts
export type PlatformType = "instagram" | "youtube" | "tiktok";
export type GoalType = "awareness" | "sales" | "traffic";

export type AskAnswers = {
  goal: GoalType;
  platform: PlatformType;
  budget: number;
  needFastDelivery: boolean;
  verifiedOnly: boolean;
};

export type AdProduct = {
  id: string;
  title: string;
  platform: PlatformType;
  goal: GoalType;
  price: number;
  etaDays: number;
  verified: boolean;
  minBudget: number;
  sellerName: string;
};

export const Catalog: AdProduct[] = [
  {
    id: "P1",
    title: "릴스 기본 패키지 (1회 업로드 + 7일 유지)",
    platform: "instagram",
    goal: "awareness",
    price: 120000,
    etaDays: 2,
    verified: true,
    minBudget: 100000,
    sellerName: "크리에이터A",
  },
  {
    id: "P2",
    title: "릴스 퍼포먼스 패키지 (2회 업로드 + 핀 고정 3일)",
    platform: "instagram",
    goal: "sales",
    price: 250000,
    etaDays: 3,
    verified: true,
    minBudget: 200000,
    sellerName: "스튜디오B",
  },
  {
    id: "P3",
    title: "쇼츠 빠른 집행 (48시간 내 업로드)",
    platform: "youtube",
    goal: "traffic",
    price: 180000,
    etaDays: 1,
    verified: false,
    minBudget: 150000,
    sellerName: "채널C",
  },
  {
    id: "P4",
    title: "틱톡 바이럴 패키지 (트렌드 사운드 + 1회)",
    platform: "tiktok",
    goal: "awareness",
    price: 160000,
    etaDays: 2,
    verified: true,
    minBudget: 150000,
    sellerName: "크리에이터D",
  },
  {
    id: "P5",
    title: "쇼츠 판매전환 패키지 (CTA + 링크고정 가이드)",
    platform: "youtube",
    goal: "sales",
    price: 300000,
    etaDays: 4,
    verified: true,
    minBudget: 250000,
    sellerName: "에이전시E",
  },
];

export function money(v: number) {
  return `${v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
}

export function goalLabel(g: GoalType) {
  return g === "awareness" ? "인지도" : g === "sales" ? "매출" : "유입";
}

export function platformLabel(p: PlatformType) {
  return p === "instagram" ? "인스타 릴스" : p === "youtube" ? "유튜브 쇼츠" : "틱톡";
}

export function productCode(p: AdProduct) {
  const pf = p.platform === "instagram" ? "IG" : p.platform === "youtube" ? "YT" : "TT";
  const gl = p.goal === "awareness" ? "AW" : p.goal === "sales" ? "SA" : "TR";
  return `SF-${pf}-${gl}-${p.id}`;
}

export function productReason(p: AdProduct, a: AskAnswers) {
  const parts: string[] = [];
  if (a.budget > 0 && p.price <= a.budget) parts.push("예산 내");
  parts.push(`ETA ${p.etaDays}일`);
  if (p.verified) parts.push("Verified");
  return parts.join(" · ");
}

export function recommendProducts(a: AskAnswers) {
  let list = Catalog.filter((p) => {
    if (p.platform !== a.platform) return false;
    if (p.goal !== a.goal) return false;
    if (a.verifiedOnly && !p.verified) return false;
    if (a.budget > 0 && p.minBudget > a.budget) return false;
    return true;
  });

  const score = (p: AdProduct) => {
    let s = 0;
    if (a.budget > 0 && p.price <= a.budget) s += 10;
    if (p.verified) s += 6;
    s += Math.max(0, Math.min(10, 10 - p.etaDays));
    return s;
  };

  list.sort((x, y) => score(y) - score(x));
  if (a.needFastDelivery) list.sort((x, y) => x.etaDays - y.etaDays);
  return list;
}

export function statusLabel(s: string) {
  switch (s) {
    case "created":
      return "주문 생성";
    case "escrow_holding":
      return "결제 완료 · 에스크로 홀딩";
    case "in_progress":
      return "집행 진행중";
    case "delivered":
      return "집행완료 (판매자)";
    case "disputed":
      return "분쟁(이슈 접수)";
    case "buyer_confirmed":
      return "확인완료 (구매자)";
    default:
      return s;
  }
}

// ---- Price Standard (NEW) ----
// 초기엔 간단한 밴드로 시작: 하한 -10%, 상한 +10%
// (나중에 DB 표준단가 테이블로 교체)
export function standardBand(price: number) {
  const low = Math.round(price * 0.9 / 1000) * 1000;
  const rec = Math.round(price / 1000) * 1000;
  const high = Math.round(price * 1.1 / 1000) * 1000;
  return { low, rec, high };
}
