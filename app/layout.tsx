import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Twenty · a love letter in four acts",
  description: "A small interactive thing for the birthday girl.",
};

export const viewport: Viewport = {
  themeColor: "#f2e7cf",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="grain antialiased selection:bg-[color:var(--color-oxblood)] selection:text-[color:var(--color-paper)]">
        {children}
      </body>
    </html>
  );
}
