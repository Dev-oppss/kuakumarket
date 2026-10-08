"use client"

import { useEffect, useState } from "react"
import clsx from "clsx"
import { SlidersHorizontal, X } from "lucide-react"

/**
 * Mobile : un bouton « Filtres » ouvre un panneau qui monte du bas de
 * l'écran (le client voit les produits en premier, pas 6 groupes de filtres).
 * Tablette / ordinateur (md et plus) : le panneau est affiché normalement
 * dans la colonne de gauche, sans bouton.
 */
export default function FiltersPanel({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  // Empêche la page de défiler derrière le panneau ouvert
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  // Fermeture avec la touche Échap
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="flex h-11 items-center justify-center gap-2 rounded-full border-2 border-rose-soft bg-white/70 px-5 text-sm font-bold text-ink active:scale-95 md:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
        Filtres
      </button>

      {/* fond sombre (mobile uniquement) */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden="true"
        className={clsx(
          "fixed inset-0 z-[60] bg-ink/40 transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      <div
        className={clsx(
          // mobile : panneau fixé en bas de l'écran
          "fixed inset-x-0 bottom-0 z-[70] max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-lg2 bg-cream px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl transition-transform duration-300",
          open ? "translate-y-0" : "invisible translate-y-full",
          // md et plus : colonne normale, toujours visible
          "md:visible md:static md:z-auto md:max-h-none md:translate-y-0 md:overflow-visible md:rounded-none md:bg-transparent md:p-0 md:shadow-none"
        )}
      >
        <div className="mb-3 flex items-center justify-between md:hidden">
          <span className="font-display text-lg">Filtres</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer les filtres"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-soft text-rose-deep"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {children}

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-4 h-12 w-full rounded-full bg-rose text-sm font-bold text-white shadow-glow active:scale-95 md:hidden"
        >
          Voir les produits
        </button>
      </div>
    </>
  )
}
