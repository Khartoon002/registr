import "./globals.css";
import type { Metadata } from "next";
import Nav from "./nav";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b1220] text-gray-100 antialiased">
        <Nav />
        <main className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
