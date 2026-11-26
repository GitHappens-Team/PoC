import "@shopify/shopify-api/adapters/node";
import {
  shopifyApi,
  ApiVersion,
  LogSeverity,
  type Session,
} from "@shopify/shopify-api";
import { env } from "./env";

const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 min

function isUnauthorizedError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return false;
  }
  const response = (
    error as { response?: { code?: number; statusCode?: number } }
  ).response;
  return response?.code === 401 || response?.statusCode === 401;
}

function validateConfig(config: ShopifyClientConfig): void {
  const requiredFields = ["shopDomain", "clientId", "clientSecret"] as const;
  for (const field of requiredFields) {
    if (!config[field].trim()) {
      throw new Error(`Missing required config: ${field}`);
    }
  }
}

export interface ShopifyClientConfig {
  shopDomain: string;
  clientId: string;
  clientSecret: string;
  scopes?: string[];
}

export interface ShopifyClient {
  query<T = unknown>(
    graphqlQuery: string,
    variables?: Record<string, unknown>,
  ): Promise<T>;
}

export function createShopifyClient(config: ShopifyClientConfig): ShopifyClient {
  validateConfig(config);

  const shopify = shopifyApi({
    apiKey: config.clientId,
    apiSecretKey: config.clientSecret,
    scopes: config.scopes ?? ["read_products"],
    hostName: "localhost",
    apiVersion: ApiVersion.October26,
    isEmbeddedApp: false,
    logger: { level: LogSeverity.Warning },
  });

  let cachedSession: Session | null = null;
  let pendingSession: Promise<Session> | null = null;

  async function fetchSession(): Promise<Session> {
    try {
      const token = await shopify.auth.clientCredentials({
        shop: config.shopDomain,
      });
      cachedSession = token.session;
      return token.session;
    } finally {
      pendingSession = null;
    }
  }

  function isSessionExpired(session: Session): boolean {
    return !session.expires
      ? false
      : session.expires.getTime() <= Date.now() + TOKEN_REFRESH_BUFFER_MS;
  }

  async function getSession(): Promise<Session> {
    if (cachedSession && !isSessionExpired(cachedSession)) {
      return cachedSession;
    } else {
      if (!pendingSession) {
        pendingSession = fetchSession();
      }
    }

    return pendingSession;
  }

  async function executeRequest<T = unknown>(
    session: Session,
    graphqlQuery: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const client = new shopify.clients.Graphql({ session });
    const response = await client.request<T>(
      graphqlQuery,
      variables ? { variables } : undefined,
    );
    if (response.data === undefined) {
      throw new Error("Empty response from Shopify");
    }
    return response.data;
  }

  async function query<T = unknown>(
    graphqlQuery: string,
    variables?: Record<string, unknown>,
  ): Promise<T> {
    const session = await getSession();
    try {
      return await executeRequest<T>(session, graphqlQuery, variables);
    } catch (error) {
      if (isUnauthorizedError(error)) {
        if (cachedSession === session) {
          cachedSession = null;
        }
        const freshSession = await getSession();
        return await executeRequest<T>(freshSession, graphqlQuery, variables);
      }
      throw error;
    }
  }

  return { query };
}

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
