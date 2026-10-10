import type { Metadata, Viewport } from "next"
import { Fraunces, Manrope } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ScrollingBanner from "@/components/ScrollingBanner"
import BottomNav from "@/components/BottomNav"
import WhatsAppButton from "@/components/WhatsAppButton"
import PageViewTracker from "@/components/PageViewTracker"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
})

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "KuakuMarket — Votre beauté en un seul clic",
  description:
    "Soins visage, corps et cheveux sélectionnés pour toutes les carnations, livrés à Douala, Yaoundé et au-delà.",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E23B6B",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${manrope.variable}`}>
      <body className="min-h-dvh overflow-x-clip font-sans">
        <ScrollingBanner />
        <Header />
        <main>{children}</main>
        <Footer />
        {/* espace pour que la barre du bas ne cache pas le pied de page (mobile) */}
        <div className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" aria-hidden="true" />
        <WhatsAppButton />
        <BottomNav />
        {/* Fréquentation (visites, pages vues) — intégré à Medusa, pas d'outil tiers */}
        <PageViewTracker />
      </body>
    </html>
  )
}
