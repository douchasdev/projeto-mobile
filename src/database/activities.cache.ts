
import * as SQLite from "expo-sqlite";

import type { Activity } from "../types/Activity";

const DATABASE_NAME = "activities-cache.db";

export type CacheScope = "all" | "mine";

type CachedActivityRow = {
  activity_id: string;
  owner_id: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  location: string;
  completed: number;
};

type CacheMetadataRow = {
  synced_at: string;
};

export type CachedActivities = {
  activities: Activity[];
  syncedAt: string;
};

let databasePromise:
  | Promise<SQLite.SQLiteDatabase>
  | null = null;

// Serializa operações de escrita para evitar
// conflitos entre atualizações do cache.
let writeQueue: Promise<void> = Promise.resolve();

function enqueueWrite(
  operation: () => Promise<void>
): Promise<void> {
  const next = writeQueue.then(
    operation,
    operation
  );

  writeQueue = next.catch(() => {});

  return next;
}

// Converte a atividade do React Native
// para os parâmetros que serão armazenados.
function getScheduledAt(activity: Activity): string {
  const date = activity.date;
  const time = activity.time;

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    0,
    0
  ).toISOString();
}

// Reconstrói os objetos Date para os componentes.
function fromCacheRow(
  row: CachedActivityRow
): Activity {
  const scheduledAt = new Date(
    row.scheduled_at
  );

  return {
    id: row.activity_id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description ?? "",
    date: new Date(scheduledAt),
    time: new Date(scheduledAt),
    location: row.location,
    completed: row.completed === 1,
  };
}

async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync(
    DATABASE_NAME
  );

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS cached_activities (
      account_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      scheduled_at TEXT NOT NULL,
      location TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,

      PRIMARY KEY (
        account_id,
        scope,
        activity_id
      )
    );

    CREATE TABLE IF NOT EXISTS cache_metadata (
      account_id TEXT NOT NULL,
      scope TEXT NOT NULL,
      synced_at TEXT NOT NULL,

      PRIMARY KEY (account_id, scope)
    );

    CREATE INDEX IF NOT EXISTS
      idx_cached_activities_account
    ON cached_activities (account_id, scope);
  `);

  return db;
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise =
      initializeDatabase().catch((error) => {
        databasePromise = null;
        throw error;
      });
  }

  return databasePromise;
}

// Insere ou atualiza um registro específico.
async function upsertRow(
  transaction: Pick<SQLite.SQLiteDatabase, "runAsync">,
  accountId: string,
  scope: CacheScope,
  activity: Activity
) {
  await transaction.runAsync(
    `
      INSERT INTO cached_activities (
        account_id,
        scope,
        activity_id,
        owner_id,
        title,
        description,
        scheduled_at,
        location,
        completed
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT (
        account_id,
        scope,
        activity_id
      )
      DO UPDATE SET
        owner_id = excluded.owner_id,
        title = excluded.title,
        description = excluded.description,
        scheduled_at = excluded.scheduled_at,
        location = excluded.location,
        completed = excluded.completed
    `,
    accountId,
    scope,
    activity.id,
    activity.ownerId,
    activity.title,
    activity.description ?? null,
    getScheduledAt(activity),
    activity.location,
    activity.completed ? 1 : 0
  );
}

// Salva uma lista completa recebida do servidor.
// A transação evita um cache parcialmente atualizado.
export async function replaceCachedActivities(
  accountId: string,
  scope: CacheScope,
  activities: Activity[]
): Promise<void> {
  if (!accountId) {
    throw new Error(
      "Usuário necessário para salvar o cache."
    );
  }

  return enqueueWrite(async () => {
    const db = await getDatabase();

    await db.withExclusiveTransactionAsync(
      async (transaction) => {
        await transaction.runAsync(
          `
            DELETE FROM cached_activities
            WHERE account_id = ? AND scope = ?
          `,
          accountId,
          scope
        );

        for (const activity of activities) {
          await upsertRow(
            transaction,
            accountId,
            scope,
            activity
          );
        }

        await transaction.runAsync(
          `
            INSERT INTO cache_metadata (
              account_id,
              scope,
              synced_at
            )
            VALUES (?, ?, ?)

            ON CONFLICT (account_id, scope)
            DO UPDATE SET
              synced_at = excluded.synced_at
          `,
          accountId,
          scope,
          new Date().toISOString()
        );
      }
    );
  });
}

// Recupera o cache somente da conta autenticada.
// Retorna null caso nunca tenha sido sincronizado.
export async function readCachedActivities(
  accountId: string,
  scope: CacheScope
): Promise<CachedActivities | null> {
  if (!accountId) return null;

  // Aguarda escritas pendentes terminarem.
  await writeQueue;

  const db = await getDatabase();

  const metadata =
    await db.getFirstAsync<CacheMetadataRow>(
      `
        SELECT synced_at
        FROM cache_metadata
        WHERE account_id = ? AND scope = ?
      `,
      accountId,
      scope
    );

  if (!metadata) {
    return null;
  }

  const rows =
    await db.getAllAsync<CachedActivityRow>(
      `
        SELECT
          activity_id,
          owner_id,
          title,
          description,
          scheduled_at,
          location,
          completed
        FROM cached_activities
        WHERE account_id = ? AND scope = ?
        ORDER BY scheduled_at ASC
      `,
      accountId,
      scope
    );

  return {
    activities: rows.map(fromCacheRow),
    syncedAt: metadata.synced_at,
  };
}

// Mantém o cache atualizado após criar,
// editar ou alterar o status de uma atividade.
export async function upsertCachedActivity(
  accountId: string,
  activity: Activity
): Promise<void> {
  if (!accountId) return;

  return enqueueWrite(async () => {
    const db = await getDatabase();

    await db.withExclusiveTransactionAsync(
      async (transaction) => {
        const scopes: CacheScope[] = [
          "all",
          "mine",
        ];

        for (const scope of scopes) {
          // Só atualiza listas que já tenham
          // sido sincronizadas integralmente.
          const metadata =
            await transaction.getFirstAsync<CacheMetadataRow>(
              `
                SELECT synced_at
                FROM cache_metadata
                WHERE account_id = ? AND scope = ?
              `,
              accountId,
              scope
            );

          if (!metadata) continue;

          if (
            scope === "mine" &&
            activity.ownerId !== accountId
          ) {
            continue;
          }

          await upsertRow(
            transaction,
            accountId,
            scope,
            activity
          );
        }
      }
    );
  });
}

// Remove uma atividade das duas listas locais
// depois que a API confirmar a exclusão.
export async function removeCachedActivity(
  accountId: string,
  activityId: string
): Promise<void> {
  if (!accountId) return;

  return enqueueWrite(async () => {
    const db = await getDatabase();

    await db.runAsync(
      `
        DELETE FROM cached_activities
        WHERE account_id = ?
          AND activity_id = ?
      `,
      accountId,
      activityId
    );
  });
}
