import type React from "react";
import type { Metadata } from "next";
import { Inter, Open_Sans } from "next/font/google";
import "./globals.css";

const inter = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Woem",
  description: "Woem",
  keywords: ["crypto", "blog", "cryptocurrency", "blockchain"],
  authors: [{ name: "Woem" }],
  icons: {
    icon: "/favicon.webp",
    shortcut: "/favicon.webp",
    apple: "/favicon.webp",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://woem.bio",
    title: "Woem",
    description: "Woem",
    siteName: "Woem",
    images: [
      {
        url: "/link-image.webp",
        width: 800,
        height: 600,
        alt: "Woem Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Woem",
    description: "Woem",
    images: ["/link-image.webp"],
  },
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
