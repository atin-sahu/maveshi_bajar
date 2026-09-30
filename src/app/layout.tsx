import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { PWAInstaller } from "@/components/common/PWAInstaller";
import "./globals.css";

export const metadata: Metadata = {
  title: "मवेशी बाज़ार | Maveshi Bajar - गाय, भैंस, पड़वा व पड़िया",
  description:
    "अच्छे और स्वस्थ गाय, भैंस, पड़वा व पड़िया बिक्री के लिए उपलब्ध। सीधे पशुपालक से संपर्क करें।",
  keywords: [
    "मवेशी बाज़ार",
    "गाय बिक्री",
    "भैंस बिक्री",
    "पड़वा",
    "पड़िया",
    "dairy cattle",
    "cow for sale",
    "buffalo for sale",
    "Sahiwal",
    "Murrah",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "मवेशी बाज़ार",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#047857",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900">
        <LanguageProvider>
          <Header />
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-4">
            {children}
          </main>
          <Footer />
          <PWAInstaller />
        </LanguageProvider>
      </body>
    </html>
  );
}
