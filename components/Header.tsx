"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, ShoppingBag, Menu, X } from "lucide-react"
import SearchBar from "@/components/SearchBar"
import clsx from "clsx"
import { getCart } from "@/lib/cart"

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/catalogue", label: "Boutique" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    getCart().then((cart) => {
      const count = (cart?.items ?? []).reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      )
      setCartCount(count)
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-sm" : "bg-cream/0"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:py-4">
        <Link
          href="/"
          aria-label="KuakuMarket — Votre beauté en un seul clic"
          className="flex min-w-0 items-center"
        >
          <Image
            src="/logo.png"
            alt="KuakuMarket — Votre beauté en un seul clic"
            width={1000}
            height={315}
            priority
            className="h-11 w-auto sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link text-sm font-semibold text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <div className="hidden lg:block">
            <SearchBar />
          </div>

          <Link
            href="/compte"
            aria-label="Mon compte"
            className="hidden h-9 w-9 items-center justify-center rounded-full bg-rose-soft text-rose-deep transition-all hover:scale-110 hover:bg-teal-soft hover:text-teal md:flex"
          >
            <User className="h-4 w-4" strokeWidth={2} />
          </Link>

          <Link
            href="/panier"
            aria-label="Panier"
            className="glass-teal relative flex h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold text-ink-soft shadow-glow transition-transform hover:scale-105 active:scale-95 sm:px-5 md:h-auto md:py-2.5"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
            <span className="hidden sm:inline">Panier</span>
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal text-[0.65rem] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            aria-label="Menu"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-soft text-rose-deep md:hidden"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-4 w-4" strokeWidth={2} />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="glass md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              <div className="mb-2">
                <SearchBar full onSubmit={() => setMobileOpen(false)} />
              </div>
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex min-h-11 items-center text-sm font-semibold text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/compte"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-11 items-center gap-2 text-sm font-semibold text-ink"
              >
                <User className="h-4 w-4" strokeWidth={2} />
                Mon compte
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
