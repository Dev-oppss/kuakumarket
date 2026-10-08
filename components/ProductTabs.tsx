"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import clsx from "clsx"

export default function ProductTabs({
  tabs,
}: {
  tabs: { label: string; content: React.ReactNode }[]
}) {
  const [active, setActive] = useState(0)

  return (
    <div className="mt-11">
      <div className="flex gap-6 overflow-x-auto border-b border-rose-soft">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={clsx(
              "relative shrink-0 whitespace-nowrap pb-3.5 text-sm font-bold transition-colors",
              i === active ? "text-teal" : "text-ink-soft"
            )}
          >
            {tab.label}
            {i === active && (
              <motion.span
                layoutId="tab-underline"
                className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full bg-teal"
              />
            )}
          </button>
        ))}
      </div>
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="py-7"
      >
        {tabs[active].content}
      </motion.div>
    </div>
  )
}
