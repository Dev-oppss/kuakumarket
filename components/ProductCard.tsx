"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { formatFCFA } from "@/lib/format"
import { track } from "@/lib/track"

export type ProductCardData = {
  id: string
  handle: string
  title: string
  thumbnail: string | null
  category?: string
  brand?: string
  price: number
  originalPrice?: number | null
  /**
   * Ligne courte affichée sous le prix, ex. "Visage · Matin",
   * "Corps · Tous types de peau" (voir zone-tag dans la maquette).
   * Vient des attributs beauté (module custom, pas encore branché —
   * même chantier que les filtres Type de peau / Moment d'utilisation,
   * voir FilterSidebar.tsx). En attendant, on retombe sur la catégorie
   * pour ne jamais laisser cette ligne vide.
   */
  tag?: string | null
}

/**
 * Reprend catLabel() de la maquette : "Visage" et "Corps" s'affichent
 * sous une forme plus lisible, les autres catégories restent telles quelles.
 */
function categoryLabel(category?: string) {
  if (category === "Visage") return "Soin visage"
  if (category === "Corps") return "Soin corps"
  return category
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const hasPromo =
    product.originalPrice != null && product.originalPrice > product.price
  const promoPercent = hasPromo
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) * 100
      )
    : null

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="glass-teal group rounded-md2 border border-rose-soft overflow-hidden transition-colors hover:border-teal"
    >
      <Link
        href={`/produit/${product.handle}`}
        onClick={() => track("product_click", { target: product.title, productId: product.id })}
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-rose-soft to-teal-soft">
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 28vw, (min-width: 640px) 45vw, 50vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-[0.58rem] font-bold text-white sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:text-[0.62rem]">
              Exemple — photo à venir
            </div>
          )}
          {promoPercent != null && (
            <span className="absolute right-2.5 top-2.5 rounded-lg bg-rose px-2.5 py-1 text-xs font-extrabold text-white">
              -{promoPercent}%
            </span>
          )}

          {/* voile glassmorphique qui apparaît au survol avec un accès rapide */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full glass px-4 py-2.5 text-center text-xs font-bold text-ink transition-transform duration-300 ease-out group-hover:translate-y-0">
            Voir le produit
          </div>
        </div>

        <div className="px-3 py-3 sm:px-4 sm:py-4">
          {product.category && (
            <div className="text-[0.7rem] font-bold text-teal">
              {categoryLabel(product.category)}
            </div>
          )}
          <h3 className="mt-1 line-clamp-2 min-h-[2.4em] text-[0.8rem] font-bold leading-snug text-ink sm:text-sm">
            {product.title}
          </h3>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 sm:mt-2.5">
            <span className="font-display text-base font-semibold text-ink sm:text-lg">
              {formatFCFA(product.price)}
            </span>
            {hasPromo && (
              <span className="text-xs text-ink-soft line-through sm:text-sm">
                {formatFCFA(product.originalPrice!)}
              </span>
            )}
          </div>
          {(product.tag || product.category) && (
            <div className="mt-2.5 text-xs text-ink-soft">
              {product.tag || categoryLabel(product.category)}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
