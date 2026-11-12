/** Shown after setting a password when the server couldn't check it against known breaches. */
export function BreachCheckNotice() {
  return (
    <p className="text-small text-ink-muted">
      Check whether your password has been exposed in a breach here:{" "}
      <a
        href="https://haveibeenpwned.com/Passwords"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline underline-offset-4"
      >
        haveibeenpwned.com
      </a>
    </p>
  );
}
