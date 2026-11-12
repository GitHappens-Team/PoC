import { IconBrandGoogle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "./actions";

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <Button type="submit" className="w-full">
        <IconBrandGoogle /> Continue with Google
      </Button>
    </form>
  );
}
