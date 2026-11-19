import * as React from "react";
import { cn } from "@/lib/utils";

const tones = {
  error: "border-destructive/40 bg-destructive/10 text-destructive",
  success: "border-primary-border/40 bg-brand-100/60 text-ink dark:bg-brand-800/40",
  info: "border-border bg-secondary text-ink",
};

function Alert({
  tone = "error",
  className,
  ...props
}: React.ComponentProps<"div"> & { tone?: keyof typeof tones }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-md border px-3 py-2 text-small", tones[tone], className)}
      {...props}
    />
  );
}

export { Alert };
