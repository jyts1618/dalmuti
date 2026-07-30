import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "달무티",
  description: "AI 플레이어들과 혼자 즐기는 달무티 카드게임",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
