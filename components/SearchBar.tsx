"use client"
import { Suspense } from "react"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X } from "lucide-react"

/**
 * Champ de recherche relié au catalogue : envoie ?recherche=... sur
 * /catalogue avec un léger anti-rebond, pour ne pas naviguer à chaque
 * frappe. `full` = variante pleine largeur utilisée dans le menu mobile.
 */
function SearchBarInner({
  full = false,
  onSubmit,
}: {
  full?: boolean
  onSubmit?: () => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("recherche") ?? "")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setValue(searchParams.get("recherche") ?? "")
  }, [searchParams])

  const go = (q: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) params.set("recherche", q.trim())
    else params.delete("recherche")
    router.push(`/catalogue?${params.toString()}`)
  }

  const handleChange = (q: string) => {
    setValue(q)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => go(q), 400)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (timer.current) clearTimeout(timer.current)
    go(value)
    onSubmit?.()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={
        full
          ? "flex items-center gap-2 rounded-full border border-rose-soft bg-white/80 px-4 py-2.5 focus-within:border-teal"
          : "flex items-center gap-2 rounded-full border border-rose-soft bg-white/70 px-4 py-2 transition-colors focus-within:border-teal"
      }
    >
      <Search className="h-4 w-4 shrink-0 text-teal" strokeWidth={2} />
      <input
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Rechercher un soin, une marque…"
        className={
          full
            ? "min-w-0 flex-1 bg-transparent text-base text-ink placeholder:text-ink-soft focus:outline-none"
            : "w-40 bg-transparent text-sm text-ink placeholder:text-ink-soft focus:outline-none"
        }
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            setValue("")
            go("")
          }}
          aria-label="Effacer la recherche"
          className="text-ink-soft"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </form>
  )
}

export default function SearchBar(props: { full?: boolean; onSubmit?: () => void }) {
  // useSearchParams doit être sous Suspense en dehors des pages, sinon
  // Next.js fait échouer le build ("missing Suspense boundary").
  return (
    <Suspense fallback={null}>
      <SearchBarInner {...props} />
    </Suspense>
  )
}
