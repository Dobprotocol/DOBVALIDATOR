import './globals.css'
import type { Metadata } from 'next'

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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}