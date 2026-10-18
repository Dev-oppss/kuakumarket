"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  getCart,
  updateLineItemQuantity,
  removeLineItem,
} from "@/lib/cart"
import { getCurrentCustomer } from "@/lib/auth"
import { formatFCFA } from "@/lib/format"

export default function PanierPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  const load = async () => {
    const c = await getCart()
    setCart(c)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const handleQtyChange = async (lineId: string, quantity: number) => {
    if (!cart || quantity < 1) return
    await updateLineItemQuantity(cart.id, lineId, quantity)
    load()
  }

  const handleRemove = async (lineId: string) => {
    if (!cart) return
    await removeLineItem(cart.id, lineId)
    load()
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    const customer = await getCurrentCustomer()
    if (!customer) {
      // Compte obligatoire pour commander (décidé dans la spec technique) :
      // on renvoie vers la connexion, avec retour automatique ici ensuite.
      router.push("/compte?redirect=/commande")
      return
    }
    router.push("/commande")
  }

  if (loading) return null

  const items = cart?.items ?? []
  const isEmpty = items.length === 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 md:px-10">
      <p className="text-xs text-ink-soft">
        <Link href="/" className="hover:text-teal">
          Accueil
        </Link>{" "}
        / <span className="font-semibold text-ink">Panier</span>
      </p>

      <h1 className="mt-3 font-display text-3xl">
        Votre panier{" "}
        {!isEmpty && (
          <span className="text-lg font-normal text-ink-soft">
            ({items.length} article{items.length > 1 ? "s" : ""})
          </span>
        )}
      </h1>

      {isEmpty ? (
        <div className="mt-10 rounded-md2 bg-blush p-12 text-center">
          <p className="text-ink-soft">Votre panier est vide pour l'instant.</p>
          <Link
            href="/catalogue"
            className="mt-5 inline-block rounded-full bg-rose px-7 py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-105 hover:bg-teal active:scale-95"
          >
            Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <div>
            <AnimatePresence>
              {items.map((item: any) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-teal mb-3 flex flex-wrap items-center gap-x-3 gap-y-3 rounded-md2 p-3 sm:mb-4 sm:flex-nowrap sm:gap-4 sm:p-4"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20 bg-gradient-to-br from-rose-soft to-teal-soft">
                    {item.thumbnail && (
                      <Image
                        src={item.thumbnail}
                        alt={item.product_title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-ink">
                      {item.product_title}
                    </h3>
                    {item.variant_title && (
                      <p className="text-xs text-ink-soft">{item.variant_title}</p>
                    )}
                    <p className="mt-1 text-xs text-ink-soft">
                      {formatFCFA(item.unit_price)} l'unité
                    </p>
                  </div>

                  <div className="order-3 flex items-center rounded-full border-2 border-rose-soft sm:order-none">
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                      className="h-10 w-10 text-sm sm:h-9 sm:w-8 sm:text-sm font-bold text-ink transition-colors hover:text-teal"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                      className="h-10 w-10 text-sm sm:h-9 sm:w-8 sm:text-sm font-bold text-ink transition-colors hover:text-teal"
                    >
                      +
                    </button>
                  </div>

                  <span className="order-4 ml-auto text-right font-display font-semibold sm:order-none sm:ml-0 sm:w-24">
                    {formatFCFA(item.unit_price * item.quantity)}
                  </span>

                  <button
                    onClick={() => handleRemove(item.id)}
                    aria-label="Retirer du panier"
                    className="order-2 flex h-11 w-11 items-center justify-center text-xl text-ink-soft transition-colors hover:text-rose-deep sm:order-none sm:h-auto sm:w-auto sm:text-lg"
                  >
                    ×
                  </button>
                  {/* force le retour à la ligne sur mobile : quantité + prix sur la 2e ligne */}
                  <div className="order-2 basis-full sm:hidden" aria-hidden="true" />
                </motion.div>
              ))}
            </AnimatePresence>

            <Link
              href="/catalogue"
              className="mt-2 inline-block text-sm font-bold text-rose-deep transition-colors hover:text-teal"
            >
              ‹ Continuer mes achats
            </Link>
          </div>

          <div className="glass h-fit rounded-md2 p-6">
            <h3 className="font-display text-lg">Récapitulatif</h3>
            <div className="mt-4 flex justify-between text-sm text-ink-soft">
              <span>Sous-total</span>
              <span>{formatFCFA(cart.item_subtotal ?? cart.subtotal ?? 0)}</span>
            </div>
            <div className="mt-2.5 flex justify-between text-sm text-ink-soft">
              <span>Livraison</span>
              <span>Confirmée par WhatsApp</span>
            </div>
            <div className="mt-6 flex justify-between border-t border-rose-soft pt-4 text-base font-extrabold">
              <span>Total</span>
              <span>{formatFCFA(cart.total ?? cart.item_subtotal ?? 0)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-6 w-full rounded-full bg-rose py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-[1.02] hover:bg-teal active:scale-95 disabled:opacity-60"
            >
              Passer la commande
            </button>
            <Link
              href="/catalogue"
              className="mt-2.5 block w-full rounded-full border-2 border-rose-soft py-3 text-center text-sm font-bold text-ink transition-colors hover:border-rose"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
