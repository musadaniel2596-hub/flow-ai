import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flow AI — Smart Code Debugger",
  description:
    "AI-powered code debugger that detects errors, highlights issues, and provides instant fixes. Paste code or scan a screenshot.",
  keywords: ["code debugger", "AI", "error detection", "code analysis", "programming"],
  authors: [{ name: "Flow AI" }],
  themeColor: "#0a0e1a",
  openGraph: {
    title: "Flow AI — Smart Code Debugger",
    description: "AI-powered code error detection and fixing",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
