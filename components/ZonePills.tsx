"use client"

import Link from "next/link"
import { motion } from "framer-motion"

const ZONES = [
  { name: "Visage", icon: "◐" },
  { name: "Corps", icon: "◈" },
  { name: "Cheveux", icon: "≋" },
  { name: "Lèvres", icon: "♡" },
  { name: "Cuir chevelu", icon: "❋" },
  { name: "Femmes enceintes", icon: "✦" },
]

export default function ZonePills() {
  return (
    <div className="flex gap-3.5 overflow-x-auto pb-2">
      {ZONES.map((zone, i) => (
        <motion.div
          key={zone.name}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.35 }}
        >
          <Link
            href={`/catalogue?categorie=${encodeURIComponent(zone.name)}`}
            className="flex shrink-0 items-center gap-2 rounded-full bg-blush px-5 py-3 text-sm font-bold text-ink transition-all duration-200 hover:bg-teal hover:text-white hover:-translate-y-0.5"
          >
            <span className="text-rose">{zone.icon}</span>
            {zone.name}
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
