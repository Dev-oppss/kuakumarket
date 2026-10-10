import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { fetchSiteSettings } from "@/lib/medusa"

export const revalidate = 60

const FALLBACK = {
  phone: "+237 6XX XXX XXX",
  email: "contact@kuakumarket.com",
  address: "Douala, Cameroun",
  hours: "Lundi – Samedi, 8h – 18h",
}

/**
 * Page de contact — les coordonnées viennent des réglages du site
 * (admin → "Réglages du site", page ajoutée pour que l'équipe change ça
 * elle-même sans toucher au code). Tant que rien n'est renseigné, des
 * valeurs provisoires s'affichent (FALLBACK ci-dessus).
 */
export default async function ContactPage() {
  const settings = await fetchSiteSettings()
  const CONTACT_INFO = {
    phone: settings.phone || FALLBACK.phone,
    whatsapp: settings.whatsapp,
    email: settings.email || FALLBACK.email,
    address: settings.address || FALLBACK.address,
    hours: settings.hours || FALLBACK.hours,
  }
  const isProvisional = !settings.phone && !settings.email

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl">Contactez-nous</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Une question sur un produit, une commande ou une livraison ? On te répond.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ContactCard
          icon={<Phone className="h-5 w-5" strokeWidth={2} />}
          label="Téléphone"
          value={CONTACT_INFO.phone}
          href={`tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`}
        />
        {CONTACT_INFO.whatsapp && (
          <ContactCard
            icon={<Phone className="h-5 w-5" strokeWidth={2} />}
            label="WhatsApp"
            value="Discuter directement"
            href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
          />
        )}
        <ContactCard
          icon={<Mail className="h-5 w-5" strokeWidth={2} />}
          label="Email"
          value={CONTACT_INFO.email}
          href={`mailto:${CONTACT_INFO.email}`}
        />
        <ContactCard
          icon={<MapPin className="h-5 w-5" strokeWidth={2} />}
          label="Adresse"
          value={CONTACT_INFO.address}
        />
        <ContactCard
          icon={<Clock className="h-5 w-5" strokeWidth={2} />}
          label="Horaires"
          value={CONTACT_INFO.hours}
        />
      </div>

      {isProvisional && (
        <p className="mt-10 text-center text-xs text-ink-soft">
          Ces coordonnées sont provisoires — elles seront mises à jour prochainement.
        </p>
      )}
    </div>
  )
}

function ContactCard({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value: string
  href?: string
}) {
  const content = (
    <div className="glass flex items-center gap-4 rounded-md2 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-soft text-rose-deep">
        {icon}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</p>
        <p className="mt-0.5 font-semibold text-ink">{value}</p>
      </div>
    </div>
  )
  return href ? (
    <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    content
  )
}
