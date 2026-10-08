import {
  fetchHomepageContent,
  fetchBestsellerIds,
  fetchProductsByIds,
  fetchCategories,
  fetchBrands,
} from "@/lib/medusa"
import ZonePills from "@/components/ZonePills"
import PromoBanner from "@/components/PromoBanner"
import TrustStrip from "@/components/TrustStrip"
import HeroCarousel from "@/components/HeroCarousel"
import ProductSection from "@/components/ProductSection"
import CategoryGrid from "@/components/CategoryGrid"
import BrandGrid from "@/components/BrandGrid"
import Link from "next/link"

export const revalidate = 60

export default async function HomePage() {
  const [homepage, bestsellerIds, topRatedIds, categories, brands] = await Promise.all([
    fetchHomepageContent(),
    fetchBestsellerIds("sales", 8),
    fetchBestsellerIds("rating", 8),
    fetchCategories(),
    fetchBrands(),
  ])

  const [bestsellers, topRated, featured] = await Promise.all([
    fetchProductsByIds(bestsellerIds),
    fetchProductsByIds(topRatedIds),
    fetchProductsByIds(homepage.featured_product_ids),
  ])

  return (
    <div className="pb-16">
      <HeroCarousel slides={homepage.hero_slides} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 md:px-10">
        <div className="mb-7 flex items-end justify-between">
          <h2 className="font-display text-2xl">
            Parcourir par <span className="italic text-rose">zone d'application</span>
          </h2>
        </div>
        <ZonePills />
      </section>

      <ProductSection title="Nos" highlight="indispensables" products={featured} />

      <ProductSection title="Nos produits les plus" highlight="populaires" products={bestsellers} />

      <section className="py-6">
        <PromoBanner promos={homepage.promo_slides} />
      </section>

      <ProductSection title="Les mieux" highlight="notés" products={topRated} />

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 md:px-10">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl">
                Un besoin <span className="italic text-rose">particulier ?</span>
              </h2>
              <p className="mt-1 text-sm text-ink-soft">Cliquez sur une catégorie pour voir ses produits</p>
            </div>
            <Link href="/catalogue" className="text-sm font-bold text-rose-deep transition-transform hover:translate-x-0.5">
              Tout voir ›
            </Link>
          </div>
          <CategoryGrid categories={categories} />
        </section>
      )}

      {brands.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 md:px-10">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl">
                Nos <span className="italic text-rose">marques</span>
              </h2>
              <p className="mt-1 text-sm text-ink-soft">Cliquez sur une marque pour voir ses produits</p>
            </div>
            <Link href="/catalogue" className="text-sm font-bold text-rose-deep transition-transform hover:translate-x-0.5">
              Tout voir ›
            </Link>
          </div>
          <BrandGrid brands={brands} />
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 md:px-10">
        <h2 className="mb-7 font-display text-2xl">
          Pourquoi <span className="italic text-rose">KuakuMarket</span>
        </h2>
        <TrustStrip />
      </section>
    </div>
  )
}
