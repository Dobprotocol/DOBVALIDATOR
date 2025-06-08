import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/ui/header"
import { Toaster } from "@/components/ui/toaster"

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
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Header />
          <main className="pt-20">
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
