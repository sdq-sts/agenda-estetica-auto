import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthGuard } from "@/components/auth-guard";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Agenda Estética Auto",
  description: "Sistema de Agendamento para Estética Automotiva",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} antialiased`}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
