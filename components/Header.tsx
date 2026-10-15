"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import ThemeToggle from "@/components/ThemeToggle";
import { LiquidGlassFilter, useLiquidGlass } from "@/components/header/useLiquidGlass";
import { navLinks, useActiveSection, useScrollProgress } from "@/components/header/useScrollState";
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";

export default function Header() {
  const active = useActiveSection();
  const progressRef = useScrollProgress<HTMLSpanElement>();
  const { ref: glassRef, mapRef, filterId } = useLiquidGlass<HTMLDivElement>();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center px-4 sm:top-5 sm:px-6">
      <LiquidGlassFilter id={filterId} mapRef={mapRef} />
      <div
        ref={glassRef}
        className="pointer-events-auto relative flex h-14 w-full max-w-5xl items-center justify-between gap-2 overflow-hidden glass rounded-2xl px-2.5 sm:grid sm:h-16 sm:grid-cols-[1fr_auto_1fr] sm:px-3"
      >
        <a
          href="#top"
          onClick={(e) => scrollToSection(e, null)}
          aria-label="Jewel Bernal, back to top"
          className="flex items-center gap-2.5 justify-self-start rounded-xl py-1 pl-1 pr-2"
        >
          <span className="relative shrink-0 rounded-lg shadow-sm shadow-black/20 after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-1 after:ring-inset after:ring-white/15 dark:ring-1 dark:ring-white/10">
            <Image
              src="/logo.png"
              alt=""
              width={36}
              height={36}
              priority
              className="h-8 w-8 rounded-lg sm:h-9 sm:w-9"
            />
          </span>
          <span className="hidden font-mono text-sm tracking-tight text-ink md:inline">
            Jewel Bernal
          </span>
        </a>

        <nav className="flex items-center gap-0.5 justify-self-center">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => scrollToSection(e, link.id)}
              aria-current={active === link.id ? "location" : undefined}
              className={cn(
                "rounded-lg px-2.5 py-2 font-mono text-xs transition-colors sm:px-4 sm:text-sm",
                active === link.id
                  ? "glass-chip text-ink"
                  : "text-ink-muted hover:bg-foreground/5 hover:text-ink",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 justify-self-end sm:gap-2">
          <ThemeToggle />
          <a
            href="/cv"
            className="group flex h-8 items-center gap-1 bevel-button rounded-lg bg-foreground px-3 font-mono text-xs text-background transition-colors hover:bg-foreground/85 sm:h-9 sm:px-4 sm:text-sm"
          >
            CV
            <ArrowUpRight
              aria-hidden
              className="hidden h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 sm:block"
            />
          </a>
        </div>

        <span
          ref={progressRef}
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-foreground/40"
        />
      </div>
    </header>
  );
}
