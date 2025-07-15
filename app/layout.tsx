import type React from "react";
import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";

const inter = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Blog",
  description: "Personal crypto blog and essays",
  generator: "v0.dev",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} mx-auto w-full flex flex-col items-center`}>
        {children}
      </body>
    </html>
  );
}
