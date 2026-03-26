import type { Metadata } from "next";
import { Theme } from "@carbon/react";
import "@carbon/styles/css/styles.css";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HVACOps - Field Service Management",
  description: "Professional HVAC field service management platform for scheduling, dispatching, invoicing, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plexSans.variable} ${plexMono.variable}`}>
        <Theme theme="g10" className="min-h-screen bg-background text-foreground">
          {children}
          <Toaster position="top-right" richColors />
        </Theme>
      </body>
    </html>
  );
}
