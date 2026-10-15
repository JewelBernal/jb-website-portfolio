"use client";

import { Fragment, useEffect, useId, useRef } from "react";

// Refraction tuning: how far the edges bend, and the extra spread per colour channel
const SCALE = -10;
const DISPERSION = 3;
const EDGE = 0.6; // fraction of the bar's height that acts as the curved lens rim

// Displacement map: neutral grey in the middle, red/blue gradients toward the edges,
// so feDisplacementMap pulls the backdrop outward near the rim like a thick lens
function displacementMap(width: number, height: number, radius: number) {
  const edge = Math.max(6, height * EDGE);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="r" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="#f00"/></linearGradient>
    <linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="#00f"/></linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#000"/>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#r)"/>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#b)" style="mix-blend-mode:difference"/>
  <rect x="${edge}" y="${edge}" width="${width - edge * 2}" height="${height - edge * 2}" rx="${Math.max(0, radius - edge / 2)}" fill="hsl(0 0% 50%)" style="filter:blur(${edge / 2}px)"/>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Only Chromium renders SVG filters in backdrop-filter; elsewhere the frosted CSS fallback stays
function supportsRefraction() {
  const brands = (navigator as Navigator & { userAgentData?: { brands: { brand: string }[] } })
    .userAgentData?.brands;
  return brands?.some((b) => b.brand === "Chromium") ?? false;
}

export function useLiquidGlass<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const mapRef = useRef<SVGFEImageElement>(null);
  const filterId = `liquid-glass-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const el = ref.current;
    const map = mapRef.current;
    if (!el || !map || !supportsRefraction()) return;

    const observer = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
      map.setAttribute("href", displacementMap(Math.round(width), Math.round(height), radius));
      map.setAttribute("width", String(Math.round(width)));
      map.setAttribute("height", String(Math.round(height)));
    });
    observer.observe(el);

    el.style.setProperty("--glass-filter", `url(#${filterId})`);
    el.dataset.refract = "true";

    return () => {
      observer.disconnect();
      el.style.removeProperty("--glass-filter");
      delete el.dataset.refract;
    };
  }, [filterId]);

  return { ref, mapRef, filterId };
}

// Each colour channel is displaced by a slightly different amount for a subtle prism fringe
const channels = [
  { scale: SCALE, matrix: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" },
  { scale: SCALE - DISPERSION, matrix: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" },
  { scale: SCALE - DISPERSION * 2, matrix: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" },
];

export function LiquidGlassFilter({
  id,
  mapRef,
}: {
  id: string;
  mapRef: React.Ref<SVGFEImageElement>;
}) {
  return (
    <svg aria-hidden width="0" height="0" className="pointer-events-none absolute">
      <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage ref={mapRef} x="0" y="0" preserveAspectRatio="none" result="map" />
        {channels.map((channel, i) => (
          <Fragment key={i}>
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={channel.scale}
              xChannelSelector="R"
              yChannelSelector="B"
              result={`displaced${i}`}
            />
            <feColorMatrix in={`displaced${i}`} type="matrix" values={channel.matrix} result={`channel${i}`} />
          </Fragment>
        ))}
        <feBlend in="channel0" in2="channel1" mode="screen" result="rg" />
        <feBlend in="rg" in2="channel2" mode="screen" result="rgb" />
        <feGaussianBlur in="rgb" stdDeviation="1.2" result="soft" />
        <feColorMatrix in="soft" type="saturate" values="1.6" />
      </filter>
    </svg>
  );
}
