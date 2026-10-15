"use client";

import type { ComponentProps } from "react";

import { scrollToSection } from "@/lib/scroll";

// An in-page anchor that smooth-scrolls to its section without adding a #hash to the URL
export default function ScrollLink({ to, ...props }: { to: string } & ComponentProps<"a">) {
  return <a href={`#${to}`} onClick={(e) => scrollToSection(e, to)} {...props} />;
}
