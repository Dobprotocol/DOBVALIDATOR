"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/ui/footer"
import { FooterProvider } from "@/components/ui/footer-context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <FooterProvider>
            {children}
            <Footer />
          </FooterProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
