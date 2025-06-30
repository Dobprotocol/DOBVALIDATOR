import { Metadata } from "next"

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
  },
} 