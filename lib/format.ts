/**
 * Medusa stocke les prix en unité mineure (centimes) même pour des devises
 * sans sous-unité comme le FCFA — on garde la division par 100 par
 * cohérence avec le reste de l'API, à ajuster si la config regionale du
 * projet stocke déjà le FCFA en unité entière.
 */
export function formatFCFA(amount: number): string {
  const value = Math.round(amount)
  return `${value.toLocaleString("fr-FR")} FCFA`
}
