import "server-only";

import { createDb } from "@repo/db";
import { env } from "./env";

/** The app's single database client (connection pool), shared by auth and app queries. */
export const db = createDb(env.DATABASE_URL());
