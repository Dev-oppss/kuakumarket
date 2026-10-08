import Link from "next/link"
import Carousel from "./Carousel"
import ProductCard, { type ProductCardData } from "./ProductCard"

/**
 * Bloc "titre + lien voir tout + carrousel de produits", réutilisé pour
 * Populaires / Mieux notés / Indispensables sur l'accueil. Ne s'affiche
 * pas du tout si la liste est vide (pas de section creuse affichée).
 */
export default function ProductSection({
  title,
  highlight,
  products,
  seeAllHref = "/catalogue",
}: {
  title: string
  highlight?: string
  products: ProductCardData[]
  seeAllHref?: string
}) {
  if (products.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-10">
      <div className="mb-7 flex items-end justify-between">
        <h2 className="font-display text-2xl">
          {title} {highlight && <span className="italic text-rose">{highlight}</span>}
        </h2>
        <Link
          href={seeAllHref}
          className="text-sm font-bold text-rose-deep transition-transform hover:translate-x-0.5"
        >
          Voir tout le catalogue ›
        </Link>
      </div>
      <Carousel slideClassName="basis-[78%] sm:basis-[45%] lg:basis-[24%] pr-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </Carousel>
    </section>
  )
}
