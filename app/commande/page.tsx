"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getCart, updateCartCheckoutInfo, listShippingOptions, addShippingMethod, initiateManualPayment, completeCart } from "@/lib/cart"
import { getCurrentCustomer } from "@/lib/auth"
import { fetchDeliveryPoints, type DeliveryPoint } from "@/lib/medusa"
import { formatFCFA } from "@/lib/format"

type Step = "infos" | "livraison" | "confirmation"

/**
 * Tunnel de commande en 3 étapes (spec point 8) : infos → livraison /
 * paiement → confirmation. Accessible uniquement connectée — le panier
 * fait déjà cette vérification avant de rediriger ici, mais on la refait
 * au chargement au cas où la cliente arrive directement sur /commande
 * (lien partagé, retour arrière du navigateur…).
 */
export default function CommandePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("infos")
  const [checking, setChecking] = useState(true)
  const [cart, setCart] = useState<any>(null)
  const [order, setOrder] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [infos, setInfos] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address_1: "",
    city: "",
  })

  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([])
  const [selectedPointId, setSelectedPointId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"cash_on_delivery" | "in_store">(
    "cash_on_delivery"
  )
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    ;(async () => {
      const [customer, c, points] = await Promise.all([
        getCurrentCustomer(),
        getCart(),
        fetchDeliveryPoints(),
      ])
      if (!customer) {
        router.replace("/compte?redirect=/commande")
        return
      }
      if (!c || (c.items ?? []).length === 0) {
        router.replace("/panier")
        return
      }
      setCart(c)
      setDeliveryPoints(points)
      setInfos((f) => ({
        ...f,
        email: customer.email ?? "",
        first_name: customer.first_name ?? "",
        last_name: customer.last_name ?? "",
        phone: customer.phone ?? "",
      }))
      setChecking(false)
    })()
  }, [router])

  const selectedPoint = deliveryPoints.find((p) => p.id === selectedPointId)

  const handleInfosSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep("livraison")
  }

  const handleConfirm = async () => {
    if (!cart || !selectedPointId) return
    setSubmitting(true)
    setError(null)
    try {
      await updateCartCheckoutInfo(cart.id, {
        ...infos,
        delivery_point_id: selectedPointId,
        country_code: "cm",
      })

      const options = await listShippingOptions(cart.id)
      if (options.length === 0) {
        throw new Error(
          "Aucune méthode d'expédition n'est configurée pour cette région (Settings → Shipping dans l'admin)."
        )
      }
      await addShippingMethod(cart.id, options[0].id)
      await initiateManualPayment(cart.id, paymentMethod)

      const { order: createdOrder, error: completeError } = await completeCart(cart.id)
      if (completeError) throw new Error(completeError)

      setOrder(createdOrder)
      setStep("confirmation")
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue. Réessayez.")
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      {step !== "confirmation" && (
        <ol className="mb-8 flex items-center justify-center gap-2 text-xs font-bold text-ink-soft">
          <StepDot active={step === "infos"} done={step === "livraison"} label="Infos" />
          <span className="h-px w-8 bg-rose-soft" />
          <StepDot active={step === "livraison"} done={false} label="Livraison" />
        </ol>
      )}

      {step === "infos" && (
        <form onSubmit={handleInfosSubmit} className="glass rounded-lg2 p-6 sm:p-8">
          <h1 className="font-display text-2xl">Vos informations</h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            Pré-remplies depuis votre compte — modifiez-les si besoin.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <Field label="Prénom" value={infos.first_name} onChange={(v) => setInfos((f) => ({ ...f, first_name: v }))} required />
            <Field label="Nom" value={infos.last_name} onChange={(v) => setInfos((f) => ({ ...f, last_name: v }))} required />
            <Field label="Email" type="email" value={infos.email} onChange={(v) => setInfos((f) => ({ ...f, email: v }))} required full />
            <Field label="Téléphone" type="tel" value={infos.phone} onChange={(v) => setInfos((f) => ({ ...f, phone: v }))} required full />
            <Field label="Adresse / quartier" value={infos.address_1} onChange={(v) => setInfos((f) => ({ ...f, address_1: v }))} required full />
            <Field label="Ville" value={infos.city} onChange={(v) => setInfos((f) => ({ ...f, city: v }))} required full />
          </div>
          <button type="submit" className="mt-7 w-full rounded-full bg-rose py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-[1.02] hover:bg-teal active:scale-95">
            Continuer vers la livraison
          </button>
        </form>
      )}

      {step === "livraison" && (
        <div className="glass rounded-lg2 p-6 sm:p-8">
          <h1 className="font-display text-2xl">Livraison et paiement</h1>

          <h2 className="mt-6 text-xs font-bold uppercase tracking-wide text-ink-soft">
            Point de livraison
          </h2>
          {deliveryPoints.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">
              Aucun point de livraison n'est configuré pour le moment.
            </p>
          ) : (
            <div className="mt-2.5 flex flex-col gap-2.5">
              {deliveryPoints.map((p) => (
                <label
                  key={p.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 px-4 py-3 text-sm transition-colors ${
                    selectedPointId === p.id ? "border-rose bg-rose-soft/40" : "border-rose-soft/60"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery_point"
                      checked={selectedPointId === p.id}
                      onChange={() => setSelectedPointId(p.id)}
                      className="h-5 w-5 accent-rose"
                    />
                    <span>
                      <span className="block font-bold text-ink">{p.name}</span>
                      <span className="block text-xs text-ink-soft">
                        {p.city}
                        {p.estimated_delay ? ` · ${p.estimated_delay}` : ""}
                      </span>
                    </span>
                  </span>
                  <span className="font-display font-semibold">{formatFCFA(p.fee)}</span>
                </label>
              ))}
            </div>
          )}

          <h2 className="mt-6 text-xs font-bold uppercase tracking-wide text-ink-soft">
            Paiement
          </h2>
          <div className="mt-2.5 flex flex-col gap-2.5">
            <PaymentOption
              label="Paiement à la livraison"
              description="Réglez en espèces ou Mobile Money quand la commande arrive."
              checked={paymentMethod === "cash_on_delivery"}
              onSelect={() => setPaymentMethod("cash_on_delivery")}
            />
            <PaymentOption
              label="Paiement en boutique"
              description="Réglez au retrait, avec le code de retrait fourni à la confirmation."
              checked={paymentMethod === "in_store"}
              onSelect={() => setPaymentMethod("in_store")}
            />
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-rose-soft px-3.5 py-2.5 text-xs font-semibold text-rose-deep">
              {error}
            </p>
          )}

          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={() => setStep("infos")}
              className="flex-1 rounded-full border-2 border-rose-soft py-3.5 text-sm font-bold text-ink transition-colors hover:border-rose"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedPointId || submitting}
              className="flex-1 rounded-full bg-rose py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-[1.02] hover:bg-teal active:scale-95 disabled:opacity-60"
            >
              {submitting ? "Un instant…" : "Confirmer la commande"}
            </button>
          </div>
        </div>
      )}

      {step === "confirmation" && order && (
        <div className="glass rounded-lg2 p-8 text-center">
          <h1 className="font-display text-2xl">Merci{infos.first_name ? `, ${infos.first_name}` : ""} !</h1>
          <p className="mt-2 text-sm text-ink-soft">
            Votre commande <span className="font-bold text-ink">#{order.display_id}</span> est
            enregistrée.
            {paymentMethod === "cash_on_delivery"
              ? " Vous réglerez à la livraison."
              : " Vous réglerez au retrait en boutique."}
          </p>
          {selectedPoint && (
            <p className="mt-3 text-sm text-ink-soft">
              Livraison : <span className="font-semibold text-ink">{selectedPoint.name}</span>
              {selectedPoint.estimated_delay ? ` — ${selectedPoint.estimated_delay}` : ""}
            </p>
          )}
          <Link
            href={`/compte/commandes/${order.id}`}
            className="mt-7 inline-block rounded-full bg-rose px-7 py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-105 hover:bg-teal active:scale-95"
          >
            Suivre ma commande et voir le reçu
          </Link>
        </div>
      )}
    </div>
  )
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <li className={`flex items-center gap-1.5 ${active || done ? "text-rose-deep" : ""}`}>
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] ${
          active || done ? "bg-rose text-white" : "bg-rose-soft/60"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      {label}
    </li>
  )
}

function PaymentOption({
  label,
  description,
  checked,
  onSelect,
}: {
  label: string
  description: string
  checked: boolean
  onSelect: () => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 px-4 py-3 text-sm transition-colors ${
        checked ? "border-rose bg-rose-soft/40" : "border-rose-soft/60"
      }`}
    >
      <input
        type="radio"
        name="payment_method"
        checked={checked}
        onChange={onSelect}
        className="mt-0.5 h-5 w-5 accent-rose"
      />
      <span>
        <span className="block font-bold text-ink">{label}</span>
        <span className="block text-xs text-ink-soft">{description}</span>
      </span>
    </label>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  full,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  full?: boolean
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "col-span-2" : ""}`}>
      <span className="text-xs font-bold text-ink-soft">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border-2 border-rose-soft bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal"
      />
    </label>
  )
}
