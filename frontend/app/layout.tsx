import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/ui/header"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from 'react'
import { LoadingHandler } from '@/components/loading-handler'
import { Footer } from "@/components/ui/footer"

export const metadata: Metadata = {
  title: 'DOB Validator',
  description: 'DOB Validator is the core verification engine for RWA tokens in the DOB Protocol ecosystem. It ensures the authenticity, revenue flow, and trustless status of Infrastructure Tokens. Built on Stellar Blockchain.',
  openGraph: {
    title: 'DOB Validator',
    description: 'DOB Validator is the core verification engine for RWA tokens in the DOB Protocol ecosystem. It ensures the authenticity, revenue flow, and trustless status of Infrastructure Tokens. Built on Stellar Blockchain.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DOB Validator',
    description: 'DOB Validator is the core verification engine for RWA tokens in the DOB Protocol ecosystem. It ensures the authenticity, revenue flow, and trustless status of Infrastructure Tokens. Built on Stellar Blockchain.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="no-js">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            .no-js {
              visibility: hidden;
            }
            .js-ready {
              visibility: visible;
            }
          `
        }} />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <LoadingHandler />
          <div className="min-h-screen animate-fade-in">
            <Header />
            <main className="pt-20">
              <Suspense fallback={null}>
                {children}
              </Suspense>
            </main>
            <Footer />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
