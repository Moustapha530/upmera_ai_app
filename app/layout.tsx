import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UPMERA AI — Your business, understood",
  description: "A clear, intelligent workspace for running and growing your business.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="reference">
      <body>{children}</body>
    </html>
  );
}
