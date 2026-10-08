"use client"

import { motion } from "framer-motion"

const ITEMS = [
  {
    icon: "📱",
    title: "Paiement local",
    text: "MTN Mobile Money, Orange Money, ou paiement à la livraison.",
  },
  {
    icon: "🚚",
    title: "Livraison rapide",
    text: "Douala et Yaoundé aujourd'hui, d'autres villes bientôt.",
  },
  {
    icon: "💬",
    title: "Support WhatsApp",
    text: "Une question ? Écrivez-nous directement.",
  },
  {
    icon: "✓",
    title: "Avis vérifiés",
    text: "Uniquement des notes laissées par de vraies clientes.",
  },
]

export default function TrustStrip() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {ITEMS.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          className="flex gap-3.5 rounded-md2 bg-blush p-6 transition-transform duration-200 hover:-translate-y-1"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-lg">
            {item.icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">{item.title}</h3>
            <p className="mt-1 text-xs text-ink-soft">{item.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
