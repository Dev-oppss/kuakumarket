"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { searchProducts } from "@/lib/medusa"
import ProductCard, { ProductCardData } from "@/components/ProductCard"

const PAGE_SIZE = 12

export default function CatalogueGrid({
  initialProducts,
  initialCount,
  categoryId,
  regionId,
}: {
  initialProducts: ProductCardData[]
  initialCount: number
  categoryId?: string
  regionId: string
}) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)

  const hasMore = products.length < initialCount

  const loadMore = async () => {
    setLoading(true)
    try {
      const { products: next } = await searchProducts({
        limit: PAGE_SIZE,
        offset: products.length,
        categoryId,
      })
      setProducts((prev) => [
        ...prev,
        ...next.map((p: any) => ({
          id: p.id,
          handle: p.handle ?? p.id,
          title: p.title,
          thumbnail: p.thumbnail ?? null,
          category: p.categories?.[0]?.name,
          price: p.variants?.[0]?.calculated_price?.calculated_amount ?? 0,
          originalPrice:
            p.variants?.[0]?.calculated_price?.original_amount !==
            p.variants?.[0]?.calculated_price?.calculated_amount
              ? p.variants?.[0]?.calculated_price?.original_amount
              : null,
        })),
      ])
    } finally {
      setLoading(false)
    }
  }

  if (products.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        Aucun produit ici pour l'instant — le catalogue se remplit
        progressivement.
      </p>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-10 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="min-h-12 rounded-full border-2 border-ink px-8 py-3.5 text-sm font-bold text-ink transition-all hover:bg-ink hover:text-white disabled:opacity-50"
          >
            {loading ? "Chargement…" : "Voir plus de produits"}
          </button>
        </div>
      )}
    </div>
  )
}
