import Link from "next/link"
import Image from "next/image"
import { fetchSiteSettings } from "@/lib/medusa"

export default async function Footer() {
  const settings = await fetchSiteSettings()
  return (
    <footer className="mt-10 bg-rose-deep px-4 py-10 text-cream sm:px-6 sm:py-14 md:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-white/25">
              <Image src="/logo.jpg" alt="KuakuMarket" fill className="object-cover" />
            </span>
            <span className="font-display text-base">KuakuMarket</span>
          </div>
          <p className="mt-3.5 max-w-xs text-sm text-rose-soft/85">
            Beauté & cosmétique pour toutes, à Douala, Yaoundé et au-delà.
            Votre beauté en un clic.
          </p>
        </div>

        <FooterColumn
          title="Boutique"
          links={[
            ["Visage", "/catalogue?categorie=Visage"],
            ["Corps", "/catalogue?categorie=Corps"],
            ["Cheveux", "/catalogue?categorie=Cheveux"],
            ["Promotions", "/catalogue"],
          ]}
        />
        <FooterColumn
          title="Aide"
          links={[
            ["Contact", "/contact"],
            ["Suivre ma commande", "/compte"],
            ["WhatsApp", settings.whatsapp ? `https://wa.me/${settings.whatsapp}` : "#"],
          ]}
        />
        <FooterColumn
          title="Suivez-nous"
          links={[
            ["Instagram", settings.instagram || "#"],
            ["Facebook", settings.facebook || "#"],
            ["TikTok", settings.tiktok || "#"],
          ]}
        />
      </div>

      <div className="mx-auto mt-11 max-w-7xl border-t border-white/15 pt-5 text-xs text-rose-soft/70 sm:flex sm:justify-between">
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
  links: [string, string][]
}) {
  return (
    <div>
      <h4 className="text-xs font-bold tracking-wide text-white">
        {title.toUpperCase()}
      </h4>
      <ul className="mt-3.5 flex flex-col gap-2.5">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-rose-soft/85 transition-colors hover:text-white"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
