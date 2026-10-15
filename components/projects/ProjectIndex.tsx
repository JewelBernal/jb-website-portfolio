"use client";

import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Project } from "@/components/projects/types";

function slug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function Tag({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-secondary px-2.5 py-0.5 font-mono text-[11px] text-secondary-foreground">
      {label}
    </span>
  );
}

function Readme({ project }: { project: Project }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs text-muted-foreground">
          {project.year} · {project.categories.join(" / ")}
        </p>
        <h3 className="mt-2 font-heading text-3xl font-medium tracking-tight text-foreground">
          {project.name}
        </h3>
      </div>
      <p className="leading-relaxed text-muted-foreground">
        {project.description}
      </p>
      <div>
        <p className="mb-3 font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
          STACK
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>
      {(project.href || project.note) && (
        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
          {project.href && (
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 font-mono text-sm text-primary-foreground transition-colors hover:bg-primary/80"
            >
              View project
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
          {project.note && (
            <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {project.note}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const current = projects[active];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
      <ol className="border-t border-border">
        {projects.map((project, i) => {
          const isActive = i === active;
          return (
            <li key={project.name} className="border-b border-border">
              <button
                type="button"
                aria-expanded={isActive}
                aria-controls={`project-${slug(project.name)}`}
                onClick={() => setActive(i)}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className="group flex w-full items-baseline gap-5 py-5 text-left"
              >
                <span
                  className={cn(
                    "w-6 shrink-0 font-mono text-xs transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground/60",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "flex-1 font-heading text-2xl font-medium tracking-tight transition-all duration-300 sm:text-4xl",
                    isActive
                      ? "text-foreground motion-safe:translate-x-1"
                      : "text-muted-foreground/50 group-hover:text-muted-foreground",
                  )}
                >
                  {project.name}
                </span>
                <span className="hidden shrink-0 font-mono text-xs text-muted-foreground sm:inline">
                  {project.year}
                </span>
                <ArrowRight
                  aria-hidden
                  className={cn(
                    "hidden h-4 w-4 shrink-0 self-center transition-all lg:block",
                    isActive
                      ? "text-foreground opacity-100"
                      : "-translate-x-2 opacity-0",
                  )}
                />
              </button>

              {/* Below lg the details open inline, accordion-style */}
              {isActive && (
                <div className="pb-8 pl-11 motion-safe:animate-in motion-safe:fade-in-0 lg:hidden">
                  <Readme project={project} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="hidden lg:block">
        <div
          id={`project-${slug(current.name)}`}
          className="sticky top-28 overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/5"
        >
          <div className="flex items-center gap-2 border-b border-border bg-secondary/60 px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
            <span className="ml-2 truncate font-mono text-xs text-muted-foreground">
              ~/projects/{slug(current.name)}/README.md
            </span>
          </div>
          <div
            key={current.name}
            className="p-8 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-300"
          >
            <Readme project={current} />
          </div>
        </div>
      </div>
    </div>
  );
}
