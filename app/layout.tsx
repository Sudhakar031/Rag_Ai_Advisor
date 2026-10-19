import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hireko AI Product Advisor",
  description: "Recruitment, Interviewing, Assessment and AI Hiring Platforms Intelligence",
  icons: {
    icon: [
      { url: "/hireko-tab-icon.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/hireko-tab-icon.png",
    apple: "/hireko-tab-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
