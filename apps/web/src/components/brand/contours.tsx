import { cn } from "@/lib/utils";

/* Faint topographic contours, drawn with currentColor so tokens drive the tint. */
export function Contours({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 size-full text-brand-300/40 dark:text-brand-700/50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,#000_20%,transparent_75%)]",
        className,
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <path
          key={i}
          d={`M-40 ${300 + (i - 4) * 46} C 120 ${230 + (i - 4) * 46 - i * 6}, 260 ${
            380 + (i - 4) * 40
          }, 420 ${300 + (i - 4) * 44} S 700 ${210 + (i - 4) * 48}, 840 ${
            290 + (i - 4) * 46
          }`}
        />
      ))}
      {[0, 1, 2, 3].map((i) => (
        <ellipse
          key={`e${i}`}
          cx="600"
          cy="180"
          rx={30 + i * 34}
          ry={18 + i * 22}
          transform="rotate(-18 600 180)"
        />
      ))}
    </svg>
  );
}
