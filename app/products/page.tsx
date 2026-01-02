export const dynamic = "force-dynamic";

import Link from "next/link";

export default function ProductsLanding() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-zinc-200 p-4">
        <div className="text-sm font-bold text-zinc-500">안내</div>
        <h1 className="mt-1 text-xl font-black leading-tight">
          이 페이지는 현재 테스트에서 사용하지 않습니다.
        </h1>
        <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
          테스트 런칭 플로우는 아래에서 진행해주세요.
          <br />
          <b>/onboarding → /a/start → /a/products → /a/order</b>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/onboarding"
            className="rounded-xl bg-black px-4 py-3 text-center text-white font-black"
          >
            온보딩
          </Link>
          <Link
            href="/a/start"
            className="rounded-xl border border-zinc-200 px-4 py-3 text-center font-black"
          >
            추천 시작
          </Link>
        </div>
      </section>
    </div>
  );
}
