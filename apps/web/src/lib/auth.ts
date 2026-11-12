import { createAuth } from "@repo/auth";
import { db } from "./db";
import { env } from "./env";
import { authEmailSender } from "./email";
import { brand } from "@repo/brand";

export const auth = createAuth({
  db,
  appName: brand.name,
  baseURL: env.AUTH_BASE_URL(),
  secret: env.AUTH_SECRET(),
  email: authEmailSender,
  trustedProxies: env.TRUSTED_PROXIES(),
  ipAddressHeader: env.CLIENT_IP_HEADER(),
});
