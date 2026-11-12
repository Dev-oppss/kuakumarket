import { formatFCFA } from "@/lib/format"

// Codes marchands des affichettes de la boutique (MTN MoMo et Orange Money).
// Pour les changer : modifier ces trois lignes.
const MERCHANT_NAME = "Gide Pharmaceuticals SARL"
const MTN_CODE = "794442"
const ORANGE_CODE = "970234"

/** Un ID de transaction valide : 6 à 40 caractères (lettres, chiffres, point, tiret). Ex. Orange : PP261108.1541.B29313 */
export const isValidReference = (v: string) => /^[A-Za-z0-9._-]{6,40}$/.test(v.trim())

/**
 * Paiement Mobile Money (mode manuel), affiché à l'étape paiement : la cliente
 * paie avec le code marchand, puis recopie l'ID de la transaction reçu par SMS.
 * Le paiement n'est pas confirmé automatiquement : la boutique compare l'ID
 * avec son historique marchand, puis marque la commande comme payée.
 */
export default function MobileMoneyInstructions({
  amount,
  reference,
  onReferenceChange,
}: {
  amount: number
  reference: string
  onReferenceChange: (v: string) => void
}) {
  const mtnCode = `*126*4*${MTN_CODE}*${amount}#`
  const orangeCode = "#150*47#"
  // Un "#" dans un lien téléphone doit s'écrire %23.
  const dial = (code: string) => `tel:${code.replace(/#/g, "%23")}`

  return (
    <div className="mt-5 rounded-2xl border-2 border-rose-soft bg-white/70 p-4 text-left text-sm">
      <p className="font-bold text-ink">Payez maintenant {formatFCFA(amount)}</p>
      <p className="mt-1 text-xs text-ink-soft">
        C&apos;est le montant des articles. Les frais de livraison vous seront communiqués par WhatsApp.
      </p>

      <div className="mt-3 space-y-3">
        <div className="rounded-xl bg-[#FFCC00]/25 px-3.5 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">MTN MoMo</p>
          <p className="mt-1 text-ink">
            Composez{" "}
            <a href={dial(mtnCode)} className="font-mono font-bold text-ink underline">
              {mtnCode}
            </a>
          </p>
        </div>
        <div className="rounded-xl bg-[#FF7900]/15 px-3.5 py-3">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Orange Money</p>
          <p className="mt-1 text-ink">
            Composez{" "}
            <a href={dial(orangeCode)} className="font-mono font-bold text-ink underline">
              {orangeCode}
            </a>
            , puis entrez le code marchand <span className="font-mono font-bold">{ORANGE_CODE}</span> et le montant.
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-ink-soft">
        Le nom du marchand affiché sur votre téléphone sera <span className="font-bold text-ink">{MERCHANT_NAME}</span>.
      </p>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">ID de la transaction</span>
        <input
          value={reference}
          onChange={(e) => onReferenceChange(e.target.value)}
          placeholder="Ex. : PP261108.1541.B29313"
          maxLength={40}
          autoCapitalize="characters"
          autoComplete="off"
          className="mt-1.5 w-full rounded-xl border-2 border-rose-soft bg-white px-3.5 py-2.5 font-mono text-sm text-ink outline-none transition-colors focus:border-teal"
        />
        <span className="mt-1.5 block text-xs text-ink-soft">
          Après le paiement, vous recevez un SMS : recopiez ici l&apos;ID indiqué à côté de « ID transaction ». Nous le
          comparons avec notre historique pour confirmer votre paiement.
        </span>
      </label>
    </div>
  )
}
