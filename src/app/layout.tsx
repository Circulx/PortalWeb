import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getCurrentUser } from "../actions/auth"
import Providers from "./providers"
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics"
import PageViewTracker from "@/components/analytics/PageViewTracker"
import { Suspense } from "react"
import Clarity from "@/components/analytics/Clarity"
import Script from "next/script"
import { OnboardingPopupHandler } from "@/components/onboarding-popup-handler"

export const metadata: Metadata = {
  title: "IND2B",
  description: "Your one-stop shop for all your needs",
  icons: {
    icon: [
      {
        url: "/logo.webp",
        sizes: "64x64",
        type: "image/webp",
      },
      {
        url: "/logo.webp",
        sizes: "32x32",
        type: "image/webp",
      },
    ],
    apple: {
      url: "/logo.webp",
      sizes: "360x360",
      type: "image/webp",
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
        <link rel="icon" href="/logo.webp" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.webp" />
      </head>
      <body className="bg-gray-100 prevent-overflow">
        <GoogleAnalytics />
        <Clarity />
        <Providers>
          <Header user={user} />
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
          <main className="min-h-screen pt-10 sm:pt-12 lg:pt-14 w-full max-w-full overflow-x-hidden">{children}</main>
          <Footer />
          <OnboardingPopupHandler />
        </Providers>

        <Script id="tawk-to-widget" strategy="afterInteractive">
          {`
            var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
            (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/68b4158f8e5e8d7ad6a00aa0/1j3vn8f4e';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
            })();
          `}
        </Script>
      </body>
    </html>
  )
}
