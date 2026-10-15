"use client"

import { useEffect, useRef, useState } from "react"
import { FileText, Globe, Mail, MapPin, Save } from "lucide-react"
import { formatFCFA } from "@/lib/format"

/**
 * Reçu de commande sur papier à en-tête KuakuMarket (format A4).
 * Fond = /recu-fond.jpg (courbes + dégradés, sans logo ni texte) ; le logo et
 * le pied de page sont posés par-dessus en vrai texte pour rester nets à
 * l'impression / en PDF. Les commandes longues sont réparties sur plusieurs
 * pages, le total figurant sur la dernière.
 */

export const RECEIPT_W = 794 // A4 à 96 dpi
export const RECEIPT_H = 1123
const GAP = 24

const PINK = "#E91E78"
const TEAL = "#1AA7AE"
const INK = "#2B2430"
const SOFT = "#7A6F80"

const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: "Paiement à la livraison",
  in_store: "Paiement en boutique",
}

type Tracking = {
  delivery_point: { name: string; city: string; fee: number; estimated_delay: string | null } | null
  payment_method: string | null
} | null

// Capacités (en lignes d'articles) selon la page et la présence du total.
function paginate<T>(items: T[]): { rows: T[]; last: boolean }[] {
  const pages: { rows: T[]; last: boolean }[] = []
  let i = 0
  let first = true
  for (;;) {
    const capWithTotals = first ? 7 : 10
    const capNoTotals = first ? 11 : 15
    const remaining = items.length - i
    if (remaining <= capWithTotals) {
      pages.push({ rows: items.slice(i), last: true })
      break
    }
    // Si tout tient sans le total, on garde quelques lignes pour la dernière page
    // afin que le total ne se retrouve pas seul sur une feuille.
    const take = remaining <= capNoTotals ? Math.max(1, remaining - 3) : capNoTotals
    pages.push({ rows: items.slice(i, i + take), last: false })
    i += take
    first = false
  }
  return pages
}

const WHATSAPP_PATH =
  "M16.04 3C9.4 3 4 8.4 4 15.03c0 2.12.55 4.19 1.6 6.02L4 29l8.13-1.56a12 12 0 0 0 3.9.65C22.66 28.1 28 22.7 28 16.07 28 9.4 22.68 3 16.04 3Zm0 22.05c-1.2 0-2.38-.32-3.4-.93l-.24-.15-4.83.93.98-4.7-.16-.25a9.9 9.9 0 0 1-1.5-5.3c0-5.5 4.5-9.97 10.03-9.97 5.5 0 9.97 4.5 9.97 10.03 0 5.5-4.47 10.34-10.85 10.34Zm5.47-7.46c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.08 4.5.7.3 1.26.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"

function FooterCol({
  color,
  icon,
  label,
  children,
  divider,
  dividerColor,
}: {
  color: string
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  divider?: boolean
  dividerColor?: string
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        paddingLeft: divider ? 6 : 0,
        marginLeft: divider ? 6 : 0,
        borderLeft: divider ? `1.5px solid ${dividerColor}` : "none",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: color,
          color: "#fff",
          flex: "0 0 auto",
        }}
      >
        {icon}
      </span>
      <div style={{ lineHeight: 1.25 }}>
        <div style={{ color, fontSize: 9.5, fontWeight: 700 }}>{label} :</div>
        <div style={{ color: INK, fontSize: 8, whiteSpace: "nowrap" }}>{children}</div>
      </div>
    </div>
  )
}

function SheetFooter() {
  const ic = { width: 13, height: 13, strokeWidth: 2 }
  return (
    <div
      style={{
        position: "absolute",
        left: "3.2%",
        right: "2%",
        top: "84.4%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <FooterCol
        color={PINK}
        label="Téléphone"
        icon={
          <svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor">
            <path d={WHATSAPP_PATH} />
          </svg>
        }
      >
        <span style={{ fontSize: 9.5 }}>
          681061842 <span style={{ fontSize: 7 }}>(WhatsApp)</span> /
        </span>
        <br />
        <span style={{ fontSize: 9.5 }}>640127741</span>
      </FooterCol>
      <FooterCol color={TEAL} label="Mail" icon={<Mail {...ic} />} divider dividerColor={PINK}>
        kuakumarket@gmail.com
      </FooterCol>
      <FooterCol color={PINK} label="Website" icon={<Globe {...ic} />} divider dividerColor={TEAL}>
        www.kuakumarket.com
      </FooterCol>
      <FooterCol color={TEAL} label="NIU" icon={<Save {...ic} />} divider dividerColor={PINK}>
        P098213562531N
      </FooterCol>
      <FooterCol color={PINK} label="RCCM" icon={<FileText {...ic} />} divider dividerColor={TEAL}>
        <span style={{ fontSize: 7 }}>CM-DLA-01-2026-A10-00961</span>
      </FooterCol>
      <FooterCol color={TEAL} label="Siège" icon={<MapPin {...ic} />} divider dividerColor={PINK}>
        Douala-Makepe
      </FooterCol>
    </div>
  )
}

function Page({
  order,
  tracking,
  rows,
  last,
  index,
  total,
}: {
  order: any
  tracking: Tracking
  rows: any[]
  last: boolean
  index: number
  total: number
}) {
  const addr = order.shipping_address
  const date = new Date(order.created_at).toLocaleDateString("fr-FR")
  const clientName = [addr?.first_name, addr?.last_name].filter(Boolean).join(" ") || order.email
  const label = { fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: TEAL, textTransform: "uppercase" as const }

  return (
    <div
      className="recu-page"
      style={{
        position: "relative",
        width: RECEIPT_W,
        height: RECEIPT_H,
        background: "#fff",
        color: INK,
        overflow: "hidden",
        fontSize: 12,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/recu-fond.jpg"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="KuakuMarket — Votre beauté en un clic"
        style={{ position: "absolute", left: "4.2%", top: "2.4%", width: "57%" }}
      />

      <div style={{ position: "absolute", left: 62, right: 62, top: 178, bottom: 190 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 26, lineHeight: 1.1, color: PINK, margin: 0 }}>
              Reçu de commande
            </h1>
            <p style={{ margin: "4px 0 0", color: SOFT, fontSize: 11 }}>
              {total > 1 ? `Page ${index + 1} / ${total}` : "Merci pour votre confiance"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Commande #{order.display_id}</p>
            <p style={{ margin: "2px 0 0", color: SOFT, fontSize: 11 }}>{date}</p>
          </div>
        </div>
        <div style={{ height: 2, margin: "12px 0 16px", background: `linear-gradient(90deg, ${PINK}, ${TEAL})` }} />

        {index === 0 && (
          <div style={{ display: "flex", gap: 24, marginBottom: 18 }}>
            <div style={{ flex: 1 }}>
              <p style={label}>Client</p>
              <p style={{ margin: "4px 0 0", fontWeight: 600 }}>{clientName}</p>
              <p style={{ margin: "1px 0 0", color: SOFT }}>{order.email}</p>
              {addr?.phone && <p style={{ margin: "1px 0 0", color: SOFT }}>{addr.phone}</p>}
            </div>
            <div style={{ flex: 1 }}>
              <p style={label}>Livraison</p>
              {tracking?.delivery_point ? (
                <>
                  <p style={{ margin: "4px 0 0", fontWeight: 600 }}>{tracking.delivery_point.name}</p>
                  <p style={{ margin: "1px 0 0", color: SOFT }}>{tracking.delivery_point.city}</p>
                  {tracking.delivery_point.estimated_delay && (
                    <p style={{ margin: "1px 0 0", color: SOFT }}>Délai : {tracking.delivery_point.estimated_delay}</p>
                  )}
                </>
              ) : (
                <p style={{ margin: "4px 0 0", color: SOFT }}>—</p>
              )}
              {addr?.address_1 && <p style={{ margin: "1px 0 0", color: SOFT }}>{addr.address_1}</p>}
            </div>
          </div>
        )}

        {rows.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${TEAL}`, textAlign: "left", color: TEAL, fontSize: 10, textTransform: "uppercase" }}>
              <th style={{ padding: "6px 0" }}>Article</th>
              <th style={{ padding: "6px 0", textAlign: "center", width: 44 }}>Qté</th>
              <th style={{ padding: "6px 0", textAlign: "right", width: 105 }}>Prix unitaire</th>
              <th style={{ padding: "6px 0", textAlign: "right", width: 105 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((it: any) => (
              <tr key={it.id} style={{ borderBottom: "1px solid #F1D9E4" }}>
                <td style={{ padding: "8px 8px 8px 0" }}>{it.title}</td>
                <td style={{ padding: "8px 0", textAlign: "center" }}>{it.quantity}</td>
                <td style={{ padding: "8px 0", textAlign: "right" }}>{formatFCFA(it.unit_price)}</td>
                <td style={{ padding: "8px 0", textAlign: "right" }}>{formatFCFA(it.unit_price * it.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

        {last && (
          <>
            <div style={{ marginLeft: "auto", marginTop: 14, width: 260, fontSize: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: SOFT }}>
                <span>Sous-total</span>
                <span>{formatFCFA(order.subtotal ?? 0)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", color: SOFT }}>
                <span>Livraison</span>
                <span>{formatFCFA(order.shipping_total ?? tracking?.delivery_point?.fee ?? 0)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 6,
                  paddingTop: 8,
                  borderTop: `2px solid ${PINK}`,
                  fontSize: 17,
                  fontWeight: 700,
                }}
              >
                <span>Total</span>
                <span style={{ color: PINK }}>{formatFCFA(order.total)}</span>
              </div>
            </div>
            <p
              style={{
                marginTop: 18,
                padding: "9px 12px",
                borderRadius: 8,
                background: "#FFF3F6",
                color: SOFT,
                fontSize: 10.5,
                lineHeight: 1.45,
              }}
            >
              {PAYMENT_LABELS[tracking?.payment_method ?? ""] ?? "Paiement"} — montant à régler :{" "}
              <strong style={{ color: INK }}>{formatFCFA(order.total)}</strong>. Ce reçu confirme votre commande ; il
              ne vaut pas facture fiscale.
            </p>
          </>
        )}
      </div>

      <SheetFooter />
    </div>
  )
}

/** Affiche le reçu à l'échelle de l'écran (les pages restent en A4 réel pour le PDF / l'impression). */
export default function ReceiptSheets({ order, tracking }: { order: any; tracking: Tracking }) {
  const pages = paginate<any>(order.items ?? [])
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const update = () => setScale(Math.min(1, el.clientWidth / RECEIPT_W))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const totalH = pages.length * RECEIPT_H + (pages.length - 1) * GAP

  return (
    <div ref={boxRef} className="recu-viewport" style={{ width: "100%", height: totalH * scale }}>
      <div
        id="recu-scaler"
        className="recu-scaler"
        style={{
          width: RECEIPT_W,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          display: "flex",
          flexDirection: "column",
          gap: GAP,
        }}
      >
        {pages.map((p, i) => (
          <Page key={i} order={order} tracking={tracking} rows={p.rows} last={p.last} index={i} total={pages.length} />
        ))}
      </div>
    </div>
  )
}
