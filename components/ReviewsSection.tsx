"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/medusa"
import { getCurrentCustomer } from "@/lib/auth"

type Review = {
  id: string
  customer_name: string
  rating: number
  comment: string | null
  verified_purchase: boolean
  created_at: string
}

/**
 * Onglet "Avis clients" de la fiche produit. Seuls les avis approuvés par
 * la propriétaire (modération côté admin) apparaissent ici — voir
 * GET /store/reviews côté backend.
 */
export default function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [average, setAverage] = useState(0)
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [customer, setCustomer] = useState<any>(null)

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const load = () => {
    sdk.client
      .fetch<{ reviews: Review[]; average: number; count: number }>(
        `/store/reviews?product_id=${productId}`
      )
      .then((res) => {
        setReviews(res.reviews)
        setAverage(res.average)
        setCount(res.count)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    getCurrentCustomer().then(setCustomer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const res = await sdk.client.fetch<{ message: string }>("/store/reviews", {
        method: "POST",
        body: { product_id: productId, rating, comment: comment || undefined },
      })
      setFeedback(res.message)
      setComment("")
      setRating(5)
      load() // recharge la liste — l'avis, s'il est publié, apparaît tout de suite
    } catch (err: any) {
      // Le cas le plus fréquent : la cliente n'a pas acheté ce produit
      // (403, message explicite renvoyé par le backend).
      setFeedback(
        err?.message?.includes("acheté")
          ? err.message
          : "Une erreur est survenue. Réessaie plus tard."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      {!loading && count > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <Stars value={average} size="lg" />
          <span className="font-display text-lg font-semibold text-ink">
            {average.toFixed(1)}
          </span>
          <span className="text-sm text-ink-soft">
            ({count} avis{count > 1 ? "" : ""})
          </span>
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <div className="mb-6 rounded-md2 bg-blush p-8 text-center">
          <p className="text-sm text-ink-soft">
            Aucun avis pour le moment. Les avis affichés ici viendront de
            clientes ayant laissé leur retour après réception.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-md2 bg-blush p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink">{r.customer_name}</span>
                {r.verified_purchase && (
                  <span className="rounded-full bg-teal-soft px-2 py-0.5 text-[0.65rem] font-bold text-teal">
                    Achat vérifié
                  </span>
                )}
              </div>
              <span className="text-xs text-ink-soft">
                {new Date(r.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <Stars value={r.rating} size="sm" />
            {r.comment && (
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.comment}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-rose-soft pt-6">
        {customer ? (
          <form onSubmit={handleSubmit}>
            <h4 className="mb-3 text-sm font-bold text-ink">Laisser un avis</h4>
            <div className="mb-3 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-label={`${n} étoiles`}
                  className={`flex h-9 w-9 items-center justify-center text-xl ${
                    n <= rating ? "text-rose" : "text-rose-soft"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ton avis (facultatif)"
              rows={3}
              className="w-full rounded-xl border-2 border-rose-soft bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 rounded-full bg-rose px-6 py-2.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-105 hover:bg-teal active:scale-95 disabled:opacity-60"
            >
              {submitting ? "Envoi…" : "Envoyer mon avis"}
            </button>
            {feedback && <p className="mt-3 text-sm text-ink-soft">{feedback}</p>}
          </form>
        ) : (
          <p className="text-sm text-ink-soft">
            <a href="/compte" className="font-bold text-rose-deep underline">
              Connecte-toi
            </a>{" "}
            pour laisser un avis sur ce produit.
          </p>
        )}
      </div>
    </div>
  )
}

function Stars({ value, size }: { value: number; size: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-xl" : "text-sm"
  return (
    <div className={`flex gap-0.5 ${cls}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(value) ? "text-rose" : "text-rose-soft"}>
          ★
        </span>
      ))}
    </div>
  )
}
