import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/ui/header"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from 'react'
import { LoadingHandler } from '@/components/loading-handler'
import { Footer } from "@/components/ui/footer"
import { StarsBackground } from "@/components/ui/stars-background"

export const metadata: Metadata = {
  title: 'DOB Validator',
  description: 'The public-facing verification portal for the Digital Ownership Protocol. Submit, verify, and manage RWA token onboarding and validation, powered by Stellar blockchain.',
  openGraph: {
    title: 'DOB Validator',
    description: 'The public-facing verification portal for the Digital Ownership Protocol. Submit, verify, and manage RWA token onboarding and validation, powered by Stellar blockchain.',
    url: 'https://your-frontend-domain.com', // TODO: update to real domain
    siteName: 'DOB Validator',
    images: [
      {
        url: '/public/og-image.png', // TODO: update to real OG image path
        width: 1200,
        height: 630,
        alt: 'DOB Validator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DOB Validator',
    description: 'The public-facing verification portal for the Digital Ownership Protocol. Submit, verify, and manage RWA token onboarding and validation, powered by Stellar blockchain.',
    images: ['/public/og-image.png'], // TODO: update to real OG image path
    creator: '@yourtwitter', // TODO: update to real Twitter handle
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Prevent white flash on load */
            html {
              background-color: #0a0a0a !important;
              color-scheme: dark;
            }
            body {
              background-color: #0a0a0a !important;
              opacity: 1;
              transition: opacity 0.3s ease-in-out;
            }
            body.loading {
              opacity: 0;
            }
            body.loaded {
              opacity: 1;
            }
            .no-js {
              visibility: hidden;
            }
            .js {
              visibility: visible;
            }
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent white flash by setting dark theme immediately
              if (typeof document !== 'undefined') {
                document.documentElement.classList.add('dark');
                if (document.documentElement) {
                  document.documentElement.style.backgroundColor = '#0a0a0a';
                }
                if (document.body) {
                  document.body.style.backgroundColor = '#0a0a0a';
                  document.body.style.opacity = '1';
                  
                  // Add loaded class after a short delay
                  setTimeout(() => {
                    if (document.body) {
                      document.body.classList.add('loaded');
                    }
                  }, 100);
                }
              }
            `,
          }}
        />
      </head>
      <body className="js">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LoadingHandler />
          <StarsBackground className="fixed inset-0 z-0" />
          <div className="relative z-10 min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
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
