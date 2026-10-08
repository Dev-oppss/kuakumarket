"use client"

import Link from "next/link"
import Image from "next/image"
import Carousel from "./Carousel"
import type { PromoSlide } from "@/lib/medusa"

/**
 * Espace pubs / promos défilant — le contenu vient maintenant de l'admin
 * (page "Page d'accueil", upload d'image inclus) au lieu d'un tableau
 * codé en dur. Même logique qu'avant : chaque promo est soit une
 * bannière texte+fond ("banner"), soit une affiche pure cliquable
 * ("poster", pour un visuel déjà designé, sans texte superposé).
 *
 * Ne s'affiche pas du tout si aucune promo n'est configurée.
 */
const TONE_BG = {
  rose: "from-rose to-rose-deep",
  teal: "from-teal to-[#0f7f97]",
}

export default function PromoBanner({ promos }: { promos: PromoSlide[] }) {
  if (promos.length === 0) return null

  return (
    <div className="mx-6 sm:mx-10">
      <Carousel showDots showArrows slideClassName="basis-full">
        {promos.map((promo, i) => {
          if (promo.mode === "poster" && promo.image_url) {
            return (
              <Link
                key={i}
                href={promo.href}
                className="relative block aspect-[21/6] overflow-hidden rounded-lg2"
              >
                <Image
                  src={promo.image_url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </Link>
            )
          }

          return (
            <div
              key={i}
              className={`relative overflow-hidden rounded-lg2 bg-gradient-to-br px-6 py-9 text-white sm:px-8 sm:py-11 md:flex md:items-center md:justify-between md:px-14 ${TONE_BG[promo.tone ?? "rose"]}`}
            >
              {promo.image_url && (
                <>
                  <Image src={promo.image_url} alt="" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-br from-ink/60 via-ink/30 to-transparent" />
                </>
              )}

              {!promo.image_url && (
                <div
                  aria-hidden
                  className="absolute -right-16 -top-16 h-56 w-56 animate-floatSlow rounded-full bg-white/10"
                />
              )}

              <div className="relative max-w-md">
                {promo.title && <h2 className="font-display text-3xl leading-tight">{promo.title}</h2>}
                {promo.text && <p className="mt-2.5 text-sm text-white/85">{promo.text}</p>}
              </div>
              {promo.cta && (
                <Link
                  href={promo.href}
                  className="glass relative mt-6 inline-block rounded-full px-7 py-3.5 text-sm font-bold text-rose-deep transition-all hover:scale-105 hover:text-teal active:scale-95 md:mt-0"
                >
                  {promo.cta}
                </Link>
              )}
            </div>
          )
        })}
      </Carousel>
    </div>
  )
}
