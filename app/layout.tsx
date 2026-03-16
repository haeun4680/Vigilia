import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-en",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-ko",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "루틴 — 나만의 습관 기록",
  description: "조용한 새벽, 나를 만드는 루틴",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${notoSansKR.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
