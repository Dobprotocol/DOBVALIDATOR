import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/ui/header"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from 'react'
import { LoadingHandler } from '@/components/loading-handler'

export const metadata: Metadata = {
  title: 'DOB Validator',
  description: 'A tool for validating and managing date of birth information',
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
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
