type SideProject = {
  name: string;
  year: string;
  description: string;
  tags: string[];
  href: string;
}

const sideProjects: SideProject[] = [
  {
    name: "Alone",
    year: "2023",
    description: "A short-story horror game (demo only)",
    tags: ["Unity 5", "Blender 3D", "C#"],
    href:"#"
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
    <section id="work" className="px-6 pb-24 sm:px-10">
      <p className="mb-10 font-mono text-xs tracking-[0.2em] text-muted-foreground">
        SIDE PROJECTS
      </p>
      <div className="border-t border-border">
        {sideProjects.map((sideproject) => (
          <a
            key={sideproject.name}
            href={sideproject.href}
            className="group flex flex-col justify-between gap-3 border-b border-border py-8 transition-colors hover:bg-foreground/[0.02] sm:flex-row sm:items-baseline sm:gap-8"
          >
            <div className="pl-5 flex items-baseline gap-4 sm:w-1/3">
              <span className="font-mono text-xs text-muted-foreground">
                {sideproject.year}
              </span>
              <h3 className="font-heading text-2xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                {sideproject.name}
              </h3>
            </div>
            <p className="text-muted-foreground sm:w-1/2">
              {sideproject.description}
            </p>
            <div className="pr-5 flex flex-wrap gap-1.5 sm:w-1/6 sm:justify-end">
              {sideproject.tags.map((tag) => (
                <Tag key={tag} label={tag} />
              ))}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
