import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { cookies } from "next/headers";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SourceHub | Premium Code & Services",
  description: "High-quality source code and developer services",
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Await params for Next.js 15+ compatibility
  const { locale } = await params;

  // Fetch translation messages for the current locale
  const messages = await getMessages();
  
  const cookieStore = await cookies();
  const hasUserRole = cookieStore.has("user_role");

  return (
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <Navbar initialIsLoggedIn={hasUserRole} />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
            <Toaster position="top-center" richColors />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
