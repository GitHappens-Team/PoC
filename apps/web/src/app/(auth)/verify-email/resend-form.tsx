"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResendVerification } from "../resend-verification";

export function ResendForm() {
  const [email, setEmail] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  return (
    <div className="flex w-full flex-col gap-3 text-left">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      {valid && <ResendVerification key={email.trim()} email={email.trim()} />}
    </div>
  );
}
