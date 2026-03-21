import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contracts CRM",
  description: "Договоры аренды",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          margin: 0,
          background: "#f9fafb",
          color: "#111827",
        }}
      >
        {/* 🔝 Верхнее меню */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            background: "white",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              maxWidth: 1400,
              margin: "0 auto",
              padding: "14px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            {/* Логотип */}
            <Link
              href="/"
              style={{
                textDecoration: "none",
                fontWeight: 900,
                fontSize: 20,
                color: "#111827",
              }}
            >
              Contracts CRM
            </Link>

            {/* Навигация */}
            <Navbar />
          </div>
        </header>

        {/* Контент */}
        <div>{children}</div>
      </body>
    </html>
  );
}