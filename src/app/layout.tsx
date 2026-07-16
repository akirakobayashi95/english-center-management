import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const display = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const label = JetBrains_Mono({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "MsMyenEnglish - Quản lý Trung tâm Tiếng Anh",
  description: "Hệ thống quản lý trung tâm dạy tiếng Anh MsMyenEnglish - học sinh, lớp học, điểm danh, hoá đơn, đánh giá.",
  keywords: ["MsMyenEnglish", "Quản lý", "Trung tâm Tiếng Anh", "English Center", "Học sinh", "Điểm danh"],
  authors: [{ name: "MsMyenEnglish" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${label.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}