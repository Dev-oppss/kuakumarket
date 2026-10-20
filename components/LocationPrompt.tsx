"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"

const KEY = "kuaku_location"
const CITIES = [
  "Douala", "Yaoundé", "Bafoussam", "Bamenda", "Garoua", "Maroua", "Ngaoundéré", "Bertoua", "Ebolowa",
  "Kribi", "Limbé", "Buea", "Kumba", "Edéa", "Nkongsamba", "Dschang", "Foumban", "Mbalmayo", "Kousséri",
]

/** Liste des pays en français (code ISO + nom), Cameroun en tête. */
function useCountries() {
  return useMemo(() => {
    const dn = new Intl.DisplayNames(["fr"], { type: "region" })
    const skip = new Set(["AC", "CP", "DG", "EA", "EU", "EZ", "IC", "TA", "UN", "XA", "XB", "ZZ", "QO"])
    const list: { code: string; name: string }[] = []
    for (let a = 65; a <= 90; a++) {
      for (let b = 65; b <= 90; b++) {
        const code = String.fromCharCode(a, b)
        if (skip.has(code)) continue
        try {
          const name = dn.of(code)
          if (name && name !== code) list.push({ code, name })
        } catch {
          // code non valide : ignoré
        }
      }
    }
    list.sort((x, y) => x.name.localeCompare(y.name, "fr"))
    return [...list.filter((c) => c.code === "CM"), ...list.filter((c) => c.code !== "CM")]
  }, [])
}

/**
 * Petite notification : "D'où nous visitez-vous ?". Valider enregistre le pays et
 * la ville indiqués (envoyés avec les statistiques, voir lib/track.ts). La croix
 * la ferme : on garde alors le lieu approximatif déduit de la connexion.
 */
export default function LocationPrompt() {
  const [open, setOpen] = useState(false)
  const [country, setCountry] = useState("CM")
  const [city, setCity] = useState("")
  const countries = useCountries()

  useEffect(() => {
    try {
      setOpen(!window.localStorage.getItem(KEY))
    } catch {
      setOpen(false)
    }
  }, [])

  if (!open) return null

  const close = (value: object) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(value))
    } catch {
      // stockage bloqué : la notification reviendra au prochain chargement
    }
    setOpen(false)
  }

  const field =
    "w-full rounded-xl border border-rose-soft bg-white px-3 py-2 text-sm text-ink outline-none focus:border-rose"

  return (
    <div
      role="dialog"
      aria-label="D'où nous visitez-vous ?"
      className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[60] rounded-2xl border border-rose-soft bg-white p-4 shadow-xl md:inset-x-auto md:bottom-6 md:left-6 md:w-[24rem]"
    >
      <button
        onClick={() => close({ dismissed: true })}
        aria-label="Fermer"
        className="absolute right-3 top-3 rounded-full p-1 text-ink-soft transition-colors hover:bg-rose-soft"
      >
        <X className="h-4 w-4" />
      </button>
      <p className="pr-6 text-sm font-bold text-ink">D&apos;où nous visitez-vous ?</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        Indiquez votre pays et votre ville pour nous aider à améliorer la boutique. Sans réponse, nous estimons votre
        position à partir de votre connexion.
      </p>
      <div className="mt-3 flex flex-col gap-2">
        <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label="Pays" className={field}>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          list="kuaku-villes"
          placeholder="Votre ville"
          aria-label="Ville"
          maxLength={80}
          className={field}
        />
        {country === "CM" && (
          <datalist id="kuaku-villes">
            {CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        )}
      </div>
      <button
        onClick={() => close({ country, city: city.trim() || undefined })}
        className="mt-3 w-full rounded-full bg-rose px-4 py-2 text-sm font-bold text-white transition-all hover:bg-teal active:scale-95"
      >
        Valider
      </button>
    </div>
  )
}
