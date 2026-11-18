import clsx from "clsx";

export type SeparatorProps = React.ComponentProps<"div"> & {
  orientation: "horizontal" | "vertical";
};

export function Separator({
  className,
  orientation,
  ...props
}: SeparatorProps) {
  return (
    <div
      className={clsx(
        orientation === "horizontal" ? "h-px w-full" : "h-1/2 w-px",
        "bg-current/40",
        className,
      )}
      {...props}
    />
  );
}
