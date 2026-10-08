"use client"

import Link from "next/link"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import clsx from "clsx"
import { registerCustomer, loginCustomer, logoutCustomer, getCurrentCustomer } from "@/lib/auth"
import { sdk } from "@/lib/medusa"
import { formatFCFA } from "@/lib/format"
import EmailVerificationBanner from "@/components/EmailVerificationBanner"

/**
 * Compte obligatoire pour commander (décision actée dans la spec
 * technique) : cette page sert donc de passage obligé avant le tunnel de
 * commande, pas juste une option secondaire. Le paramètre ?redirect=
 * permet d'y revenir après connexion (utilisé par la page panier).
 *
 * useSearchParams() doit être enveloppé dans un <Suspense> pour le build
 * de production Next.js (sinon : "useSearchParams() should be wrapped in
 * a suspense boundary" et le build échoue purement et simplement) — d'où
 * le composant wrapper juste en dessous.
 */
export default function ComptePage() {
  return (
    <Suspense fallback={null}>
      <ComptePageContent />
    </Suspense>
  )
}

function ComptePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/"

  const [mode, setMode] = useState<"login" | "register">("login")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  })

  const [customer, setCustomer] = useState<any>(null)

  useEffect(() => {
    getCurrentCustomer().then((c) => {
      setCustomer(c)
      setCheckingSession(false)
      // Si on arrive ici via une redirection explicite (?redirect=...) et
      // qu'on est déjà connectée, on repart directement au bon endroit —
      // sinon /compte reste l'écran "Mon compte" normal.
      if (c && redirectTo !== "/") {
        router.replace(redirectTo)
      }
    })
  }, [redirectTo, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === "login") {
        await loginCustomer(form.email, form.password)
      } else {
        await registerCustomer(form)
        await loginCustomer(form.email, form.password)
      }
      router.push(redirectTo)
    } catch (err: any) {
      setError(
        err?.message ||
          "Une erreur est survenue. Vérifiez vos informations et réessayez."
      )
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) return null

  if (customer) {
    return <AccountView customer={customer} onLogout={async () => {
      await logoutCustomer()
      setCustomer(null)
    }} />
  }

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-md flex-col justify-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="glass rounded-lg2 p-8">
        <div className="mb-7 flex rounded-full bg-blush p-1">
          <button
            onClick={() => setMode("login")}
            className={clsx(
              "flex-1 rounded-full py-2.5 text-sm font-bold transition-colors",
              mode === "login" ? "bg-rose text-white" : "text-ink-soft hover:text-teal"
            )}
          >
            Se connecter
          </button>
          <button
            onClick={() => setMode("register")}
            className={clsx(
              "flex-1 rounded-full py-2.5 text-sm font-bold transition-colors",
              mode === "register" ? "bg-rose text-white" : "text-ink-soft hover:text-teal"
            )}
          >
            Créer un compte
          </button>
        </div>

        <h1 className="font-display text-2xl">
          {mode === "login" ? "Ravie de vous revoir" : "Bienvenue"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          {mode === "login"
            ? "Connectez-vous pour accéder à votre panier et vos commandes."
            : "Un compte est nécessaire pour passer commande sur KuakuMarket."}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {mode === "register" && (
              <motion.div
                key="names"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-2 gap-3 overflow-hidden"
              >
                <Field
                  label="Prénom"
                  value={form.first_name}
                  onChange={(v) => setForm((f) => ({ ...f, first_name: v }))}
                  required
                />
                <Field
                  label="Nom"
                  value={form.last_name}
                  onChange={(v) => setForm((f) => ({ ...f, last_name: v }))}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            required
          />
          <Field
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(v) => setForm((f) => ({ ...f, password: v }))}
            required
          />

          {error && (
            <p className="rounded-lg bg-rose-soft px-3.5 py-2.5 text-xs font-semibold text-rose-deep">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-full bg-rose py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:scale-[1.02] hover:bg-teal active:scale-95 disabled:opacity-60"
          >
            {loading
              ? "Un instant…"
              : mode === "login"
              ? "Se connecter"
              : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
}) {
  return (
    <label className="flex flex-col gap-1.5">
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

const STAGE_LABELS: Record<string, string> = {
  nouvelle: "Nouvelle",
  confirmee: "Confirmée",
  preparation: "En préparation",
  expedition: "En livraison",
  livree: "Livrée",
  annulee: "Annulée",
  echec: "Échec",
  retour: "Retournée",
}

/** Écran "Mon compte" une fois connectée : infos + historique de commandes. */
function AccountView({ customer, onLogout }: { customer: any; onLogout: () => void }) {
  const [orders, setOrders] = useState<any[] | null>(null)
  const [stages, setStages] = useState<Record<string, string>>({})

  useEffect(() => {
    sdk.store.order
      .list({ limit: 20, fields: "id,display_id,created_at,total,items,status" })
      .then(async ({ orders: list }) => {
        setOrders(list)
        // Statut détaillé (module custom delivery-stage) récupéré un par
        // un — le catalogue de commandes d'une cliente reste petit, donc
        // pas besoin d'un endpoint qui les regroupe.
        const entries = await Promise.all(
          list.map(async (o: any) => {
            try {
              const res = await sdk.client.fetch<{ delivery_stage: { stage: string } | null }>(
                `/store/orders/${o.id}/delivery-stage`
              )
              return [o.id, res.delivery_stage?.stage] as const
            } catch {
              return [o.id, undefined] as const
            }
          })
        )
        setStages(Object.fromEntries(entries.filter(([, s]: [string, string | undefined]) => s)))
      })
      .catch(() => setOrders([]))
  }, [])

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <EmailVerificationBanner />
      <div className="glass mb-6 flex items-center justify-between rounded-lg2 p-6">
        <div>
          <h1 className="font-display text-2xl">
            Bonjour {customer.first_name || customer.email}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">{customer.email}</p>
        </div>
        <button
          onClick={onLogout}
          className="rounded-full border-2 border-rose-soft px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:border-rose"
        >
          Déconnexion
        </button>
      </div>

      <h2 className="mb-3 font-display text-lg">Mes commandes</h2>
      {orders === null ? (
        <p className="text-sm text-ink-soft">Chargement…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-ink-soft">Vous n'avez pas encore passé de commande.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/compte/commandes/${o.id}`}
              className="glass-teal flex items-center justify-between rounded-md2 p-4 transition-transform hover:scale-[1.01]"
            >
              <div>
                <p className="font-bold text-ink">Commande #{o.display_id}</p>
                <p className="text-xs text-ink-soft">
                  {new Date(o.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-display font-semibold">{formatFCFA(o.total)}</p>
                <p className="text-xs font-bold text-teal">
                  {STAGE_LABELS[stages[o.id]] ?? "En cours"} · Suivre →
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
