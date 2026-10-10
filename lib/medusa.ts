import Medusa from "@medusajs/js-sdk"
import type { ProductCardData } from "@/components/ProductCard"

export const sdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  // Sans ça, le SDK ne conserve aucun token entre deux appels : chaque
  // requête part "déconnectée", donc customer.create (juste après
  // auth.register) et tout appel authentifié suivant échouent.
  auth: { type: "jwt" },
})

/**
 * Attributs beauté d'un produit, exposés par la route store custom
 * (voir backend-addition/) — pas incluse par défaut dans l'API Store de
 * Medusa, contrairement aux champs natifs du produit.
 */
export type BeautyAttributes = {
  skin_type: string[] | null
  application_zone: string[] | null
  usage_time: string[] | null
  usage_mode: string | null
  compatible_with_ids: string[] | null
  incompatible_with_ids: string[] | null
  precautions: string | null
  side_effects: string | null
  ingredients: string | null
  net_content: string | null
}

export async function fetchBeautyAttributes(
  productId: string
): Promise<BeautyAttributes | null> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products/${productId}/beauty-attributes`,
    {
      headers: {
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      next: { revalidate: 60 },
    }
  )
  if (!res.ok) return null
  const { beauty_attributes } = await res.json()
  return beauty_attributes
}

/**
 * ID de la région "Afrique" (devise XAF), nécessaire pour que Medusa
 * calcule un prix (product.list) et pour créer un panier valide
 * (cart.create exige region_id). Mis en cache en mémoire — la région ne
 * change pas en cours d'exécution.
 *
 * Si tu ajoutes une deuxième région active pour le Cameroun, remplace le
 * filtre ci-dessous par une recherche explicite sur son nom ou son code
 * pays plutôt que "la première renvoyée".
 */
let cachedRegionId: string | null = null

export async function getRegionId(): Promise<string> {
  if (cachedRegionId) return cachedRegionId

  const { regions } = await sdk.store.region.list()
  const region =
    regions.find((r: any) => r.currency_code === "xaf") ?? regions[0]

  if (!region) {
    throw new Error(
      "Aucune région trouvée côté Medusa (Settings → Regions)."
    )
  }

  cachedRegionId = region.id
  return region.id
}


export type CategoryOption = { id: string; name: string }
export type BrandOption = { id: string; name: string }
export type DeliveryPoint = {
  id: string
  name: string
  city: string
  fee: number
  estimated_delay: string | null
}

/** Vraies catégories du catalogue, pour le filtre "Catégorie". */
export async function fetchCategories(): Promise<CategoryOption[]> {
  try {
    const { product_categories } = await sdk.store.category.list({
      limit: 100,
      fields: "id,name",
    })
    return product_categories
      .map((c: any) => ({ id: c.id, name: c.name }))
      .sort((a: CategoryOption, b: CategoryOption) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}

/**
 * Vraies marques du catalogue, pour le filtre "Marque" — via la route
 * custom /store/brands (voir store-addition/). Si cette route n'est pas
 * encore installée côté backend, l'appel échoue silencieusement et le
 * filtre "Marque" reste simplement masqué plutôt que de casser la page.
 */
export async function fetchBrands(): Promise<BrandOption[]> {
  try {
    const { brands } = await sdk.client.fetch<{ brands: BrandOption[] }>(
      "/store/brands"
    )
    return [...brands].sort((a, b) => a.name.localeCompare(b.name))
  } catch {
    return []
  }
}


/** Points de livraison actifs (module custom "delivery-point"). */
export async function fetchDeliveryPoints(): Promise<DeliveryPoint[]> {
  try {
    const { delivery_points } = await sdk.client.fetch<{
      delivery_points: DeliveryPoint[]
    }>("/store/delivery-points")
    return delivery_points
  } catch {
    return []
  }
}

/**
 * Point d'entrée unique pour la recherche catalogue (spec point 10) :
 * aujourd'hui un simple passe-plat vers product.list, mais en l'appelant
 * partout via cette fonction plutôt que sdk.store.product.list
 * directement, le passage à Meilisearch prévu à l'Étape 3 (09/10) sera un
 * remplacement du corps de cette seule fonction — pas une réécriture des
 * pages qui l'utilisent.
 */
// "+" = on AJOUTE ces champs à ceux renvoyés par défaut (prix, variantes…).
// Sans "+brand.*", Medusa ne renvoie jamais la marque (lien custom) et le
// filtre ?marque= trouve 0 produit.
const PRODUCT_FIELDS = "+brand.*,+categories.*"

export async function searchProducts(filters: {
  q?: string
  brandName?: string
  categoryId?: string
  categoryName?: string
  limit?: number
  offset?: number
}) {
  const region_id = await getRegionId()
  const limit = filters.limit ?? 12
  const offset = filters.offset ?? 0

  // Filtre marque : l'API Store ne renvoie pas la marque d'un produit, donc
  // on demande à notre route /store/brand-products les ids des produits de
  // cette marque, puis on redemande les vraies données (prix compris) à
  // Medusa avec ces ids.
  let brandIds: string[] | undefined
  if (filters.brandName) {
    const res = await sdk.client.fetch<{ product_ids: string[] }>(
      `/store/brand-products?marque=${encodeURIComponent(filters.brandName)}`
    )
    if (res.product_ids.length === 0) return { products: [] as any[], count: 0 }
    brandIds = res.product_ids
  }

  // Avec un texte de recherche : passe par Meilisearch (Étape 3) pour la
  // pertinence, puis redemande les données réelles (prix compris) à
  // Medusa avec les ids trouvés — jamais de prix affiché depuis l'index
  // de recherche, voir store/search/route.ts côté backend.
  if (filters.q && !brandIds) {
    try {
      const params = new URLSearchParams({
        q: filters.q,
        limit: String(limit),
        offset: String(offset),
      })
      if (filters.categoryName) params.set("categorie", filters.categoryName)

      const res = await sdk.client.fetch<{
        product_ids: string[]
        count: number
        meilisearch: boolean
      }>(`/store/search?${params.toString()}`)

      if (res.meilisearch) {
        if (res.product_ids.length === 0) {
          return { products: [] as any[], count: 0 }
        }
        const { products } = await sdk.store.product.list({
          id: res.product_ids,
          region_id,
          fields: PRODUCT_FIELDS,
          ...(filters.categoryId ? { category_id: [filters.categoryId] } : {}),
        })
        // product.list ne garantit pas l'ordre des ids passés en filtre :
        // on retrie sur le classement de pertinence renvoyé par Meilisearch.
        const order = new Map(res.product_ids.map((id, i) => [id, i]))
        const sorted = [...products].sort(
          (a: any, b: any) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
        )
        return { products: sorted, count: res.count }
      }
      // meilisearch: false → pas encore configuré, on retombe plus bas
      // sur le filtre "q" simple des Étapes 1/2.
    } catch {
      // /store/search indisponible pour une autre raison : même repli.
    }
  }

  return sdk.store.product.list({
    region_id,
    limit,
    offset,
    fields: PRODUCT_FIELDS,
    ...(brandIds ? { id: brandIds } : {}),
    ...(filters.categoryId ? { category_id: [filters.categoryId] } : {}),
    ...(filters.q ? { q: filters.q } : {}),
  })
}

/** Résumé des avis (moyenne + total) pour le libellé de l'onglet "Avis clients (N)". */
export async function fetchReviewSummary(
  productId: string
): Promise<{ average: number; count: number }> {
  try {
    const res = await sdk.client.fetch<{ average: number; count: number }>(
      `/store/reviews?product_id=${productId}`
    )
    return { average: res.average, count: res.count }
  } catch {
    return { average: 0, count: 0 }
  }
}

export type SiteSettings = {
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: string | null
  hours: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  banner_messages: string[] | null
}

const DEFAULT_BANNER = [
  "Livraison à Douala & Yaoundé",
  "Paiement MTN MoMo & Orange Money",
  "Paiement à la livraison disponible",
  "Support WhatsApp 7j/7",
]

/**
 * Coordonnées, réseaux sociaux et messages de bannière — modifiables
 * depuis l'admin (page "Réglages du site"), sans toucher au code. Des
 * valeurs par défaut s'appliquent tant que rien n'a été renseigné.
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const res = await sdk.client.fetch<{ settings: SiteSettings | null }>(
      "/store/site-settings"
    )
    return {
      phone: res.settings?.phone ?? null,
      whatsapp: res.settings?.whatsapp ?? null,
      email: res.settings?.email ?? null,
      address: res.settings?.address ?? null,
      hours: res.settings?.hours ?? null,
      instagram: res.settings?.instagram ?? null,
      facebook: res.settings?.facebook ?? null,
      tiktok: res.settings?.tiktok ?? null,
      banner_messages:
        res.settings?.banner_messages?.length ? res.settings.banner_messages : DEFAULT_BANNER,
    }
  } catch {
    return {
      phone: null, whatsapp: null, email: null, address: null, hours: null,
      instagram: null, facebook: null, tiktok: null, banner_messages: DEFAULT_BANNER,
    }
  }
}

export type HeroSlide = {
  image_url: string
  title?: string
  subtitle?: string
  cta_label?: string
  cta_href?: string
}
export type PromoSlide = {
  mode: "banner" | "poster"
  image_url?: string
  tone?: "rose" | "teal"
  title?: string
  text?: string
  cta?: string
  href: string
}

/** Contenu éditorial de l'accueil (carrousel, bannière, indispensables) — modifiable depuis l'admin. */
export async function fetchHomepageContent(): Promise<{
  hero_slides: HeroSlide[]
  promo_slides: PromoSlide[]
  featured_product_ids: string[]
}> {
  try {
    return await sdk.client.fetch("/store/homepage")
  } catch {
    return { hero_slides: [], promo_slides: [], featured_product_ids: [] }
  }
}

/** Ids des produits les plus vendus ou les mieux notés — jamais leur prix (voir /store/search). */
export async function fetchBestsellerIds(
  by: "sales" | "rating",
  limit = 8
): Promise<string[]> {
  try {
    const res = await sdk.client.fetch<{ product_ids: string[] }>(
      `/store/bestsellers?by=${by}&limit=${limit}`
    )
    return res.product_ids
  } catch {
    return []
  }
}

/** Récupère des produits par une liste d'ids, en conservant leur ordre. */
export async function fetchProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (ids.length === 0) return []
  const region_id = await getRegionId()
  const { products } = await sdk.store.product.list({
    id: ids,
    region_id,
    limit: ids.length,
    fields: PRODUCT_FIELDS,
  })
  const order = new Map(ids.map((id, i) => [id, i]))
  return [...products]
    .sort((a: any, b: any) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
    .map(mapStoreProduct)
}

function mapStoreProduct(p: any): ProductCardData {
  return {
    id: p.id,
    handle: p.handle ?? p.id,
    title: p.title,
    thumbnail: p.thumbnail ?? null,
    category: p.categories?.[0]?.name,
    brand: p.brand?.name,
    price: p.variants?.[0]?.calculated_price?.calculated_amount ?? 0,
    originalPrice:
      p.variants?.[0]?.calculated_price?.original_amount !==
      p.variants?.[0]?.calculated_price?.calculated_amount
        ? p.variants?.[0]?.calculated_price?.original_amount
        : null,
  }
}
