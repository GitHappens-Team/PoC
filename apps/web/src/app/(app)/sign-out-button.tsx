import { IconLogout } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="outline">
        <IconLogout data-icon="inline-start" />
        Sign out
      </Button>
    </form>
  );
}
