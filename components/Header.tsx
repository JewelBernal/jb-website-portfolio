import ThemeToggle from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-zinc-200/30 px-6 py-5 backdrop-blur sm:px-10 border-b-zinc-300">
      <a href="#top" className="font-mono text-sm tracking-tight text-ink">
        JEWEL<span className="text-accent"> </span>BERNAL
      </a>
      <nav className="hidden items-center gap-8 font-mono text-sm text-ink-muted sm:flex">
        <a href="#work" className="transition-colors hover:text-ink">
          Work
        </a>
        <a href="#about" className="transition-colors hover:text-ink">
          About
        </a>
        <a href="#contact" className="transition-colors hover:text-ink">
          Contact
        </a>

      </nav>
      <div className="flex items-center gap-4">
        <a
          href="/resume.pdf"
          className="font-mono text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Curriculum Vitae
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
