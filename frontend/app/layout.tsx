import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/theme-provider'
import { Footer } from '@/components/ui/footer'
import { StarsBackground } from '@/components/ui/stars-background'

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
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <link rel="preload" href="/fonts/your-font.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
          forcedTheme="dark"
        >
          <div className="relative min-h-screen flex flex-col">
            <StarsBackground className="fixed inset-0 -z-10" />
            <main className="flex-grow relative z-0">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}