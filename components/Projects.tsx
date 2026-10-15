import { ArrowUpRight } from "lucide-react";

type Project = {
  name: string;
  year: string;
  description: string;
  tags: string[];
  href?: string;
};

const projects: Project[] = [
  {
    name: "QontaHub Design",
    year: "2026",
    description:
      "Design system and frontend for QontaHub App, an accounting practice-management platform — from Figma to the shared React component library.",
    tags: ["Figma", "React", "TypeScript", "TanStack", "Radix UI", "TailwindCSS", "Vite"],
    href: "https://www.qontahub.com",
  },
  {
    name: "Portfolio Website v1",
    year: "2026",
    description:
      "This portfolio website ;)",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "shadcn", "Cloudflare"],
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
    description: "A mobile/web app to hire cleaners to clean your space or offer your service.",
    tags: ["Expo.dev", "Next.js", "TypeScript", "TailwindCSS", "shadcn", "Supabase"],
  },
  {
    name: "1Portal",
    year: "2025",
    description:
      "A student portal hub for students enrolled in iACADEMY.",
    tags: ["TailwindCSS", "PHP", "mySQL", "Figma"],
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

const sideProjects: Project[] = [
  {
    name: "Alone",
    year: "2023",
    description: "A short-story horror game (demo only)",
    tags: ["Unity 5", "Blender 3D", "C#"],
    href: "https://www.youtube.com/watch?v=pqfhLxTRfcE",
  },
];

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[11px] text-secondary-foreground">
      {label}
    </span>
  );
}

const rowClass =
  "grid gap-3 border-b border-border px-5 py-7 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] md:items-baseline md:gap-8";

function ProjectRow({ project }: { project: Project }) {
  const content = (
    <>
      <span className="font-mono text-xs text-muted-foreground">
        {project.year}
      </span>
      <h3 className="flex items-start gap-1.5 font-heading text-2xl font-medium tracking-tight text-foreground">
        {project.name}
        {project.href && (
          <ArrowUpRight
            aria-hidden
            className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          />
        )}
      </h3>
      <p className="text-muted-foreground">{project.description}</p>
      <div className="flex flex-wrap gap-1.5 md:justify-end">
        {project.tags.map((tag) => (
          <Tag key={tag} label={tag} />
        ))}
      </div>
    </>
  );

  if (!project.href) {
    return <div className={rowClass}>{content}</div>;
  }

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group transition-colors hover:bg-foreground/[0.03] ${rowClass}`}
    >
      {content}
    </a>
  );
}

function ProjectList({ label, items }: { label: string; items: Project[] }) {
  return (
    <div>
      <p className="mb-10 font-mono text-xs tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <div className="border-t border-border">
        {items.map((project) => (
          <ProjectRow key={project.name} project={project} />
        ))}
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="work" className="space-y-24 px-6 py-24 sm:px-10">
      <ProjectList label="PROJECTS" items={projects} />
      <ProjectList label="SIDE PROJECTS" items={sideProjects} />
    </section>
  );
}
