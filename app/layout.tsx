import type { Metadata } from "next";
import { Theme } from "@carbon/react";
import "@carbon/styles/css/styles.css";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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
      <head>
        <link
          rel="stylesheet"
          href="https://1.www.s81c.com/common/carbon/plex/sans.css"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://1.www.s81c.com/common/carbon/plex/mono.css"
          crossOrigin="anonymous"
        />
        <style>{`
          :root {
            --font-plex-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            --font-plex-mono: 'IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', monospace;
          }
          body {
            font-family: var(--font-plex-sans);
          }
          code, pre {
            font-family: var(--font-plex-mono);
          }
        `}</style>
      </head>
      <body>
        <Theme theme="g10" className="min-h-screen bg-background text-foreground">
          {children}
          <Toaster position="top-right" richColors />
        </Theme>
      </body>
    </html>
  );
}
