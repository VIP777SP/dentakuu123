import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "アルティメット電卓",
  description: "世界最強の電卓アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
