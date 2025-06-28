import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Footer } from "@/components/ui/footer"
import { FooterProvider } from "@/components/ui/footer-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DOB Validator BackOffice",
  description: "CMS-Integrated BackOffice Dashboard for DOB Protocol validation",
  generator: 'DOB Validator v1.0'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <FooterProvider>
            <div className="min-h-screen flex flex-col">
              <main className="flex-1 pb-16">
                {children}
              </main>
              <Footer />
            </div>
          </FooterProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
