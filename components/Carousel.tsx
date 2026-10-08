"use client"

import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import clsx from "clsx"

export default function Carousel({
  children,
  slideClassName,
  showDots = true,
  showArrows = true,
}: {
  children: React.ReactNode[]
  slideClassName?: string
  showDots?: boolean
  showArrows?: boolean
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true }),
  ])
  const [selected, setSelected] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelected(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on("select", onSelect)
  }, [emblaApi, onSelect])

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {children.map((child, i) => (
            <div
              key={i}
              className={clsx("min-w-0 shrink-0 grow-0", slideClassName)}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {showArrows && children.length > 1 && (
        <>
          <button
            aria-label="Précédent"
            onClick={() => emblaApi?.scrollPrev()}
            className="glass absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink shadow-sm transition-all hover:scale-110 hover:text-rose-deep active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            aria-label="Suivant"
            onClick={() => emblaApi?.scrollNext()}
            className="glass absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink shadow-sm transition-all hover:scale-110 hover:text-rose-deep active:scale-95"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </>
      )}

      {showDots && (
        <div className="glass mt-5 flex w-fit mx-auto items-center gap-2 rounded-full px-4 py-2">
          {children.map((_, i) => (
            <button
              key={i}
              aria-label={`Aller à l'élément ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
              className={clsx(
                "h-2 rounded-full transition-all duration-300",
                i === selected ? "w-6 bg-rose" : "w-2 bg-rose-deep/30"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
