"use client";

import { useId } from "react";

export function TripsterLogo({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const gradId = `tripster-grad-${useId()}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#fb7185" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${gradId})`} />
      <path d="M12 30 L36 14 L26 34 L22 27 Z" fill="#ffffff" />
      <path d="M22 27 L26 34 L36 14 Z" fill="#ffffff" fillOpacity="0.55" />
      <path
        d="M37 10 L37.6 11.6 L39.2 12 L37.6 12.4 L37 14 L36.4 12.4 L34.8 12 L36.4 11.6 Z"
        fill="#facc15"
      />
    </svg>
  );
}
