import Link from "next/link"
import { notFound } from "next/navigation"
import { sdk, fetchBeautyAttributes, fetchReviewSummary, getRegionId } from "@/lib/medusa"
import { formatFCFA } from "@/lib/format"
import ProductGallery from "@/components/ProductGallery"
import AttributeChips from "@/components/AttributeChips"
import PurchasePanel from "@/components/PurchasePanel"
import ProductTabs from "@/components/ProductTabs"
import ReviewsSection from "@/components/ReviewsSection"

export const revalidate = 60

async function getProduct(handle: string) {
  try {
    const region_id = await getRegionId()
    const { products } = await sdk.store.product.list({
      handle,
      limit: 1,
      region_id,
    })
    return products[0] ?? null
  } catch {
    return null
  }
}

const USAGE_MODE_LABELS: Record<string, string> = {
  application_directe: "Application directe",
  dilution: "Dilution",
  melange: "Mélange avec un autre produit",
  apres_un_autre_produit: "Après un autre produit",
  seul: "Seul, sans autre produit",
}

export default async function ProductPage({
  params,
}: {
  // Next.js 15 : params est maintenant une Promise, même chose que pour
  // searchParams dans la page catalogue.
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)
  if (!product) notFound()

  const beautyAttributes = await fetchBeautyAttributes(product.id)
  const reviewSummary = await fetchReviewSummary(product.id)
  const variant = product.variants?.[0]
  const price = variant?.calculated_price?.calculated_amount ?? 0
  const originalPrice = variant?.calculated_price?.original_amount
  const hasPromo = originalPrice && originalPrice !== price
  const promoPercent = hasPromo
    ? Math.round((1 - price / originalPrice!) * 100)
    : null

  const images = (product.images ?? [])
    .map((img: any) => img.url)
    .filter(Boolean) as string[]

  const chips = [
    beautyAttributes?.application_zone?.length && {
      label: "Zone",
      value: beautyAttributes.application_zone.join(", "),
    },
    beautyAttributes?.usage_time?.length && {
      label: "Moment",
      value: beautyAttributes.usage_time.join(", "),
    },
    beautyAttributes?.usage_mode && {
      label: "Mode",
      value: USAGE_MODE_LABELS[beautyAttributes.usage_mode] ?? beautyAttributes.usage_mode,
    },
    beautyAttributes?.skin_type?.length && {
      label: "Peau",
      value: beautyAttributes.skin_type.join(", "),
    },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 md:px-10">
      <p className="text-xs text-ink-soft">
        <Link href="/" className="hover:text-ink">
          Accueil
        </Link>{" "}
        /{" "}
        <Link href="/catalogue" className="hover:text-ink">
          Catalogue
        </Link>{" "}
        / <span className="font-semibold text-ink">{product.title}</span>
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 md:mt-6 md:gap-10 lg:grid-cols-2 lg:gap-12">
        <ProductGallery images={images} title={product.title} />

        <div>
          {product.collection?.title && (
            <p className="text-xs font-bold text-teal">
              {product.collection.title}
            </p>
          )}
          <h1 className="mt-1.5 font-display text-2xl leading-tight sm:text-3xl">
            {product.title}
          </h1>

          <p className="mt-3 text-xs text-ink-soft">
            Aucun avis pour le moment
          </p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold text-ink sm:text-3xl">
              {formatFCFA(price)}
            </span>
            {hasPromo && (
              <>
                <span className="text-base text-ink-soft line-through">
                  {formatFCFA(originalPrice!)}
                </span>
                <span className="rounded-lg bg-rose-soft px-2.5 py-1 text-xs font-extrabold text-rose-deep">
                  -{promoPercent}%
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink-soft">
              {product.description}
            </p>
          )}

          <AttributeChips items={chips} />

          <PurchasePanel variantId={variant?.id ?? null} productId={product.id} productTitle={product.title} />

          <div className="mt-6 rounded-xl bg-blush px-4 py-3 text-xs text-ink-soft">
            Livré à Douala et Yaoundé · Paiement MoMo, Orange Money ou à la
            livraison
          </div>
        </div>
      </div>

      <ProductTabs
        tabs={[
          {
            label: "Caractéristiques",
            content: (
              <table className="w-full max-w-xl border-collapse text-sm">
                <tbody>
                  <SpecRow label="Contenance" value={beautyAttributes?.net_content} />
                  <SpecRow
                    label="Type de peau"
                    value={beautyAttributes?.skin_type?.join(", ")}
                  />
                  <SpecRow
                    label="Zone d'application"
                    value={beautyAttributes?.application_zone?.join(", ")}
                  />
                  <SpecRow
                    label="Moment recommandé"
                    value={beautyAttributes?.usage_time?.join(", ")}
                  />
                  <SpecRow label="Ingrédients" value={beautyAttributes?.ingredients} />
                </tbody>
              </table>
            ),
          },
          {
            label: "Précautions",
            content: (
              <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
                {beautyAttributes?.precautions ||
                  "Aucune précaution particulière renseignée pour ce produit."}
              </p>
            ),
          },
          {
            label: "Livraison & retours",
            content: (
              <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
                Livraison à Douala et Yaoundé. Retours acceptés sous 7 jours
                pour tout produit non ouvert.
              </p>
            ),
          },
          {
            label: `Avis clients (${reviewSummary.count})`,
            content: <ReviewsSection productId={product.id} />,
          },
        ]}
      />
    </div>
  )
}

function SpecRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <tr className="border-b border-rose-soft/60">
      <td className="w-2/5 py-3 pr-3 align-top text-ink-soft sm:w-56">{label}</td>
      <td className="py-3 align-top font-semibold">{value}</td>
    </tr>
  )
}
