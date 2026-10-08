import Link from "next/link"
import type { CategoryOption } from "@/lib/medusa"

/** Grille "Un besoin particulier ?" — une tuile par catégorie, vers le catalogue filtré. */
export default function CategoryGrid({ categories }: { categories: CategoryOption[] }) {
  if (categories.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/catalogue?categorie=${encodeURIComponent(c.name)}`}
          className="group flex flex-col items-center gap-2.5 text-center"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-rose-soft to-teal-soft text-2xl transition-transform group-hover:scale-105 sm:h-24 sm:w-24">
            {c.name.charAt(0)}
          </span>
          <span className="rounded-full border border-rose-soft bg-white/80 px-3 py-1 text-xs font-semibold text-ink">
            {c.name}
          </span>
        </Link>
      ))}
    </div>
  )
}
