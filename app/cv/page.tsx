import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import GridBackground from "@/components/GridBackground";
import ThemeToggle from "@/components/ThemeToggle";
import PrintButton from "@/components/cv/PrintButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CV — Jewel Bernal",
  description: "Curriculum vitae of Jewel Bernal, software engineer, web developer and designer.",
};

type Role = {
  company: string;
  title: string;
  location?: string;
  period: string;
  points: string[];
};

const experience: Role[] = [
  {
    company: "QontaHub",
    title: "Software Engineer",
    period: "Sep 2026 — Present",
    points: [
      "Build features for QontaHub's accounting practice-management app in React and TypeScript, such as contact-form submission with response tracking, receipts and printing.",
      "Designed QontaHub's design system in Figma and build its shared component library with Radix UI and Tailwind CSS.",
      "Improve navigation and interaction across the app, from grouped side navigation to keyboard support in data lists.",
    ],
  },
  {
    company: "Simmer Studios",
    title: "Web Developer & Designer",
    location: "Marikina",
    period: "Aug 2026 — Present",
    points: [
      "Developed and redesigned websites using Next.js, Tailwind and React, improving visual polish and performance.",
      "Designed components and pages in Figma for a web application.",
      "Built and designed websites using Shopify and HTML/CSS.",
    ],
  },
  {
    company: "Simmer Studios",
    title: "Web Developer & Designer Intern",
    location: "Marikina",
    period: "Aug 2025 — May 2026",
    points: [
      "Assisted in improving component and page designs.",
      "Assisted in creating design solutions.",
      "Worked side-by-side with a client to improve work efficiency.",
    ],
  },
  {
    company: "Self-employed",
    title: "Game Development",
    period: "Apr 2021 — Present",
    points: [
      "Developing a game single-handedly.",
      "Developed a game demo for a school project using Unity, Blender and C#.",
      "Developed and optimized interactive gameplay mechanics in Unity and C# to improve player engagement.",
    ],
  },
];

const skills: Record<string, string[]> = {
  Languages: ["TypeScript", "JavaScript", "HTML/CSS", "Java", "C++", "C#", "Python", "SQL", "PHP"],
  "Frameworks & Tools": ["React", "React Native", "Next.js", "Node.js", "TanStack", "Radix UI", "Tailwind CSS", "shadcn/ui", "Zod", "Vite", "Vitest", "Turborepo", "i18next", "Expo", "Spring Boot", "Supabase", "Firebase", "MongoDB", "Shopify", "Cloudflare", "Vercel", "Git", "Jira"],
  Design: ["Figma", "Design Systems", "Prototyping", "Adobe Photoshop", "Adobe Premiere Pro"],
  "Game Dev": ["Unity 3D", "Blender", "Game Design"],
};

const contact = [
  { label: "Location", value: "Manila, PH" },
  { label: "Email", value: "jewelbernal@proton.me", href: "mailto:jewelbernal@proton.me" },
  { label: "GitHub", value: "github.com/JewelBernal", href: "https://github.com/JewelBernal" },
  { label: "LinkedIn", value: "linkedin.com/in/jewel-bernal", href: "https://www.linkedin.com/in/jewel-bernal-69b274290/" },
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-mono text-xs tracking-[0.2em] text-muted-foreground">
      {children}
    </h2>
  );
}

export default function CVPage() {
  return (
    <div className="relative flex-1 px-4 pb-24 sm:px-10 print:p-0">
      <div className="print:hidden">
        <GridBackground />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[860px] items-center justify-between gap-3 py-6 print:hidden">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-3 font-mono")}
        >
          <ArrowLeft data-icon="inline-start" />
          Back home
        </Link>
        <div className="flex items-center gap-3">
          <PrintButton />
          <ThemeToggle />
        </div>
      </div>

      <article className="relative z-10 mx-auto max-w-[860px] rounded-xl border border-line bg-card px-6 py-10 shadow-2xl shadow-black/5 sm:px-12 sm:py-14 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <header className="border-b border-line pb-8">
          <p className="mb-4 font-mono text-xs tracking-[0.2em] text-ink-muted">
            CURRICULUM VITAE
          </p>
          <h1 className="font-display text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl print:text-4xl">
            Jewel Bernal
            <span className="cursor-blink print:hidden">_</span>
          </h1>
          <p className="mt-3 font-mono text-sm text-ink-muted">
            Software Engineer — Web Developer &amp; Designer
          </p>
        </header>

        <div className="grid gap-10 pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] md:gap-12 print:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] print:gap-10">
          <aside className="space-y-8">
            <section>
              <SectionLabel>CONTACT</SectionLabel>
              <dl className="space-y-3 text-sm">
                {contact.map((item) => (
                  <div key={item.label}>
                    <dt className="font-mono text-[11px] text-ink-muted">{item.label}</dt>
                    <dd className="break-words text-ink">
                      {item.href ? (
                        <a
                          href={item.href}
                          className="border-b border-transparent transition-colors hover:border-highlight hover:text-highlight"
                        >
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <SectionLabel>SKILLS</SectionLabel>
              <div className="space-y-4">
                {Object.entries(skills).map(([group, items]) => (
                  <div key={group}>
                    <p className="mb-2 font-mono text-[11px] text-ink-muted">{group}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[11px] text-secondary-foreground"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionLabel>EDUCATION</SectionLabel>
              <p className="font-mono text-[11px] text-ink-muted">Aug 2022 — Aug 2026</p>
              <p className="mt-1 text-sm font-medium text-ink">
                B.S. Computer Science — Software Engineering
              </p>
              <p className="text-sm text-ink-muted">iACADEMY Nexus, Makati</p>
            </section>

            <section>
              <SectionLabel>REFERENCES</SectionLabel>
              <p className="text-sm text-ink-muted">Available on request.</p>
            </section>
          </aside>

          <div className="space-y-10">
            <section>
              <SectionLabel>PROFILE</SectionLabel>
              <p className="leading-relaxed text-ink">
                Web developer and designer with hands-on experience building and
                redesigning websites with Next.js, React and Tailwind to improve
                performance and visual appeal. Comfortable taking an interface from
                a Figma file to a deployed site, and building e-commerce sites with
                Shopify, HTML and CSS. Game developer at heart, chasing the same mix
                of craft and play.
              </p>
            </section>

            <section>
              <SectionLabel>EXPERIENCE</SectionLabel>
              <div className="border-t border-line">
                {experience.map((role) => (
                  <div
                    key={`${role.company}-${role.title}`}
                    className="break-inside-avoid border-b border-line py-6 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline sm:gap-6 print:flex-row print:items-baseline">
                      <h3 className="text-lg font-medium tracking-tight text-ink">
                        {role.company}
                      </h3>
                      <span className="shrink-0 font-mono text-xs text-ink-muted">
                        {role.period}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-ink-muted">
                      {role.title}
                      {role.location && ` · ${role.location}`}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink">
                      {role.points.map((point) => (
                        <li key={point} className="flex gap-3">
                          <span aria-hidden className="select-none font-mono text-ink-muted">
                            —
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </div>
  );
}
