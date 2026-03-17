import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Avatar Starter",
  description: "Starter UI for a voice and avatar chatbot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
