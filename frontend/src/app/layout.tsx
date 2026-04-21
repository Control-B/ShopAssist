import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@shopify/polaris/build/esm/styles.css";

import { AppProviders } from "@/components/providers/app-providers";

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
  title: "Omniweb AI | Shopify Control Panel",
  description:
    "Embedded Shopify admin for configuring Omniweb AI and syncing merchant context to an external assistant backend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-slate-100 font-sans text-slate-950">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
