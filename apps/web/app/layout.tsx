import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";

export const metadata: Metadata = {
  title: "Viability.ai — AI-Powered Startup Validation",
  description: "Use enterprise-grade AI to validate your startup idea, analyze market growth, and calculate live burn rates before you write a single line of code.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0e1a]">
        <Navigation />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}
