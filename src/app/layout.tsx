import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pliex — The AI operating layer for small food businesses",
  description:
    "Pliex brings sales, expenses, stock, and your next action into one calm workspace. Built for cafés, bakeries, and small food shops.",
  icons: {
    icon: "/favicon.ico"
  }
};

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_LINK} />
      </head>
      <body>
        <div className="grain-overlay" />
        {children}
      </body>
    </html>
  );
}
