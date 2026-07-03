import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Creator Pilot Pro — Schedule content for YouTube, TikTok & Facebook",
    template: "%s | Creator Pilot Pro",
  },
  description:
    "Schedule and publish content to YouTube, TikTok, and Facebook from one dashboard.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
