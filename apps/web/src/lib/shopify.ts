
import "@shopify/shopify-api/adapters/node"
import { shopifyApi, ApiVersion } from "@shopify/shopify-api"

export interface ShopifyClientConfig{
    shopDomain: string;
    clientId: string;
    clientSecret: string;
    scopes?:string[]  

}

export interface ShopifyClient{
    query<T= unknown>(graphqlQuery: string, variables?: Record<string, unknown>): Promise<T>
}

export  function createShopifyClient(config: ShopifyClientConfig): ShopifyClient{
    const shopify=shopifyApi({
  apiKey: config.clientId,
  apiSecretKey: config.clientSecret,
  scopes: config.scopes??["read_products"],
  hostName: "localhost",
  apiVersion: ApiVersion.October26,
  isEmbeddedApp: false,

    });
  async function query<T= unknown>(graphqlQuery:string, variables?:Record<string, unknown>): Promise<T> {
     const token=await shopify.auth.clientCredentials({shop:config.shopDomain});
     const client = new shopify.clients.Graphql({session: token.session});
     const response= await client.request<T>(graphqlQuery, variables?{variables}:undefined )
     if (response.data === undefined) { throw new Error("Empty response from Shopify"); }
     return response.data;


    
  }
   return{query}
}