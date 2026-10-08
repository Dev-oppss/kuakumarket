import Link from "next/link"
import { Sparkles, ShieldCheck, Truck } from "lucide-react"
import { fetchSiteSettings } from "@/lib/medusa"

/**
 * Page "À propos" — le lien existait déjà dans le menu (components/Header.tsx)
 * sans page derrière, d'où la 404 rencontrée. Contenu éditorial provisoire,
 * à écrire avec les vraies infos de la propriétaire quand elles arrivent
 * (comme pour /contact).
 */
export default async function AProposPage() {
  const settings = await fetchSiteSettings()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="text-center">
        <h1 className="font-display text-3xl">Qui sommes-nous ?</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          KuakuMarket sélectionne pour vous les meilleures marques de
          dermatologie et de parapharmacie — ACM, Biolane, CeraVe, Cumlaude,
          GUM, La Roche-Posay — livrées où que vous soyez au Cameroun.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ValueCard
          icon={<Sparkles className="h-5 w-5" strokeWidth={2} />}
          title="Produits authentiques"
          text="Toutes nos marques sont sélectionnées directement auprès de laboratoires reconnus."
        />
        <ValueCard
          icon={<Truck className="h-5 w-5" strokeWidth={2} />}
          title="Livraison locale"
          text="Points de retrait et livraison à domicile, avec paiement à la livraison disponible."
        />
        <ValueCard
          icon={<ShieldCheck className="h-5 w-5" strokeWidth={2} />}
          title="Conseils fiables"
          text="Chaque fiche produit précise zone d'application, type de peau et précautions d'usage."
        />
      </div>

      <div className="mt-10 rounded-md2 bg-blush p-6 text-center">
        <p className="text-sm text-ink-soft">
          Une question avant de commander ?{" "}
          <Link href="/contact" className="font-bold text-rose-deep underline">
            Contactez-nous
          </Link>
          {settings.whatsapp && " ou écrivez-nous directement sur WhatsApp."}
        </p>
      </div>
    </div>
  )
}

function ValueCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="glass rounded-md2 p-5 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-rose-soft text-rose-deep">
        {icon}
      </span>
      <p className="mt-3 font-bold text-ink">{title}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{text}</p>
    </div>
  )
}
