import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kavi — AI Shopping Assistant | Kapruka",
  description:
    "Sri Lanka's smartest AI shopping assistant. Find gifts, cakes, flowers, electronics and more on Kapruka.com — delivered anywhere in Sri Lanka.",
  keywords: ["Kapruka", "Sri Lanka", "shopping", "AI", "gifts", "delivery"],
  openGraph: {
    title: "Kavi — AI Shopping Assistant",
    description: "Shop smarter with Kavi, powered by Kapruka.com",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-bg text-text-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
