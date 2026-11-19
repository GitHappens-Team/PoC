import { drizzle, PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { ExtractTablesWithRelations, sql } from "drizzle-orm";
import { PgTransaction } from "drizzle-orm/pg-core";

export function createDb(url: string) {
  return drizzle(postgres(url), { schema });
}

/**
 * Wraps db transactions with needed RLS instructions
 * @param db drizzle's db object
 * @param claims claims from the user's token
 * @param fn transaction body function
 * @returns the transaction promise
 */
export async function withRls<T>(
  db: Db,
  claims: { sub: string; role?: string; [k: string]: unknown },
  fn: (
    tx: PgTransaction<
      PostgresJsQueryResultHKT,
      typeof schema,
      ExtractTablesWithRelations<typeof schema>
    >,
  ) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('request.jwt.claims', ${JSON.stringify(claims)}, true)`,
    );
    await tx.execute(sql`set local role authenticated`);

    return fn(tx);
  });
}

export type Db = ReturnType<typeof createDb>;
export { schema };
