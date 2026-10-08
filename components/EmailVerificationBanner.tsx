"use client"

import { useEffect, useState } from "react"
import { sdk } from "@/lib/medusa"

/**
 * Bandeau "Vérifie ton email" affiché tant que le compte n'a pas confirmé
 * son adresse par le code à 6 chiffres envoyé par email. Ne bloque rien
 * (la cliente peut continuer à naviguer/commander) — c'est une incitation,
 * pas une barrière, pour ne pas perdre une vente à cause d'un email
 * arrivé en retard ou dans les spams.
 */
export default function EmailVerificationBanner() {
  const [verified, setVerified] = useState<boolean | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [code, setCode] = useState("")
  const [message, setMessage] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    sdk.client
      .fetch<{ verified: boolean }>("/store/customers/email-verification")
      .then((r) => setVerified(r.verified))
      .catch(() => setVerified(null))
  }, [])

  const sendCode = async () => {
    setSending(true)
    setMessage(null)
    try {
      const res = await sdk.client.fetch<{ sent: boolean; already_verified: boolean }>(
        "/store/customers/email-verification",
        { method: "POST" }
      )
      if (res.already_verified) {
        setVerified(true)
      } else {
        setSent(true)
        setMessage("Code envoyé — vérifie ta boîte mail (et les spams).")
      }
    } catch (err: any) {
      setMessage(err?.message || "Impossible d'envoyer le code pour le moment.")
    } finally {
      setSending(false)
    }
  }

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfirming(true)
    setMessage(null)
    try {
      await sdk.client.fetch("/store/customers/email-verification/confirm", {
        method: "POST",
        body: { code },
      })
      setVerified(true)
    } catch (err: any) {
      setMessage(err?.message || "Code incorrect.")
    } finally {
      setConfirming(false)
    }
  }

  if (verified !== false) return null // vérifié, ou statut pas encore connu

  return (
    <div className="mb-6 rounded-md2 border-2 border-teal-soft bg-teal-soft/30 p-4">
      <p className="text-sm font-bold text-ink">Vérifie ton adresse email</p>
      <p className="mt-1 text-xs text-ink-soft">
        Ça confirme que le compte t'appartient bien et sécurise tes commandes.
      </p>

      {!sent ? (
        <button
          onClick={sendCode}
          disabled={sending}
          className="mt-3 rounded-full bg-teal px-5 py-2 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
        >
          {sending ? "Envoi…" : "Recevoir un code par email"}
        </button>
      ) : (
        <form onSubmit={confirmCode} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Code à 6 chiffres"
            inputMode="numeric"
            className="w-36 rounded-full border-2 border-teal-soft bg-white px-4 py-2 text-sm outline-none focus:border-teal"
          />
          <button
            type="submit"
            disabled={confirming || code.length !== 6}
            className="rounded-full bg-teal px-5 py-2 text-xs font-bold text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
          >
            {confirming ? "Vérification…" : "Confirmer"}
          </button>
          <button type="button" onClick={sendCode} disabled={sending} className="text-xs font-bold text-teal underline">
            Renvoyer le code
          </button>
        </form>
      )}

      {message && <p className="mt-2 text-xs text-ink-soft">{message}</p>}
    </div>
  )
}
