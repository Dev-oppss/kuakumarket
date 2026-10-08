import Link from "next/link"
import type { BrandOption } from "@/lib/medusa"

/** Grille "Nos marques" — une tuile par marque, vers le catalogue filtré. */
export default function BrandGrid({ brands }: { brands: BrandOption[] }) {
  if (brands.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {brands.map((b) => (
        <Link
          key={b.id}
          href={`/catalogue?marque=${encodeURIComponent(b.name)}`}
          className="glass flex h-24 items-center justify-center rounded-md2 px-4 text-center font-display text-sm font-semibold text-ink transition-transform hover:scale-105"
        >
          {b.name}
        </Link>
      ))}
    </div>
  )
}
