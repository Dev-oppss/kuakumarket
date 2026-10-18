"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { sdk } from "@/lib/medusa"
import { getCurrentCustomer } from "@/lib/auth"
import ReceiptSheets from "@/components/ReceiptSheet"
import { downloadReceiptPdf } from "@/lib/receipt-pdf"

const STEPS = [
  { key: "nouvelle", label: "Commande reçue" },
  { key: "confirmee", label: "Confirmée" },
  { key: "preparation", label: "En préparation" },
  { key: "expedition", label: "En livraison" },
  { key: "livree", label: "Livrée" },
]

const EXCEPTIONS: Record<string, string> = {
  annulee: "Cette commande a été annulée.",
  echec: "Un problème est survenu avec cette commande.",
  retour: "Cette commande a été retournée.",
}

type Tracking = {
  delivery_stage: { stage: string; note: string | null; updated_at: string } | null
  delivery_point: { name: string; city: string; fee: number; estimated_delay: string | null } | null
  payment_method: string | null
}

/**
 * Suivi de commande + reçu (papier à en-tête KuakuMarket, A4) à voir, imprimer
 * ou télécharger en PDF. Le suivi montre où en est la commande étape par étape avec la
 * date de dernière mise à jour, pour que la cliente voie que ça avance
 * réellement — le but est d'éviter l'impression d'arnaque.
 */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const autoDownloaded = useRef(false)

  const download = useCallback(async (o: any) => {
    setDownloading(true)
    try {
      await downloadReceiptPdf(o.display_id)
    } catch {
      // Repli : la boîte d'impression permet aussi "Enregistrer en PDF".
      window.print()
    } finally {
      setDownloading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      const customer = await getCurrentCustomer()
      if (!customer) {
        router.replace(`/compte?redirect=/compte/commandes/${id}`)
        return
      }
      try {
        const [{ order }, tracking] = await Promise.all([
          sdk.store.order.retrieve(id, {
            fields:
              "id,display_id,created_at,email,total,subtotal,shipping_total,metadata,*items,*shipping_address",
          }),
          sdk.client.fetch<Tracking>(`/store/orders/${id}/delivery-stage`),
        ])
        setOrder(order)
        setTracking(tracking)
      } catch {
        setNotFound(true)
      }
    })()
  }, [id, router])

  // Arrivée depuis l'écran de confirmation : #recu fait défiler jusqu'au reçu,
  // ?telecharger=1 lance directement le téléchargement du PDF.
  useEffect(() => {
    if (!order) return
    if (window.location.hash === "#recu") {
      document.getElementById("recu")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
    if (new URLSearchParams(window.location.search).get("telecharger") === "1" && !autoDownloaded.current) {
      autoDownloaded.current = true
      // laisse le temps aux images (fond, logo) de se charger avant la capture
      setTimeout(() => download(order), 800)
    }
  }, [order, download])

  if (notFound) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-ink-soft">Commande introuvable.</p>
        <Link href="/compte" className="mt-4 inline-block font-bold text-rose-deep underline">
          Retour à mon compte
        </Link>
      </div>
    )
  }
  if (!order) return null

  const stage = tracking?.delivery_stage?.stage ?? "nouvelle"
  const currentIndex = STEPS.findIndex((s) => s.key === stage)
  const exception = EXCEPTIONS[stage]
  const addr = order.shipping_address

  return (
    <div className="recu-print-root mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href="/compte" className="text-sm font-bold text-rose-deep">← Mes commandes</Link>
        <div className="flex gap-2">
          <button
            onClick={() => download(order)}
            disabled={downloading}
            className="rounded-full bg-rose px-5 py-2.5 text-sm font-bold text-white shadow-glow transition-all hover:bg-teal active:scale-95 disabled:opacity-60"
          >
            {downloading ? "Préparation…" : "Télécharger le reçu (PDF)"}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-full border border-rose px-4 py-2.5 text-sm font-bold text-rose-deep transition-all hover:bg-rose-soft active:scale-95"
          >
            Imprimer
          </button>
        </div>
      </div>

      {/* SUIVI */}
      <section className="no-print glass mb-6 rounded-lg2 p-6">
        <h2 className="font-display text-xl">Suivi de la commande #{order.display_id}</h2>
        {exception ? (
          <p className="mt-4 rounded-lg bg-rose-soft px-3.5 py-2.5 text-sm font-semibold text-rose-deep">
            {exception}
            {tracking?.delivery_stage?.note ? ` ${tracking.delivery_stage.note}` : ""}
          </p>
        ) : (
          <ol className="mt-5">
            {STEPS.map((s, i) => {
              const done = i <= currentIndex
              return (
                <li key={s.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        done ? "bg-rose text-white" : "bg-rose-soft/60 text-ink-soft"
                      }`}
                    >
                      {done ? "✓" : ""}
                    </span>
                    {i < STEPS.length - 1 && (
                      <span className={`w-0.5 flex-1 ${i < currentIndex ? "bg-rose" : "bg-rose-soft"}`} style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <p className={`pb-5 text-sm ${i === currentIndex ? "font-bold text-ink" : done ? "text-ink" : "text-ink-soft"}`}>
                    {s.label}
                    {i === currentIndex && tracking?.delivery_stage?.updated_at && (
                      <span className="ml-2 text-xs font-normal text-ink-soft">
                        · mis à jour le {new Date(tracking.delivery_stage.updated_at).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </p>
                </li>
              )
            })}
          </ol>
        )}
        <p className="mt-2 text-xs text-ink-soft">
          Une question ?{" "}
          <Link href="/contact" className="font-bold text-rose-deep underline">Contactez-nous</Link>
        </p>
      </section>

      {/* REÇU */}
      <section id="recu" className="scroll-mt-24">
        <ReceiptSheets order={order} tracking={tracking} />
      </section>
    </div>
  )
}
