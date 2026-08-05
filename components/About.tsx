const skills = {
  Languages: ["TypeScript", "JavaScript", "Python", "mySQL", "HTML/CSS", "Java", "C++/C#", "PHP"],
  "Frameworks & Tools": ["React", "Next.js", "Node.js", "Tailwind CSS"],
  Design: ["Figma", "Design Systems", "Prototyping"],
  Exploration: ["Unity 3D - Game Development", "Blender", "Game Design"],
};

export default function About() {
  return (
    <section id="about" className="border-t border-line px-6 py-24 sm:px-10">
      <div className="grid gap-12 sm:grid-cols-[1fr_1fr]">
        <div>
          <p className="mb-6 font-mono text-xs tracking-[0.2em] text-ink-muted">
            ABOUT
          </p>
          <p className="max-w-[42ch] text-lg leading-relaxed text-ink">
            I'm a software engineer who cares as much about how something looks as whether it works. I design and build interfaces end to end — from the Figma file to the deployed site — because I like seeing an idea stay intact the whole way through. Outside of that, I'm a game dev at heart, chasing the same mix of craft and play in projects nobody's paying me to finish.
          </p>
        </div>
        <div className="space-y-8">
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
