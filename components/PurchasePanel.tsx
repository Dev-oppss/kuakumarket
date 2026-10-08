"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addToCart } from "@/lib/cart"
import { track } from "@/lib/track"

export default function PurchasePanel({
  variantId,
  productId,
  productTitle,
}: {
  variantId: string | null
  productId: string
  productTitle: string
}) {
  const [qty, setQty] = useState(1)
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle"
  )

  const handleAdd = async () => {
    if (!variantId) return
    setStatus("loading")
    try {
      await addToCart(variantId, qty)
      track("add_to_cart", { target: productTitle, productId })
      setStatus("done")
      setTimeout(() => setStatus("idle"), 2500)
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="mt-6 flex items-stretch gap-3 sm:mt-7 sm:gap-3.5">
      <div className="flex items-center rounded-full border-2 border-rose-soft">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-12 w-10 text-lg font-bold text-ink transition-colors hover:text-teal"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-bold">{qty}</span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="h-12 w-10 text-lg font-bold text-ink transition-colors hover:text-teal"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAdd}
        disabled={!variantId || status === "loading"}
        className="relative min-h-12 flex-1 overflow-hidden rounded-full bg-rose px-3 py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-[1.02] hover:bg-teal active:scale-95 disabled:opacity-60"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {status === "idle" && "Ajouter au panier"}
            {status === "loading" && "Ajout en cours…"}
            {status === "done" && "Ajouté ✓"}
            {status === "error" && "Réessayer"}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  )
}
