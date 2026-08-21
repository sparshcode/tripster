import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trip Brain",
  description:
    "One context-aware travel assistant that knows what you've booked, planned, and still need to do.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
