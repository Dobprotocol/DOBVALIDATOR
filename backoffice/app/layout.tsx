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
  description: "Admin dashboard for Dob Validator. Review, manage, and approve RWA token submissions and validator activity. Restricted to authorized personnel.",
  openGraph: {
    title: "DOB Validator BackOffice",
    description: "Admin dashboard for the Digital Ownership Protocol. Review, manage, and approve RWA token submissions and validator activity. Restricted to authorized personnel.",
    url: "https://your-backoffice-domain.com", // TODO: update to real domain
    siteName: "DOB Validator BackOffice",
    images: [
      {
        url: "/public/og-image-backoffice.png", // TODO: update to real OG image path
        width: 1200,
        height: 630,
        alt: "DOB Validator BackOffice",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DOB Validator BackOffice",
    description: "Admin dashboard for the Digital Ownership Protocol. Review, manage, and approve RWA token submissions and validator activity. Restricted to authorized personnel.",
    images: ["/public/og-image-backoffice.png"], // TODO: update to real OG image path
    creator: "@yourtwitter", // TODO: update to real Twitter handle
  },
  metadataBase: new URL('http://localhost:3002'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
