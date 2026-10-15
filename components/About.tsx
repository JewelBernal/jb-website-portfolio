const skills = {
  Education: ["B.S. Computer Science / Software Engineering - iACADEMY Nexus (2022-2026)", "B.S. Information Technology - National University Manila (2020-2021)"],
  "Favorite Editor": ["Zed"],
  Languages: ["TypeScript", "JavaScript", "HTML/CSS", "Java", "C++", "C#", "Python", "SQL", "PHP"],
  "Frameworks & Tools": ["React", "ReactNative", "Next.js", "Node.js", "TanStack", "Radix UI", "Tailwind CSS", "shadcn-ui", "Zod", "Vite", "Vitest", "Turborepo", "i18next", "Expo.dev",  "Cloudflare", "Vercel", "Bootstrap", "SpringBoot", "Supabase", "Firebase", "MongoDB", "Git", "Github", "Jira" ],
  Design: ["Figma", "Design Systems", "Prototyping"],
  Exploration: ["Unity 3D - Game Development", "Blender", "Game Design"],
};

const hobbies = ["playing piano", "playing guitar", "video games", "developing a game"];

// Monochrome syntax colours, so the snippet stays on theme
const syntax = {
  comment: "italic text-ink-muted/60",
  keyword: "text-ink-muted",
  name: "font-medium text-ink",
  punct: "text-ink-muted/70",
  string: "text-ink",
};

const codeLines: React.ReactNode[] = [
  <span key="c" className={syntax.comment}>{"// things I do outside work"}</span>,
  <>
    <span className={syntax.keyword}>export const </span>
    <span className={syntax.name}>hobbies</span>
    <span className={syntax.punct}> = [</span>
  </>,
  ...hobbies.map((hobby) => (
    <>
      {"  "}
      <span className={syntax.string}>&quot;{hobby}&quot;</span>
      <span className={syntax.punct}>,</span>
    </>
  )),
  <>
    <span className={syntax.punct}>];</span>
    <span aria-hidden className="cursor-blink">▍</span>
  </>,
];

export default function About() {
  return (
    <section id="about" className="border-t border-line px-6 py-24 sm:px-10">
      <div className="grid gap-12 sm:grid-cols-[1fr_1fr]">
        <div>
          <p className="mb-6 font-mono text-xs tracking-[0.2em] text-ink-muted">
            ABOUT
          </p>
          <p className="max-w-[42ch] text-lg leading-relaxed text-ink">
            I'm a <span className="font-bold">software engineer</span> who cares as much about how something looks as whether it works. I design and build interfaces end to end — from the Figma file to the deployed site — because I like seeing an idea stay intact the whole way through. Outside of that, I'm a game dev at heart, chasing the same mix of craft and play in projects nobody's paying me to finish.
          </p>
          <p className="mb-4 mt-12 font-mono text-xs tracking-[0.2em] text-ink-muted">
            OFF THE CLOCK
          </p>
          <div className="max-w-[42ch] overflow-hidden rounded-xl border border-line bg-card shadow-lg shadow-black/5">
            <div className="flex items-center gap-1.5 border-b border-line bg-secondary/60 px-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
              <span className="-mb-px ml-3 border-x border-b border-x-line border-b-card bg-card px-3 py-2 font-mono text-[11px] text-ink">
                hobbies.ts
              </span>
            </div>
            <pre className="overflow-x-auto py-3 font-mono text-[13px] leading-relaxed">
              <code>
                {codeLines.map((line, i) => (
                  <div key={i} className="flex">
                    <span
                      aria-hidden
                      className="w-10 shrink-0 select-none pr-4 text-right text-ink-muted/50"
                    >
                      {i + 1}
                    </span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
        <div className="space-y-8 lg:mr-64 sm: mr-1">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category}>
              <p className="mb-3 font-mono text-xs text-ink-muted">
                {category}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {items.map((item) => (
                  <span key={item} className="font-sans text-sm text-ink">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
