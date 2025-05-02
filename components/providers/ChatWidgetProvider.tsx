"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the FloatingChatWidget with no SSR
const FloatingChatWidget = dynamic(
  () => import("@/components/ui/chat/FloatingChatWidget"),
  { ssr: false }
);

export const ChatWidgetProvider = () => {
  const pathname = usePathname();

  // Don't show chat widget on sign-in, sign-up pages
  if (pathname?.includes("/sign-in") || pathname?.includes("/sign-up")) {
    return null;
  }

  // Don't show chat widget during examination session
  if (pathname?.includes("/examination/") && pathname?.includes("/session")) {
    return null;
  }

  return <FloatingChatWidget />;
}; 