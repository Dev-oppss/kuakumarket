"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { sdk } from "@/lib/medusa"
import { getCurrentCustomer } from "@/lib/auth"
import { formatFCFA } from "@/lib/format"

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

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: "Paiement à la livraison",
  in_store: "Paiement en boutique",
}

type Tracking = {
  delivery_stage: { stage: string; note: string | null; updated_at: string } | null
  delivery_point: { name: string; city: string; fee: number; estimated_delay: string | null } | null
  payment_method: string | null
}

/**
 * Suivi de commande + reçu imprimable (Ctrl+P / bouton → "Enregistrer en
 * PDF"). Le suivi montre où en est la commande étape par étape avec la
 * date de dernière mise à jour, pour que la cliente voie que ça avance
 * réellement — le but est d'éviter l'impression d'arnaque.
 */
export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [tracking, setTracking] = useState<Tracking | null>(null)
  const [notFound, setNotFound] = useState(false)

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
              "id,display_id,created_at,email,total,subtotal,shipping_total,*items,*shipping_address",
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
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="no-print mb-6 flex items-center justify-between">
        <Link href="/compte" className="text-sm font-bold text-rose-deep">← Mes commandes</Link>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-rose px-5 py-2.5 text-sm font-bold text-white shadow-glow transition-all hover:bg-teal active:scale-95"
        >
          Imprimer / enregistrer le reçu
        </button>
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
      <section className="glass rounded-lg2 p-6 print:rounded-none print:bg-white print:shadow-none">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl">KuakuMarket</h1>
            <p className="text-xs text-ink-soft">Reçu de commande</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold text-ink">Commande #{order.display_id}</p>
            <p className="text-xs text-ink-soft">{new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs font-bold uppercase text-ink-soft">Client</p>
            <p>{[addr?.first_name, addr?.last_name].filter(Boolean).join(" ") || order.email}</p>
            <p className="text-ink-soft">{order.email}</p>
            {addr?.phone && <p className="text-ink-soft">{addr.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-ink-soft">Livraison</p>
            {tracking?.delivery_point ? (
              <>
                <p>{tracking.delivery_point.name}</p>
                <p className="text-ink-soft">{tracking.delivery_point.city}</p>
              </>
            ) : (
              <p className="text-ink-soft">—</p>
            )}
            {addr?.address_1 && <p className="text-ink-soft">{addr.address_1}</p>}
          </div>
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-rose-soft text-left text-xs uppercase text-ink-soft">
              <th className="py-2">Article</th>
              <th className="py-2 text-center">Qté</th>
              <th className="py-2 text-right">Prix unitaire</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).map((it: any) => (
              <tr key={it.id} className="border-b border-rose-soft/50">
                <td className="py-2.5 pr-2">{it.title}</td>
                <td className="py-2.5 text-center">{it.quantity}</td>
                <td className="py-2.5 text-right">{formatFCFA(it.unit_price)}</td>
                <td className="py-2.5 text-right">{formatFCFA(it.unit_price * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-full max-w-xs text-sm">
          <Row label="Sous-total" value={formatFCFA(order.subtotal ?? 0)} />
          <Row label="Livraison" value={formatFCFA(order.shipping_total ?? tracking?.delivery_point?.fee ?? 0)} />
          <div className="mt-1 flex justify-between border-t border-ink pt-2 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatFCFA(order.total)}</span>
          </div>
        </div>

        <p className="mt-6 rounded-lg bg-blush px-3.5 py-2.5 text-xs text-ink-soft print:border print:border-rose-soft print:bg-white">
          {PAYMENT_LABELS[tracking?.payment_method ?? ""] ?? "Paiement"} — montant à régler :{" "}
          <span className="font-bold text-ink">{formatFCFA(order.total)}</span>. Ce reçu confirme votre
          commande ; il ne vaut pas facture fiscale.
        </p>
      </section>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-ink-soft">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
