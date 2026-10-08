"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Store, ShoppingBag, User } from "lucide-react"
import { getCart } from "@/lib/cart"

const TABS = [
  { href: "/", label: "Accueil", Icon: Home },
  { href: "/catalogue", label: "Boutique", Icon: Store },
  { href: "/panier", label: "Panier", Icon: ShoppingBag },
  { href: "/compte", label: "Compte", Icon: User },
]

/** Barre de navigation fixée en bas de l'écran — mobile uniquement. */
export default function BottomNav() {
  const pathname = usePathname()
  const [cartCount, setCartCount] = useState(0)

  // Recalcule le compteur à chaque changement de page
  useEffect(() => {
    getCart().then((cart) => {
      const count = (cart?.items ?? []).reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0
      )
      setCartCount(count)
    })
  }, [pathname])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <nav
      aria-label="Navigation principale mobile"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-rose-soft bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold transition-colors ${
                  active ? "text-rose-deep" : "text-ink-soft"
                }`}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
                  {href === "/panier" && cartCount > 0 && (
                    <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[0.6rem] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </span>
                {label}
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-rose" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
