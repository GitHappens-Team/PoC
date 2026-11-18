export function AuthHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 text-center">
      <h1 className="text-title text-balance">{title}</h1>
      {children && <p className="text-body text-pretty text-ink-muted">{children}</p>}
    </div>
  );
}

export function AuthFooter({ children }: { children: React.ReactNode }) {
  return <p className="text-small text-center text-ink-muted">{children}</p>;
}

export const linkClass = "font-medium text-brand-accent underline-offset-4 hover:underline";
