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
    return "anonymous-visitor"
  }
}

/** Pays / ville indiqués par le visiteur dans la notification (voir components/LocationPrompt.tsx). */
function getDeclaredLocation(): { country?: string; city?: string } {
  try {
    const v = JSON.parse(window.localStorage.getItem("kuaku_location") ?? "null")
    return v?.country ? { country: v.country, city: v.city } : {}
  } catch {
    return {}
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
      ...getDeclaredLocation(),
    })
    const url = `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/site-events`
    // Medusa exige l'en-tête x-publishable-api-key sur TOUTES les routes
    // /store. navigator.sendBeacon ne permet pas d'ajouter d'en-tête : les
    // évènements étaient donc tous rejetés (400). fetch + keepalive envoie
    // l'en-tête ET survit à une navigation, comme sendBeacon.
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      body,
      keepalive: true,
    }).catch(() => {})
  } catch {
    // le suivi ne doit jamais faire planter la navigation
  }
}