"use client"

/**
 * Suivi de fréquentation intégré à Medusa (voir /store/site-events côté
 * backend) — remplace Umami/Google Analytics : aucun script tiers, tout
 * reste dans les deux mêmes projets (front + backend Medusa).
 *
 * `visitor_id` : identifiant anonyme généré une fois par navigateur,
 * stocké en localStorage — jamais de nom, d'email ni d'IP envoyé.
 */
function getVisitorId(): string {
  const KEY = "kuaku_visitor_id"
  try {
    let id = window.localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      window.localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return "anon"
  }
}

type EventType = "page_view" | "product_view" | "product_click" | "add_to_cart" | "link_click"

export function track(type: EventType, opts: { path?: string; target?: string; productId?: string } = {}) {
  try {
    const body = JSON.stringify({
      type,
      path: opts.path ?? window.location.pathname,
      target: opts.target,
      product_id: opts.productId,
      visitor_id: getVisitorId(),
    })
    const url = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/site-events`
    // sendBeacon ne bloque jamais la navigation (utile sur un clic qui
    // quitte immédiatement la page) ; repli sur fetch si indisponible.
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))
    } else {
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true })
    }
  } catch {
    // le suivi ne doit jamais faire planter la navigation
  }
}
