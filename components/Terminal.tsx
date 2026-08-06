"use client";

import { useEffect, useRef, useState } from "react";

type LineKind = "input" | "output" | "error";
interface TerminalLine {
  kind: LineKind;
  text: string;
}

const PROMPT = "guest@anonymous:~$";

const COMMANDS: Record<string, (args: string[]) => string[]> = {
  help: () => [
    "Available commands:",
    "  about      – who I am, in one breath",
    "  skills     – languages, frameworks, tools",
    "  projects   – recent work",
    "  contact    – how to reach me",
    "  whoami     – guess",
    "  ls         – list sections",
    "  sudo       – don't",
    "  clear      – wipe the screen",
  ],
  about: () => [
    "Software engineer who cares as much about how it looks as whether it works.",
    "I design and build interfaces end to end, from the Figma file to the deployed site.",
    "Game dev at heart on the side — Unity, Blender, projects nobody's paying me to finish.",
  ],
  skills: () => [
    "Languages:         TypeScript, JavaScript, HTML/CSS, Java, C++, C#, Python, SQL, PHP",
    "Frameworks & Tools: React, Next.js, Node.js, Tailwind, shadcn-ui, Spring Boot, Bootstrap,",
    "                    Supabase, Firebase, MongoDB, Git, GitHub, Jira, Cloudflare, Vercel",
    "Design:             Figma, Design Systems, Prototyping",
  ],
  projects: () => [
    "QontaHub Design      – design system, accounting platform  (2026)",
    "Portfolio Website v1 – this very site                       (2026)",
    "Simmer Studios        – Next.js redesign                     (2025)",
    "UpKeep                 – mobile app, hire cleaners            (2025)",
    "1Portal                – iACADEMY student portal              (2025)",
    "OneStore                – e-commerce, instruments store        (2024)",
    "Scroll down to Projects for the actual links.",
  ],
  contact: () => [
    "Email:    jewelbernal@proton.me / jwlbernal@gmail.com",
    "GitHub:   github.com/JewelBernal",
    "LinkedIn: linkedin.com/in/jewel-bernal",
  ],
  whoami: () => ["A visitor with excellent taste in monospace fonts."],
  ls: () => ["about  skills  projects  contact  whoami  hobbies"],
  hobbies: () => [
    "Unity 3D, Blender, chasing pixel-perfect, losing gracefully to my own scope creep... aaand a little bit of piano and guitar",
  ],
  sudo: () => ["Permission denied: nice try."],
};

const WELCOME: TerminalLine[] = [
  { kind: "output", text: "Welcome. Type 'help' to see what this thing does." },
];

export default function Terminal() {
  const [lines, setLines] = useState<TerminalLine[]>(WELCOME);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  function runCommand(raw: string) {
    const trimmed = raw.trim();
    const echoedLine: TerminalLine = { kind: "input", text: `${PROMPT} ${raw}` };

    if (trimmed === "") {
      setLines((prev) => [...prev, echoedLine]);
      return;
    }

    if (trimmed.toLowerCase() === "clear") {
      setLines([]);
      return;
    }

    const [cmd, ...args] = trimmed.split(/\s+/);
    const handler = COMMANDS[cmd.toLowerCase()];

    const output: TerminalLine[] = handler
      ? handler(args).map((text) => ({ kind: "output" as const, text }))
      : [{ kind: "error" as const, text: `command not found: ${cmd} (try 'help')` }];

    setLines((prev) => [...prev, echoedLine, ...output]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      runCommand(value);
      // Only remember non-empty commands in history, like every real shell does
      setHistory((prev) => (value.trim() ? [...prev, value] : prev));
      setHistoryIndex(null);
      setValue("");
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex =
        historyIndex === null ? history.length - 1 : Math.max(historyIndex - 1, 0);
      setHistoryIndex(nextIndex);
      setValue(history[nextIndex]);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setValue("");
      } else {
        setHistoryIndex(nextIndex);
        setValue(history[nextIndex]);
      }
    }
  }

  return (
    <div

      onClick={() => inputRef.current?.focus()}
      className="w-full max-w-lg overflow-hidden rounded-xl border border-line bg-card shadow-2xl shadow-black/10"
    >

      <div className="flex items-center gap-2 border-b border-line bg-secondary/60 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-2 truncate font-mono text-xs text-ink-muted">
          guest@anonymous — zsh
        </span>
      </div>

      <div
        ref={bodyRef}
        className="h-72 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed sm:h-80"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.kind === "input"
                ? "text-ink"
                : line.kind === "error"
                ? "text-red-500"
                : "whitespace-pre-wrap text-ink-muted"
            }
          >
            {line.text}
          </div>
        ))}

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-ink">{PROMPT}</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            style={{ caretColor: "var(--accent)" }}
            className="flex-1 bg-transparent text-ink outline-none"
          />
        </div>
      </div>
    </div>
  );
}
