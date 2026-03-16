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
  title: "Vigilia — 달빛 아래 루틴을 지키는 곳",
  description: "작은 습관이 쌓여 큰 변화가 됩니다. AI 루틴 코치와 함께 나만의 루틴을 만들어가세요.",
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
