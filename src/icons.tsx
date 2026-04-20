import React from "react";

/**
 * LucideIcon shim — renders <i data-lucide="name"> elements
 * that get replaced by lucide.createIcons() from the CDN script in index.html.
 */
export function LucideIcon({
  name,
  size = 24,
  strokeWidth = 2,
  color = "currentColor",
  className = "",
  fill,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
  fill?: string;
  [key: string]: any;
}) {
  return (
    <i
      data-lucide={name}
      style={{ display: "inline-block", width: size, height: size, color }}
      className={className}
    />
  );
}
