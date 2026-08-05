const links = [
  { label: "Email", value: "jewelbernal@proton.me // jwlbernal@gmail.com"},
  {
    label: "GitHub",
    value: "github.com/JewelBernal",
    href: "https://github.com/JewelBernal",
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/jewel-bernal",
    href: "https://www.linkedin.com/in/jewel-bernal-69b274290/",
  },
];

export default function Contact() {
  return (
    <section
      id="contact"
      className="border-t border-line px-6 py-24 sm:px-10"
    >
      <p className="mb-6 font-mono text-xs tracking-[0.2em] text-ink-muted">
        CONTACT
      </p>
      <h2 className="mb-10 max-w-[24ch] font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
        Open to new projects and roles.
      </h2>
      <div className="flex flex-col gap-3">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="group flex w-fit items-baseline gap-4 font-mono text-sm"
          >
            <span className="text-ink-muted">{link.label}</span>
            <span className="border-b border-transparent text-ink transition-colors group-hover:border-accent group-hover:text-accent">
              {link.value}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
