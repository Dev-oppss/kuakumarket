import { fetchSiteSettings } from "@/lib/medusa"

/**
 * Bannière défilante en haut de page. Les messages viennent des réglages
 * du site (modifiables dans l'admin, page "Réglages du site"), avec des
 * valeurs par défaut sinon. Le contenu est dupliqué une fois (voir le map
 * ×2 plus bas) pour que la boucle CSS (-50%) soit invisible — sans ce
 * doublon, on verrait un "trou" à chaque tour.
 */
export default async function ScrollingBanner() {
  const { banner_messages } = await fetchSiteSettings()
  const items = [...(banner_messages ?? []), ...(banner_messages ?? [])]

  return (
    <div className="overflow-hidden bg-ink text-cream py-2.5">
      <div className="marquee-track">
        {items.map((msg, i) => (
          <div key={i} className="flex items-center shrink-0 px-8">
            <span className="text-xs tracking-wide text-cream/90">{msg}</span>
            <span className="ml-8 text-rose">✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}
