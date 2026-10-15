import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Mail, Phone } from "lucide-react"
import { fetchSiteSettings } from "@/lib/medusa"

// Tracés SVG des logos WhatsApp, TikTok et YouTube (lucide-react n'a pas ces trois-là).
const WHATSAPP_PATH =
  "M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.19 1.6 6.02L4 29l8.13-1.56a12 12 0 0 0 3.9.65C22.66 28.1 28 22.7 28 16.07 28 9.4 22.68 3 16.04 3Zm0 22.05c-1.2 0-2.38-.32-3.4-.93l-.24-.15-4.83.93.98-4.7-.16-.25a9.9 9.9 0 0 1-1.5-5.3c0-5.5 4.5-9.97 10.03-9.97 5.5 0 9.97 4.5 9.97 10.03 0 5.5-4.47 10.34-10.85 10.34Zm5.47-7.46c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.5.7.3 1.26.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"
const YOUTUBE_PATH =
  "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
const TIKTOK_PATH =
  "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"

/** "237681061842" → "+237 6 81 06 18 42" (format camerounais), sinon "+<numéro>". */
function formatWhatsapp(n: string) {
  const d = n.replace(/\D/g, "")
  if (d.startsWith("237") && d.length === 12) {
    const l = d.slice(3)
    return `+237 ${l[0]} ${l.slice(1, 3)} ${l.slice(3, 5)} ${l.slice(5, 7)} ${l.slice(7, 9)}`
  }
  return `+${d}`
}

export default async function Footer() {
  const settings = await fetchSiteSettings()

  // Boutons ronds : chacun n'apparaît que si la valeur est renseignée dans
  // l'admin → Réglages du site.
  const socials: { label: string; href: string; className: string; external: boolean; icon: React.ReactNode }[] = []
  if (settings.whatsapp)
    socials.push({
      label: "WhatsApp",
      href: `https://wa.me/${settings.whatsapp}`,
      className: "bg-[#25D366] text-white",
      external: true,
      icon: (
        <svg viewBox="0 0 32 32" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d={WHATSAPP_PATH} />
        </svg>
      ),
    })
  if (settings.facebook)
    socials.push({
      label: "Facebook",
      href: settings.facebook,
      className: "bg-[#1877F2] text-white",
      external: true,
      icon: <Facebook className="h-5 w-5 fill-current" strokeWidth={0} aria-hidden="true" />,
    })
  if (settings.instagram)
    socials.push({
      label: "Instagram",
      href: settings.instagram,
      className: "bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white",
      external: true,
      icon: <Instagram className="h-5 w-5" aria-hidden="true" />,
    })
  if (settings.tiktok)
    socials.push({
      label: "TikTok",
      href: settings.tiktok,
      className: "bg-black text-white",
      external: true,
      icon: (
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d={TIKTOK_PATH} />
        </svg>
      ),
    })
  if (settings.youtube)
    socials.push({
      label: "YouTube",
      href: settings.youtube,
      className: "bg-[#FF0000] text-white",
      external: true,
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d={YOUTUBE_PATH} />
        </svg>
      ),
    })
  if (settings.email)
    socials.push({
      label: "Email",
      href: `mailto:${settings.email}`,
      className: "bg-white text-logo-blue-deep",
      external: false,
      icon: <Mail className="h-5 w-5" aria-hidden="true" />,
    })
  if (settings.phone)
    socials.push({
      label: "Appeler",
      href: `tel:${settings.phone.replace(/\s/g, "")}`,
      className: "bg-white text-logo-blue-deep",
      external: false,
      icon: <Phone className="h-5 w-5" aria-hidden="true" />,
    })

  return (
    <footer className="mt-10 bg-logo-blue px-4 py-10 text-cream sm:px-6 sm:py-14 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-white/40">
              <Image src="/logo-icon.png" alt="KuakuMarket" fill className="object-contain p-1.5" />
            </span>
            <span className="font-display text-base">KuakuMarket</span>
          </div>
          <p className="mt-3.5 max-w-xs text-sm text-white/95">
            Beauté & cosmétique pour tous, livraison partout au Cameroun.
          </p>
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    aria-label={s.label}
                    title={s.label}
                    {...(s.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110 ${s.className}`}
                  >
                    {s.icon}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <FooterColumn
          title="Boutique"
          links={[
            ["Visage", "/catalogue?categorie=Visage"],
            ["Corps", "/catalogue?categorie=Corps"],
            ["Cheveux", "/catalogue?categorie=Cheveux"],
            ["Nos marques", "/#marques"],
            ["Promotions", "/catalogue"],
          ]}
        />
        <FooterColumn
          title="Aide"
          links={[
            ["Contact", "/contact"],
            ["Suivre ma commande", "/compte"],
          ]}
        />

        <div>
          <h4 className="text-xs font-bold tracking-wide text-white">CONTACT</h4>
          <ul className="mt-3.5 flex flex-col gap-2.5 text-sm text-white/95">
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="transition-colors hover:text-white">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.phone && (
              <li>
                Appel :{" "}
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="transition-colors hover:text-white">
                  {settings.phone}
                </a>
              </li>
            )}
            {settings.whatsapp && (
              <li>
                WhatsApp :{" "}
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {formatWhatsapp(settings.whatsapp)}
                </a>
              </li>
            )}
            <li>{settings.address || "Douala, Cameroun"}</li>
            {settings.hours && <li>{settings.hours}</li>}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-11 max-w-7xl border-t border-white/30 pt-5 text-xs text-white/85 sm:flex sm:justify-between">
        <span>© 2026 KuakuMarket — tous droits réservés</span>
        <span>{settings.address || "Douala, Cameroun"}</span>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: [string, string | null][]
}) {
  // Un lien sans adresse n'est pas affiché.
  const visible = links.filter((l): l is [string, string] => Boolean(l[1]))
  if (visible.length === 0) return null
  return (
    <div>
      <h4 className="text-xs font-bold tracking-wide text-white">
        {title.toUpperCase()}
      </h4>
      <ul className="mt-3.5 flex flex-col gap-2.5">
        {visible.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-white/95 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
