"use client";

import { useEffect, useRef, useState } from "react";

export const navLinks = [
  { label: "Work", id: "work" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

// Which section is crossing the middle of the viewport (null while in the hero)
export function useActiveSection() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.getElementById(link.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
          else if (entry.target.id === sections[0]?.id && entry.boundingClientRect.top > 0) {
            setActive(null); // scrolled back up into the hero
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

// Ref for a scroll progress bar, written straight to the DOM to avoid re-rendering on scroll
export function useScrollProgress<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${progress})`;
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return ref;
}
