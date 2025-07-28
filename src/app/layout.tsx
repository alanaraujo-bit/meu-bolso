import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({
  variable: "--font-geist-sans", // mantemos o nome da variável para não quebrar estilos
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono", // idem aqui
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meu Bolso",
  description: "Aplicativo de controle financeiro pessoal",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
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
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <AuthProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
