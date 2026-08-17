import type { Metadata } from "next";
import { Lora, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const ibmMono = IBM_Plex_Mono({
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Scanline",
  description: "The scan that catches what vibe coding leaves behind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${ibmMono.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col font-serif bg-ink text-fog">
        {children}
      </body>
    </html>
  );
}
