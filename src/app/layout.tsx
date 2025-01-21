import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";

import { Toaster } from "react-hot-toast";
import "./globals.css";

import Navbar from "@/components/navigation/navbar";
import Footer from "@/components/navigation/Footer";

// font
const inter = Inter({ display: "swap", subsets: ["latin"] });

// Metadata
export const metadata: Metadata = {
  title: "HANS - AI powered transcription",
  description: "Convert voice recording into text - like memos to yourself, podcasts or interviews. Bring your own OpenAI key for low rates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        {/* show alerts */}
        <Toaster />

        {/* Navbar */}
        <header>
          <Navbar />
        </header>

        {/* Main Container */}
        <main className="container min-h-innerfull bg-background py-5">
          {children}
        </main>

        {/* Footer */}

        <Footer />
      </body>
      {/* Umami Analytics, loaded after all other ressources have been fetched */}
      <Script
        src="https://umami-topaz-alpha.vercel.app/script.js"
        data-website-id="b3f11b31-11b0-4803-85bf-b5b3fcb813a1"
        strategy="lazyOnload"
      />
    </html>
  );
}
