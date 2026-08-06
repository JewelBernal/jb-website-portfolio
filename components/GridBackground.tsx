export default function GridBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">

      <div
        className="absolute inset-0 opacity-40 dark:opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse 65% 55% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 65% 55% at 50% 0%, black 40%, transparent 100%)",
        }}
      />
      <div
        className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-[0.12] blur-[150px]"
        style={{ background: "var(--primary)" }}
      />
    </div>
  );
}
