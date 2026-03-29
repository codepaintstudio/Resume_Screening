import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { MainLayout } from "./components/layout/MainLayout";
import { Providers } from "./providers";

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
      <body className="font-sans">
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
