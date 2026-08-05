export default function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-line px-6 py-8 font-mono text-xs text-ink-muted sm:px-10">
      <span>© {new Date().getFullYear()} Jewel Bernal</span>
      <span>Built with Next.js / shadcn-ui / tailwind</span>
    </footer>
  );
}
