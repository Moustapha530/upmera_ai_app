import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UPMERA AI — Your business, understood",
  description: "A clear, intelligent workspace for running and growing your business.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="reference" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const p=JSON.parse(localStorage.getItem("upmera-preferences-v1")||"{}").state||{};document.documentElement.dataset.theme=p.theme==="dark"?"dark":"reference";document.documentElement.lang=p.language==="fr"?"fr":"en"}catch{}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
