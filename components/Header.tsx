import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-y-3 border-b border-line bg-background/75 px-6 py-4 backdrop-blur-md sm:px-10 sm:py-5">
      <a href="#top" className="font-mono text-sm tracking-tight text-ink">
        JEWEL BERNAL
      </a>
      <nav className="order-last flex w-full items-center gap-6 font-mono text-xs text-ink-muted sm:order-none sm:w-auto sm:gap-8 sm:text-sm">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="transition-colors hover:text-ink"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-4">
        <a
          href="/cv"
          className="font-mono text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <span className="sm:hidden">CV</span>
          <span className="hidden sm:inline">Curriculum Vitae</span>
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
