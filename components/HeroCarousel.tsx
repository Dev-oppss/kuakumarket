"use client"

import Link from "next/link"
import Image from "next/image"
import Carousel from "./Carousel"
import type { HeroSlide } from "@/lib/medusa"

const FALLBACK_SLIDE: HeroSlide = {
  title: "Votre beauté, en un clic.",
  subtitle: "Des soins visage, corps et cheveux sélectionnés pour toutes les carnations, quel que soit l'âge, livrés chez vous.",
  cta_label: "Découvrir la boutique",
  cta_href: "/catalogue",
  image_url: "",
}

/**
 * Carrousel principal — le contenu vient de l'admin (page "Page
 * d'accueil"), plus de slides codés en dur. Si rien n'est configuré, un
 * seul slide de secours s'affiche pour que la page ne paraisse jamais
 * vide ou cassée.
 */
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const items = slides.length > 0 ? slides : [FALLBACK_SLIDE]

  return (
    <section className="relative overflow-hidden">
      <Carousel showDots slideClassName="basis-full">
        {items.map((slide, i) => (
          <div key={i} className="relative">
            {slide.image_url && (
              // Image seule, nette : plus de dégradé par-dessus.
              <Image src={slide.image_url} alt="" fill priority className="object-cover" />
            )}

            <div className="relative grid min-h-[22rem] items-center gap-6 px-5 py-10 sm:gap-10 sm:px-10 sm:py-14 md:py-20">
              <div
                className={
                  slide.image_url
                    ? "max-w-xl rounded-2xl bg-white/95 p-6 shadow-lg sm:p-8"
                    : "max-w-xl"
                }
              >
                {slide.title && (
                  <h1 className="font-display text-4xl leading-[1.05] text-ink sm:text-5xl">
                    {slide.title}
                  </h1>
                )}
                {slide.subtitle && (
                  <p className="mt-5 max-w-md text-ink-soft">{slide.subtitle}</p>
                )}
                {slide.cta_label && slide.cta_href && (
                  <Link
                    href={slide.cta_href}
                    className="mt-8 inline-block rounded-full bg-rose px-7 py-4 text-sm font-bold text-white shadow-glow transition-all hover:scale-105 hover:bg-teal active:scale-95"
                  >
                    {slide.cta_label}
                  </Link>
                )}
              </div>
              {!slide.image_url && (
                <>
                  <span className="pointer-events-none absolute right-10 top-4 text-2xl text-teal animate-floatSlow">✦</span>
                  <span className="pointer-events-none absolute bottom-10 left-4 text-xl text-rose animate-floatSlow [animation-delay:1s]">✦</span>
                </>
              )}
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  )
}
