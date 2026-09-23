import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Soporte TI · Clínicas Limatambo",
  description: "Plataforma Integral de Soporte TI, Mesa de Ayuda e Inventario - Clínicas Limatambo",
  applicationName: "Soporte TI",
  appleWebApp: {
    capable: true,
    title: "Soporte TI",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-limatambo.png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { url: '/logo-limatambo.png' },
    ],
  },
  manifest: "/manifest.json",
};

import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,300..900;1,300..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
