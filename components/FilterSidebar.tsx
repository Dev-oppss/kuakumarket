"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { CategoryOption, BrandOption } from "@/lib/medusa"

const SKIN_TYPES = ["Grasse", "Sèche", "Mixte", "Sensible", "Tous types"]
const USAGE_TIMES = ["Matin", "Soir", "Avant soleil"]
const PRICE_RANGES = [
  { value: "0-5000", label: "Moins de 5 000" },
  { value: "5000-10000", label: "5 000 – 10 000" },
  { value: "10000-20000", label: "10 000 – 20 000" },
  { value: "20000-", label: "Plus de 20 000" },
]

export default function FilterSidebar({
  categories,
  brands,
}: {
  categories: CategoryOption[]
  brands: BrandOption[]
}) {
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("categorie")
  const activeBrand = searchParams.get("marque")
  const activePrix = searchParams.get("prix")

  // Conserve les autres filtres actifs quand on change de catégorie/marque
  const withParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const qs = params.toString()
    return `/catalogue${qs ? `?${qs}` : ""}`
  }

  return (
    <aside className="h-fit rounded-md2 p-1 md:glass md:p-6 md:shadow-sm">
      <FilterGroup title="Catégorie">
        <div className="flex flex-wrap gap-2">
          <Link href={withParam("categorie", null)} className={chip(!activeCategory)}>
            Tout
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={withParam("categorie", c.name)}
              className={chip(activeCategory === c.name)}
            >
              {c.name}
            </Link>
          ))}
        </div>
        {categories.length === 0 && (
          <p className="text-xs text-ink-soft">Aucune catégorie disponible.</p>
        )}
      </FilterGroup>

      {brands.length > 0 && (
        <FilterGroup title="Marque">
          <div className="flex flex-col gap-2.5">
            <Link
              href={withParam("marque", null)}
              className={`text-sm ${!activeBrand ? "font-bold text-rose-deep" : "text-ink"}`}
            >
              Toutes les marques
            </Link>
            {brands.map((b) => (
              <label key={b.id} className="flex min-h-9 items-center gap-3 text-sm text-ink">
                <input
                  type="radio"
                  name="marque"
                  checked={activeBrand === b.name}
                  onChange={() => {
                    window.location.href = withParam("marque", b.name)
                  }}
                  className="h-5 w-5 accent-rose md:h-[15px] md:w-[15px]"
                />
                <span>{b.name}</span>
              </label>
            ))}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Type de peau">
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map((s) => (
            <span key={s} className={chip(s === "Tous types")}>
              {s}
            </span>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Moment d\'utilisation">
        <div className="flex flex-wrap gap-2">
          {USAGE_TIMES.map((t) => (
            <span key={t} className={chip(false)}>
              {t}
            </span>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Prix (FCFA)">
        <div className="flex flex-wrap gap-2">
          <Link href={withParam("prix", null)} className={chip(!activePrix)}>
            Tout
          </Link>
          {PRICE_RANGES.map((r) => (
            <Link
              key={r.value}
              href={withParam("prix", r.value)}
              className={chip(activePrix === r.value)}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </FilterGroup>
    </aside>
  )
}

function chip(active: boolean) {
  return `rounded-full border px-4 py-2 text-xs font-semibold transition-colors md:px-3.5 md:py-1.5 ${
    active
      ? "border-rose bg-rose text-white"
      : "border-rose-soft bg-white/70 text-ink hover:border-rose"
  }`
}

function FilterGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h4 className="mb-2.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
        {title}
      </h4>
      {children}
    </div>
  )
}
