"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({
  value,
  className = "",
  as: Component = "span",
  format,
  ariaLabel,
}: {
  value: number;
  className?: string;
  as?: any;
  format?: (v: number) => string | number;
  ariaLabel?: string;
}) {
  const prev = useRef<number>(value);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (value !== prev.current) {
      setFlash(value > prev.current ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 450);
      prev.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  const text = format ? format(value) : value;
  const flashClass = flash === "up" ? "bg-green-500/10 text-green-600 dark:text-green-400" : flash === "down" ? "bg-red-500/10 text-red-600 dark:text-red-400" : "";

  return (
    <Component
      className={["transition-colors duration-300 rounded px-0.5 tabular-nums", flashClass, className].filter(Boolean).join(" ")}
      aria-live="polite"
      aria-label={ariaLabel}
    >
      {text}
    </Component>
  );
}
