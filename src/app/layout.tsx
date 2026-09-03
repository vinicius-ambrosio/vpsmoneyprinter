import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Hookify | Criador Viral",
  description: "Gerador de vídeos curtos em massa.",
  icons: {
    icon: "/Hookify - Simbolo Fundo Redondo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-gray-50 text-gray-900 flex min-h-screen`}
        style={{ '--font-sans': 'var(--font-geist-sans)' } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
