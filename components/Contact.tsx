import { ArrowUpRight, Clock, FileText } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Linkedin01Icon } from "@hugeicons/core-free-icons";

import CopyEmail from "@/components/contact/CopyEmail";
import LocalTime from "@/components/contact/LocalTime";

const email = "jewelbernal@proton.me";

const links = [
  {
    label: "GitHub",
    value: "github.com/JewelBernal",
    href: "https://github.com/JewelBernal",
    icon: <HugeiconsIcon icon={GithubIcon} size={16} />,
    external: true,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/jewel-bernal",
    href: "https://www.linkedin.com/in/jewel-bernal-69b274290/",
    icon: <HugeiconsIcon icon={Linkedin01Icon} size={16} />,
    external: true,
  },
  {
    label: "Curriculum Vitae",
    value: "Read or print my CV",
    href: "/cv",
    icon: <FileText className="h-4 w-4" />,
    external: false,
  },
];

function IconSquare({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-line bg-secondary text-ink-muted transition-colors group-hover:text-ink">
      {children}
    </span>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="border-t border-line px-6 py-24 sm:px-10">
      <p className="mb-10 font-mono text-xs tracking-[0.2em] text-ink-muted">
        CONTACT
      </p>

      <div className="grid gap-14 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
        <div>
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 font-mono text-xs text-ink-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Currently building at{" "}
            <a
              href="https://www.qontahub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink transition-colors hover:text-highlight"
            >
              QontaHub
            </a>
          </span>

          <h2 className="max-w-[16ch] font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Have an idea? Let&apos;s build it.
          </h2>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${email}`}
              className="break-all border-b border-ink pb-1 text-xl font-medium tracking-tight text-ink transition-colors hover:border-highlight hover:text-highlight sm:text-3xl"
            >
              {email}
            </a>
            <CopyEmail email={email} />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-line bg-card">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
              className="group flex items-center gap-4 border-b border-line px-5 py-4 transition-colors hover:bg-foreground/[0.03]"
            >
              <IconSquare>{link.icon}</IconSquare>
              <span className="min-w-0 flex-1">
                <span className="block font-mono text-[11px] text-ink-muted">
                  {link.label}
                </span>
                <span className="block truncate text-sm text-ink">{link.value}</span>
              </span>
              <ArrowUpRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-ink-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
              />
            </a>
          ))}
          <div className="flex items-center gap-4 px-5 py-4">
            <IconSquare>
              <Clock className="h-4 w-4" />
            </IconSquare>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[11px] text-ink-muted">
                Local time
              </span>
              <span className="block text-sm text-ink">
                <LocalTime /> · Manila, PH (UTC+8)
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
