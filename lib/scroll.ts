import type { MouseEvent } from "react";

let cancelCurrent: (() => void) | null = null;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

// Animate the scroll ourselves: native smooth scrolling can be switched off per browser
// (e.g. Vivaldi's smooth scrolling setting), which turns behavior: "smooth" into a jump
function animateScrollTo(target: number) {
  cancelCurrent?.();

  const start = window.scrollY;
  const distance = target - start;
  if (Math.abs(distance) < 1) return;

  const duration = Math.min(900, Math.max(400, Math.abs(distance) * 0.35));
  const startTime = performance.now();
  let frame = 0;

  // Hand control back as soon as the visitor scrolls themselves
  const stop = () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
    cancelCurrent = null;
  };
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", stop);
  cancelCurrent = stop;

  const step = (now: number) => {
    const progress = Math.min(1, (now - startTime) / duration);
    window.scrollTo({ top: start + distance * easeInOutCubic(progress), behavior: "instant" });
    if (progress < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
}

// Smooth-scroll to a section (or the top) without putting a #hash in the URL
export function scrollToSection(event: MouseEvent<HTMLAnchorElement>, id: string | null) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return; // let "open in new tab" work
  event.preventDefault();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const section = id ? document.getElementById(id) : null;
  if (id && !section) return;

  const marginTop = section ? parseFloat(getComputedStyle(section).scrollMarginTop) || 0 : 0;
  const target = section
    ? Math.min(
        section.getBoundingClientRect().top + window.scrollY - marginTop,
        document.documentElement.scrollHeight - window.innerHeight,
      )
    : 0;

  if (reduceMotion) window.scrollTo({ top: target, behavior: "instant" });
  else animateScrollTo(target);

  // Move keyboard focus along with the scroll, as following the anchor would have
  if (section) {
    if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
    section.focus({ preventScroll: true });
  }
}
