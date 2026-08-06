type Project = {
  name: string;
  year: string;
  description: string;
  tags: string[];
  href: string;
};

const projects: Project[] = [
  {
    name: "QontaHub Design",
    year: "2026",
    description:
      "Full-measure design system for QontaHub App, an accounting practice-management platform.",
    tags: ["Figma"],
    href: "https://www.qontahub.com",
  },
  {
    name: "Portfolio Website v1",
    year: "2026",
    description:
      "This portfolio website ;)",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "shadcn", "Cloudflare"],
    href: "#",
  },
  {
    name: "Simmer Studios",
    year: "2025",
    description:
      "Redesign of the Simmer Studios website, updating the look yet keeping the playful style.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "Figma", "React"],
    href: "https://www.simmer-studios.com",
  },
  {
    name: "UpKeep",
    year: "2025",
    description: "A mobile app to hire cleaners to clean your space.",
    tags: ["Next.js", "TypeScript", "shadcn", "Supabase", "React", "Figma"],
    href: "#",
  },
  {
    name: "1Portal",
    year: "2025",
    description:
      "A student portal hub for students enrolled in iACADEMY.",
    tags: ["TailwindCSS", "PHP", "Figma"],
    href: "https://www.youtube.com/watch?v=3qrGMmcMlQk&feature=youtu.be",
  },
  {
    name: "OneStore",
    year: "2024",
    description:
      "An e-commerce website, music instrument and accessories store.",
    tags: ["JavaScript", "TailwindCSS", "mySQL", "Java", "Figma"],
    href: "https://youtu.be/GA3N75xdRhQ",
  },
];

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[11px] text-secondary-foreground">
      {label}
    </span>
  );
}

export default function Projects() {
  return (
    <section id="work" className="px-6 py-24 sm:px-10">
      <p className="mb-10 font-mono text-xs tracking-[0.2em] text-muted-foreground">
        PROJECTS
      </p>
      <div className=" border-t border-border">
        {projects.map((project) => (
          <a
            key={project.name}
            href={project.href}
            className="group flex flex-col justify-between gap-3 border-b border-border py-8 transition-colors hover:bg-foreground/[0.02] sm:flex-row sm:items-baseline sm:gap-8"
          >
            <div className="flex items-baseline gap-4 sm:w-1/3">
              <span className="pl-5 font-mono text-xs text-muted-foreground">
                {project.year}
              </span>
              <h3 className="font-heading text-2xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                {project.name}
              </h3>
            </div>
            <p className="text-muted-foreground sm:w-1/2">
              {project.description}
            </p>
            <div className="pr-5 flex flex-wrap gap-1.5 sm:w-1/6 sm:justify-end">
              {project.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
