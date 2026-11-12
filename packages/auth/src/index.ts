import {
  CookieMethodsServer,
  createBrowserClient,
  createServerClient,
} from "@supabase/ssr";

export function createServerSupabase({
  url,
  key,
  cookies,
}: {
  url: string;
  key: string;
  cookies: CookieMethodsServer;
}) {
  return createServerClient(url, key, {
    cookies,
  });
}

export function createBrowserSupabase({
  url,
  key,
}: {
  url: string;
  key: string;
}) {
  return createBrowserClient(url, key);
}

export type { User } from "@supabase/supabase-js";
