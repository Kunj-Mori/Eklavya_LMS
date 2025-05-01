import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToasterProvider } from "@/components/providers/toaster-provider";
import { ConfettiProvider } from "@/components/providers/confetti-provider";
import Script from "next/script";
import { ThemeProvider } from "@/components/providers/theme-provider";
import dynamic from "next/dynamic";
import { Toaster } from "sonner";

// Dynamically import the FloatingChatWidget with no SSR to avoid hydration issues
const FloatingChatWidget = dynamic(
  () => import("@/components/ui/chat/FloatingChatWidget"),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: " Eklavya - Learning & Assessment Platform",
  description: "A platform for learning and assessment",
  icons: {
    icon: "/logo3.png",
    apple: "/logo3.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" type="image/png" href="/logo3.png" />
          <link rel="apple-touch-icon" href="/logo3.png" />
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <ToasterProvider />
            <ConfettiProvider />
            {children}
            <FloatingChatWidget />
          </ThemeProvider>
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
        </body>
      </html>
    </ClerkProvider>
  );
}
