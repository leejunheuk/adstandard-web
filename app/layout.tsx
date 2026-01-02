import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "광고의기준 | adstandard",
  description:
    "업종 → 목적 → 플랫폼 → 예산 기반 표준 광고상품 추천 및 주문·증빙·검수·분쟁까지",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-zinc-100 text-zinc-900">
        <div className="min-h-dvh">
          {/* 앱처럼 보이게: 모바일 기준 가운데 고정 */}
          <div className="mx-auto min-h-dvh w-full max-w-md bg-white border-x border-zinc-200 shadow-sm">
            {/* 상단바 */}
            <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-zinc-200">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="font-black text-lg">광고의기준</div>
                <div className="text-xs font-semibold text-zinc-500">
                  adstandard
                </div>
              </div>
            </header>

            {/* 본문 */}
            <main className="px-4 py-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
