import Link from "next/link"
import Image from "next/image"
import type { BrandOption } from "@/lib/medusa"

/**
 * Grille "Nos marques" — une tuile par marque, vers le catalogue filtré.
 * Affiche le logo officiel (envoyé depuis l'admin → Marques) ou, à défaut,
 * le nom de la marque, avec le nombre de produits.
 */
export default function BrandGrid({ brands }: { brands: BrandOption[] }) {
  if (brands.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {brands.map((b) => {
        const count = b.product_count
        return (
          <Link
            key={b.id}
            href={`/catalogue?marque=${encodeURIComponent(b.name)}`}
            className="glass flex min-h-[7.5rem] flex-col items-center justify-center gap-2.5 rounded-md2 px-4 py-4 text-center transition-transform hover:scale-105"
          >
            <span className="flex h-12 w-full items-center justify-center">
              {b.logo_url ? (
                // unoptimized : logos de petite taille (png / svg / webp), pas besoin de l'optimiseur
                <Image
                  src={b.logo_url}
                  alt={b.name}
                  width={160}
                  height={48}
                  unoptimized
                  className="max-h-12 w-auto max-w-full object-contain"
                />
              ) : (
                <span className="font-display text-sm font-semibold text-ink">{b.name}</span>
              )}
            </span>
            {count != null && (
              <span className="text-xs text-ink-soft">
                {count} produit{count > 1 ? "s" : ""}
              </span>
            )}
          </Link>
        )
      })}
    </div>
  )
}
