import * as React from "react";
import { Label } from "./label";

function Field({
  id,
  label,
  error,
  optional,
  hint,
  children,
}: {
  id: string;
  label: React.ReactNode;
  error?: string;
  optional?: boolean;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {optional && <span className="ml-1 font-normal text-ink-muted">(optional)</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-small text-ink-muted">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-small text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export { Field };
