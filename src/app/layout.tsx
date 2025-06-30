import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getCurrentUser } from "../actions/auth"
import Providers from "./providers"

export const metadata: Metadata = {
  title: "IND2B",
  description: "Your one-stop shop for all your needs",
  generator: "v0.dev",
  icons: {
    icon: [
      {
        url: "/logo.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        url: "/logo.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: {
      url: "/logo.png",
      sizes: "360x360",
      type: "image/png",
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className="bg-gray-100">
        <Providers>
          <Header user={user} />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
