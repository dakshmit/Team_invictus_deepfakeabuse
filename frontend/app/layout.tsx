import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter'
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'Digital Dignity - Protecting Users from Deepfake Abuse',
  description: 'A safe space to help you understand and respond to manipulated images with privacy and dignity.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#e8e4f0',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased bg-background text-foreground`}>
        <GoogleOAuthProvider clientId="626411602341-4681rsethh1hiif1ofj34o3s3cp849ng.apps.googleusercontent.com">
          {children}
        </GoogleOAuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
