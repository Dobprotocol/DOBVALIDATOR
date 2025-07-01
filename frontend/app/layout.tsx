import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Footer } from '@/components/ui/footer'
import { StarsBackground } from '@/components/ui/stars-background'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'DOB Validator',
  description: 'Device Ownership Blockchain Validator',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'DOB Validator',
    description: 'Device Ownership Blockchain Validator',
    siteName: 'DOB Validator',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/stellar-freighter-api/1.7.1/index.min.js" />
      </head>
      <body className="min-h-screen bg-background">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative min-h-screen overflow-hidden">
            <StarsBackground className="!fixed inset-0 -z-10" />
            <main className="relative z-0">
            {children}
          </main>
          <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
