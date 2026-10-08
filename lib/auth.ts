import { sdk } from "./medusa"

/**
 * Le SDK Medusa gère lui-même le stockage du token d'authentification
 * après un login/register réussi — pas besoin de le manipuler à la main
 * ici, les appels suivants (sdk.store.customer.retrieve, etc.) l'utilisent
 * automatiquement.
 */

export async function registerCustomer(data: {
  email: string
  password: string
  first_name: string
  last_name: string
}) {
  try {
    await sdk.auth.register("customer", "emailpass", {
      email: data.email,
      password: data.password,
    })
  } catch (err: any) {
    // Cas fréquent : l'email existe déjà (ex. panier créé, puis compte créé
    // plus tard). On retente une authentification directe plutôt que
    // d'échouer tout de suite.
    const result = await sdk.auth.login("customer", "emailpass", {
      email: data.email,
      password: data.password,
    })
    if (typeof result !== "string") {
      throw new Error(
        "Cette adresse email est déjà utilisée avec un mot de passe différent."
      )
    }
  }

  const { customer } = await sdk.store.customer.create({
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
  })

  return customer
}

export async function loginCustomer(email: string, password: string) {
  const result = await sdk.auth.login("customer", "emailpass", {
    email,
    password,
  })

  if (typeof result !== "string") {
    // Étape supplémentaire requise (ex. authentification tierce) — pas
    // utilisé ici puisqu'on est en email/mot de passe simple, mais on
    // détecte le cas plutôt que de planter silencieusement.
    throw new Error("Étape d'authentification supplémentaire requise.")
  }

  return result
}

export async function logoutCustomer() {
  await sdk.auth.logout()
}

export async function getCurrentCustomer() {
  try {
    const { customer } = await sdk.store.customer.retrieve()
    return customer
  } catch {
    return null
  }
}
