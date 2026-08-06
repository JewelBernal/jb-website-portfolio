import GridBackground from "@/components/GridBackground";
import Terminal from "@/components/Terminal";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[86vh] flex-col justify-center overflow-hidden px-6 sm:px-10"
    >
      <GridBackground />

      <div className="relative z-5 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-center">

        <div>
          <p className="mb-6 font-mono text-xs tracking-[0.2em] text-ink-muted">
            SOFTWARE ENGINEER — WEB DEVELOPER & DESIGNER
          </p>
          <h1 className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-7xl">
            Jewel Bernal
            <span className="cursor-blink">_</span>
          </h1>
          <p className="mt-8 max-w-[38ch] text-lg leading-relaxed text-ink-muted">
            I build fast, considered interfaces and the systems behind them —
            equally at home in a design file and a terminal.
          </p>
          <div className="mt-10 flex gap-6 font-mono text-sm">
            <a
              href="#about"
              className="border-b border-ink pb-1 text-ink transition-colors hover:border-accent hover:text-accent"
            >
              More about me →
            </a>
            <a
              href="#contact"
              className="border-b border-transparent pb-1 text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              Get in touch
            </a>
          </div>
        </div>

        <Terminal />
      </div>
    </section>
  );
}
