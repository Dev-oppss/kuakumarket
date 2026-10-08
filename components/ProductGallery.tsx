"use client"

import { useState } from "react"
import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import clsx from "clsx"

export default function ProductGallery({
  images,
  title,
}: {
  images: string[]
  title: string
}) {
  const [active, setActive] = useState(0)
  const hasImages = images.length > 0

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-lg2 bg-gradient-to-br from-rose-soft to-teal-soft">
        <AnimatePresence mode="wait">
          {hasImages ? (
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={images[active]}
                alt={title}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          ) : (
            <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-bold text-white">
              Exemple — photo à venir
            </span>
          )}
        </AnimatePresence>
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 sm:mt-3.5 sm:gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={clsx(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors",
                i === active ? "border-rose" : "border-transparent"
              )}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
