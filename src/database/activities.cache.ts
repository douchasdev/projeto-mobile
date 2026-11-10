
import * as SQLite from "expo-sqlite";

import type {
  Activity,
  ActivityUser,
} from "../types/Activity";

const DATABASE_NAME = "activities-cache.db";

export type CacheScope = "all" | "mine";

type CachedActivityRow = {
  activity_id: string;
  owner_id: string;
  owner_name: string;
  title: string;
  description: string | null;
  scheduled_at: string;
  location: string;
  completed: number;
  interested_users_json: string;
  interest_count: number;
  has_interest: number;
};

type CacheMetadataRow = {
  synced_at: string;
};

type ColumnInfoRow = {
  name: string;
};

export type CachedActivities = {
  activities: Activity[];
  syncedAt: string;
};

// ==================================================
// CONEXÃO E FILA DE ESCRITAS
// ==================================================

let databasePromise:
  | Promise<SQLite.SQLiteDatabase>
  | null = null;

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

// ==================================================
// CONVERSÕES
// ==================================================

function getScheduledAt(
  activity: Activity
): string {
  return new Date(
    activity.date.getFullYear(),
    activity.date.getMonth(),
    activity.date.getDate(),
    activity.time.getHours(),
    activity.time.getMinutes(),
    0,
    0
  ).toISOString();
}

function parseInterestedUsers(
  value: string
): ActivityUser[] {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is ActivityUser => {
        return (
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          typeof item.id === "string" &&
          "name" in item &&
          typeof item.name === "string"
        );
      }
    );
  } catch {
    return [];
  }
}

function fromCacheRow(
  row: CachedActivityRow
): Activity {
  const scheduledAt = new Date(
    row.scheduled_at
  );

  const interestedUsers = parseInterestedUsers(
    row.interested_users_json
  );

  return {
    id: row.activity_id,
    ownerId: row.owner_id,

    owner: {
      id: row.owner_id,
      name:
        row.owner_name ||
        "Criador não informado",
    },

    title: row.title,
    description: row.description ?? "",

    date: new Date(scheduledAt),
    time: new Date(scheduledAt),

    location: row.location,
    completed: row.completed === 1,

    interestedUsers,
    interestCount: row.interest_count,
    hasInterest: row.has_interest === 1,
  };
}

// ==================================================
// INICIALIZAÇÃO E MIGRAÇÃO
// ==================================================

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
      owner_name TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL,
      description TEXT,
      scheduled_at TEXT NOT NULL,
      location TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      interested_users_json TEXT NOT NULL DEFAULT '[]',
      interest_count INTEGER NOT NULL DEFAULT 0,
      has_interest INTEGER NOT NULL DEFAULT 0,

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
    ON cached_activities (
      account_id,
      scope
    );
  `);

  // Migração não destrutiva:
  // adiciona colunas aos bancos já existentes.
  const columns =
    await db.getAllAsync<ColumnInfoRow>(
      "PRAGMA table_info(cached_activities)"
    );

  const existing = new Set(
    columns.map((column) => column.name)
  );

  const migrations = [
    {
      name: "owner_name",
      sql:
        "ALTER TABLE cached_activities " +
        "ADD COLUMN owner_name TEXT NOT NULL DEFAULT ''",
    },
    {
      name: "interested_users_json",
      sql:
        "ALTER TABLE cached_activities " +
        "ADD COLUMN interested_users_json TEXT NOT NULL DEFAULT '[]'",
    },
    {
      name: "interest_count",
      sql:
        "ALTER TABLE cached_activities " +
        "ADD COLUMN interest_count INTEGER NOT NULL DEFAULT 0",
    },
    {
      name: "has_interest",
      sql:
        "ALTER TABLE cached_activities " +
        "ADD COLUMN has_interest INTEGER NOT NULL DEFAULT 0",
    },
  ];

  for (const migration of migrations) {
    if (!existing.has(migration.name)) {
      // SQL fixo, sem dados externos.
      await db.execAsync(migration.sql);
    }
  }

  return db;
}

async function getDatabase():
  Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise =
      initializeDatabase().catch(
        (error) => {
          databasePromise = null;
          throw error;
        }
      );
  }

  return databasePromise;
}

// ==================================================
// INSERIR OU ATUALIZAR LINHA
// ==================================================

async function upsertRow(
  transaction: Pick<
    SQLite.SQLiteDatabase,
    "runAsync"
  >,
  accountId: string,
  scope: CacheScope,
  activity: Activity
): Promise<void> {
  await transaction.runAsync(
    `
      INSERT INTO cached_activities (
        account_id,
        scope,
        activity_id,
        owner_id,
        owner_name,
        title,
        description,
        scheduled_at,
        location,
        completed,
        interested_users_json,
        interest_count,
        has_interest
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT (
        account_id,
        scope,
        activity_id
      )
      DO UPDATE SET
        owner_id = excluded.owner_id,
        owner_name = excluded.owner_name,
        title = excluded.title,
        description = excluded.description,
        scheduled_at = excluded.scheduled_at,
        location = excluded.location,
        completed = excluded.completed,
        interested_users_json = excluded.interested_users_json,
        interest_count = excluded.interest_count,
        has_interest = excluded.has_interest
    `,
    accountId,
    scope,
    activity.id,
    activity.ownerId,
    activity.owner.name,
    activity.title,
    activity.description ?? null,
    getScheduledAt(activity),
    activity.location,
    activity.completed ? 1 : 0,
    JSON.stringify(activity.interestedUsers),
    activity.interestCount,
    activity.hasInterest ? 1 : 0
  );
}

// ==================================================
// SALVAR LISTA COMPLETA
// ==================================================

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
            WHERE account_id = ?
              AND scope = ?
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

            ON CONFLICT (
              account_id,
              scope
            )
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

// ==================================================
// LER ATIVIDADES ARMAZENADAS
// ==================================================

export async function readCachedActivities(
  accountId: string,
  scope: CacheScope
): Promise<CachedActivities | null> {
  if (!accountId) {
    return null;
  }

  // Aguarda as escritas pendentes.
  await writeQueue;

  const db = await getDatabase();

  const metadata =
    await db.getFirstAsync<CacheMetadataRow>(
      `
        SELECT synced_at
        FROM cache_metadata
        WHERE account_id = ?
          AND scope = ?
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
          owner_name,
          title,
          description,
          scheduled_at,
          location,
          completed,
          interested_users_json,
          interest_count,
          has_interest

        FROM cached_activities

        WHERE account_id = ?
          AND scope = ?

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

// ==================================================
// ATUALIZAR ATIVIDADE INDIVIDUAL
// ==================================================

export async function upsertCachedActivity(
  accountId: string,
  activity: Activity
): Promise<void> {
  if (!accountId) {
    return;
  }

  return enqueueWrite(async () => {
    const db = await getDatabase();

    await db.withExclusiveTransactionAsync(
      async (transaction) => {
        const scopes: CacheScope[] = [
          "all",
          "mine",
        ];

        for (const scope of scopes) {
          // Só altera listas já sincronizadas.
          const metadata =
            await transaction.getFirstAsync<CacheMetadataRow>(
              `
                SELECT synced_at
                FROM cache_metadata
                WHERE account_id = ?
                  AND scope = ?
              `,
              accountId,
              scope
            );

          if (!metadata) {
            continue;
          }

          // Atividade de outro usuário não entra
          // na lista Minhas atividades.
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

// ==================================================
// REMOVER ATIVIDADE DO CACHE
// ==================================================

export async function removeCachedActivity(
  accountId: string,
  activityId: string
): Promise<void> {
  if (!accountId) {
    return;
  }

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
