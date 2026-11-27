import "server-only";
import { createShopifyClient, type ShopifyClient } from "@repo/shopify";
import { env } from "./env";

let defaultClient: ShopifyClient | null = null;

export function getDefaultShopifyClient(): ShopifyClient {
  if (!defaultClient) {
    defaultClient = createShopifyClient({
      shopDomain: env.SHOPIFY_SHOP_DOMAIN(),
      clientId: env.SHOPIFY_CLIENT_ID(),
      clientSecret: env.SHOPIFY_CLIENT_SECRET(),
    });
  }
  return defaultClient;
}
