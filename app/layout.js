import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ReduxProvider from "@/lib/store/ReduxProvider";

/**
 * Root layout for Cartmate application.
 * Applies global styles, provides Redux store, and toast notifications.
 */

export const metadata = {
  title: "Cartmate - Collaborative Shopping Lists",
  description: "Real-time collaborative shopping list app with chat",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts for Oxanium and Source Code Pro */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;500;600;700&family=Source+Code+Pro:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ReduxProvider>
          {children}
          {/* Toast notifications */}
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}
