import type { Metadata } from "next";
import { IconRocket } from "@tabler/icons-react";
import { requireSession } from "@/lib/session";
import { getDefaultShopifyClient } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const user = await requireSession("/dashboard");
  const shopify = getDefaultShopifyClient();

  const fullName: unknown = user.user_metadata?.full_name;
  const name = typeof fullName === "string" && fullName ? fullName : user.email;

  return (
    <>
      <h1 className="text-title">Hi, {name}!</h1>

      {/* Starting point: replace this card with your product's first screen. */}
      <section className="flex flex-col gap-3 rounded-lg border border-card-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-2">
          <IconRocket className="size-5 text-brand-accent" aria-hidden />
          <h2 className="text-heading">All set</h2>
        </div>
        <p className="text-body text-ink-muted">
          Your account is active. This page requires authentication: start from{" "}
          <code className="text-small">
            apps/web/src/app/(app)/dashboard/page.tsx
          </code>{" "}
          to build your product.
        </p>
        <p className="text-body text-ink-muted">
          Connected to shop:{" "}
          {
            (
              (await shopify.query(
                `#graphql
  {
  shop {
    name
    myshopifyDomain
    plan { displayName }
  }
}`,
                {},
              )) as any
            ).shop.name
          }
        </p>
      </section>
    </>
  );
}
