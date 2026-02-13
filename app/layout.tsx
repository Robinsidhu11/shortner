import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Minimal URL Shortener",
  description: "Fast, simple URL shortener powered by Next.js and MongoDB."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

