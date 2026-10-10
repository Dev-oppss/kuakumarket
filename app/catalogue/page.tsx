import { Suspense } from "react"
import { sdk, getRegionId, fetchCategories, fetchBrands, searchProducts } from "@/lib/medusa"
import FilterSidebar from "@/components/FilterSidebar"
import FiltersPanel from "@/components/FiltersPanel"
import CatalogueGrid from "@/components/CatalogueGrid"
import { ProductCardData } from "@/components/ProductCard"

// Page de filtres : chaque URL (?categorie=, ?marque=, ?prix=, ?recherche=)
// doit toujours renvoyer des données fraîches, jamais une version mise en
// cache d'un autre filtre — contrairement à l'accueil, qui change peu et
// peut se permettre un cache de 60s.
export const dynamic = "force-dynamic"
export const revalidate = 0

async function resolveCategoryId(name?: string) {
  if (!name) return undefined
  try {
    // L'API Store ne filtre pas les catégories par "name" (400 sur ce
    // champ) : on liste et on compare nous-mêmes, comme pour l'import.
    const { product_categories } = await sdk.store.category.list({
      limit: 100,
      fields: "id,name",
    })
    return product_categories.find(
      (c: any) => c.name.trim().toLowerCase() === name.trim().toLowerCase()
    )?.id
  } catch {
    return undefined
  }
}

function mapProduct(p: any): ProductCardData {
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

function parsePriceRange(prix?: string): { min?: number; max?: number } {
  if (!prix) return {}
  const [minStr, maxStr] = prix.split("-")
  return {
    min: minStr ? Number(minStr) : undefined,
    max: maxStr ? Number(maxStr) : undefined,
  }
}

async function getProducts(
  categoryId?: string,
  q?: string,
  brandName?: string,
  categoryName?: string,
  prix?: string
) {
  try {
    const { min, max } = parsePriceRange(prix)
    // "Marque" et "Prix" n'ont pas d'équivalent dans product.list de
    // Medusa (pas de brand_id ni de filtre prix côté API Store) : on
    // sur-récupère puis on filtre nous-mêmes sur les vraies données
    // renvoyées par Medusa (jamais sur un prix venant de Meilisearch, qui
    // peut être temporairement désynchronisé).
    //
    // La limite de sur-récupération doit couvrir TOUT le catalogue, sinon
    // une marque dont les produits tombent après cette limite (selon
    // l'ordre renvoyé par Medusa) semble vide alors qu'elle existe — bug
    // réel rencontré une fois le catalogue passé ~150 à plus de 500
    // produits avec l'ancienne limite de 100. 1000 couvre large pour
    // l'instant ; au-delà, il faudra un vrai filtre côté serveur
    // (Meilisearch, déjà prêt pour la marque, ou un filtre natif Medusa).
    const needsOverfetch = Boolean(brandName || min != null || max != null)
    const { products, count } = await searchProducts({
      limit: needsOverfetch ? 1000 : 12,
      categoryId,
      categoryName,
      q,
    })
    let mapped = products.map(mapProduct)
    let total = count
    if (brandName) {
      mapped = mapped.filter((p: ProductCardData) => p.brand === brandName)
    }
    if (min != null) mapped = mapped.filter((p: ProductCardData) => p.price >= min)
    if (max != null) mapped = mapped.filter((p: ProductCardData) => p.price <= max)
    if (needsOverfetch) total = mapped.length
    return { products: mapped, count: total, localPaging: needsOverfetch }
  } catch {
    return { products: [] as ProductCardData[], count: 0, localPaging: false }
  }
}

export default async function CataloguePage({
  searchParams,
}: {
  // Next.js 15 : searchParams est maintenant une Promise, il faut l'attendre
  // avant de lire ses propriétés.
  searchParams: Promise<{ categorie?: string; recherche?: string; marque?: string; prix?: string }>
}) {
  const { categorie, recherche, marque, prix } = await searchParams
  const [categoryId, categories, brands] = await Promise.all([
    resolveCategoryId(categorie),
    fetchCategories(),
    fetchBrands(),
  ])
  const { products, count, localPaging } = await getProducts(categoryId, recherche, marque, categorie, prix)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 md:px-10">
      <p className="text-xs text-ink-soft">
        <a href="/" className="hover:text-ink">
          Accueil
        </a>{" "}
        / <span className="font-semibold text-ink">Catalogue</span>
      </p>

      <div className="mb-5 mt-3 md:mb-8">
        <h1 className="font-display text-2xl sm:text-3xl">
          {marque ?? categorie ?? "Tout le catalogue"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {count} produit{count > 1 ? "s" : ""} affiché
          {count > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-[220px_1fr] md:gap-8 lg:grid-cols-[240px_1fr]">
        <FiltersPanel>
          <Suspense fallback={null}>
            <FilterSidebar categories={categories} brands={brands} />
          </Suspense>
        </FiltersPanel>
        <CatalogueGrid
          initialProducts={products}
          initialCount={count}
          categoryId={categoryId}
          regionId={await getRegionId()}
          q={recherche}
          localPaging={localPaging}
        />
      </div>
    </div>
  )
}
