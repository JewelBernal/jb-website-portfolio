import ProjectIndex from "@/components/projects/ProjectIndex";
import type { Project } from "@/components/projects/types";

const projects: Project[] = [
  {
    name: "QontaHub",
    year: "2026",
    description:
      "Design system and frontend for QontaHub App, an accounting practice-management platform — from Figma to the shared React component library.",
    tags: ["Figma", "React", "TypeScript", "TanStack", "Radix UI", "TailwindCSS", "Vite"],
    categories: ["Web", "Design"],
    href: "https://www.qontahub.com",
    note: "Private",
    featured: true,
  },
  {
    name: "Portfolio Website v2",
    year: "2026",
    description:
      "This portfolio website ;) Reworked with proper dark mode, a printable CV page and this project index.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "shadcn", "Cloudflare"],
    categories: ["Web", "Design"],
    note: "You're here",
  },
  {
    name: "Portfolio Website v1",
    year: "2026",
    description:
      "The first version of this portfolio, with an interactive terminal in the hero.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "shadcn", "Cloudflare"],
    categories: ["Web"],
  },
  {
    name: "Simmer Studios",
    year: "2025",
    description:
      "Redesign of the Simmer Studios website, updating the look yet keeping the playful style.",
    tags: ["Next.js", "TypeScript", "TailwindCSS", "Figma", "React"],
    categories: ["Web", "Design"],
    href: "https://www.simmer-studios.com",
  },
  {
    name: "UpKeep",
    year: "2025",
    description: "A mobile/web app to hire cleaners to clean your space or offer your service.",
    tags: ["Expo.dev", "Next.js", "TypeScript", "TailwindCSS", "shadcn", "Supabase"],
    categories: ["Mobile", "Web"],
    note: "Private",
  },
  {
    name: "1Portal",
    year: "2025",
    description:
      "A student portal hub for students enrolled in iACADEMY.",
    tags: ["TailwindCSS", "PHP", "mySQL", "Figma"],
    categories: ["Web", "Design"],
    href: "https://www.youtube.com/watch?v=3qrGMmcMlQk&feature=youtu.be",
  },
  {
    name: "OneStore",
    year: "2024",
    description:
      "An e-commerce website, music instrument and accessories store.",
    tags: ["JavaScript", "TailwindCSS", "mySQL", "Java", "Figma"],
    categories: ["Web"],
    href: "https://youtu.be/GA3N75xdRhQ",
  },
  {
    name: "Alone",
    year: "2023",
    description: "A short-story horror game (demo only)",
    tags: ["Unity 5", "Blender 3D", "C#"],
    categories: ["Game"],
    href: "https://www.youtube.com/watch?v=pqfhLxTRfcE",
    note: "Side project",
  },
];

export default function Projects() {
  return (
    <section id="work" className="px-6 py-24 sm:px-10">
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-4 font-mono text-xs tracking-[0.2em] text-muted-foreground">
            PROJECTS
          </p>
          <h2 className="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Things I&apos;ve designed, built and shipped.
          </h2>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {String(projects.length).padStart(2, "0")} projects · 2023 — now
        </p>
      </div>
      <ProjectIndex projects={projects} />
    </section>
  );
}
