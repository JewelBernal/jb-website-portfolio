"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintButton() {
  return (
    <Button size="lg" className="px-3 font-mono" onClick={() => window.print()}>
      <Printer data-icon="inline-start" />
      Print / Save PDF
    </Button>
  );
}
