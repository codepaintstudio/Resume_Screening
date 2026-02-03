import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { MainLayout } from "./components/layout/MainLayout";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "码绘工作室 - 人才管理系统",
  description: "内部专用的招新管理平台",
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
