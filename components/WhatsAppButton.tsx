import { fetchSiteSettings } from "@/lib/medusa"

/**
 * Bouton WhatsApp flottant. Le numéro vient des réglages du site (admin
 * → "Réglages du site"), pas d'une variable d'environnement — se met à
 * jour sans redéployer. Sans numéro renseigné, le bouton n'est pas
 * affiché. Format attendu : international, sans + ni espaces (ex.
 * 2376XXXXXXXX).
 */
export default async function WhatsAppButton() {
  const { whatsapp: number } = await fetchSiteSettings()
  if (!number) return null

  const text = encodeURIComponent("Bonjour KuakuMarket, j'ai une question.")
  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform active:scale-95 md:bottom-6 md:right-6"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.19 1.6 6.02L4 29l8.13-1.56a12 12 0 0 0 3.9.65C22.66 28.1 28 22.7 28 16.07 28 9.4 22.68 3 16.04 3Zm0 22.05c-1.2 0-2.38-.32-3.4-.93l-.24-.15-4.83.93.98-4.7-.16-.25a9.9 9.9 0 0 1-1.5-5.3c0-5.5 4.5-9.97 10.03-9.97 5.5 0 9.97 4.5 9.97 10.03 0 5.5-4.47 10.34-10.85 10.34Zm5.47-7.46c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.5.7.3 1.26.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" />
      </svg>
    </a>
  )
}
