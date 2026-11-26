function required(name: string, v?: string): string {
  const value = v ?? process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: () => required("DATABASE_URL"),
  NEXT_PUBLIC_SUPABASE_URL: () =>
    required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: () =>
    required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,

    ),
  SHOPIFY_SHOP_DOMAIN: () => required("SHOPIFY_SHOP_DOMAIN"),
  SHOPIFY_CLIENT_ID: () => required("SHOPIFY_CLIENT_ID"),
  SHOPIFY_CLIENT_SECRET: ()=> required("SHOPIFY_CLIENT_SECRET"),

};
