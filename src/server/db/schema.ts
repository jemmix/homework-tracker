import { relations, sql } from "drizzle-orm";
import { index, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `homework-tracker_${name}`);

// --- Homework Tracker Schema ---

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }).notNull(),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  books: many(books),
}));

export const books = createTable(
  "book",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    title: d.varchar({ length: 255 }).notNull(),
    userId: d.varchar({ length: 255 }).notNull().references(() => users.id),
    createdAt: d.timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
    archived: d.boolean().notNull().default(false),
    position: d.integer().notNull().default(0), // for user-customizable ordering
  }),
  (t) => [index("book_user_id_idx").on(t.userId)]
);

export const booksRelations = relations(books, ({ one, many }) => ({
  user: one(users, { fields: [books.userId], references: [users.id] }),
  units: many(units),
}));

export const units = createTable(
  "unit",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    bookId: d.integer().notNull().references(() => books.id),
    title: d.varchar({ length: 255 }).notNull(),
    number: d.integer().notNull(), // can start at any number
    createdAt: d.timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("unit_book_id_idx").on(t.bookId)]
);

export const unitsRelations = relations(units, ({ one, many }) => ({
  book: one(books, { fields: [units.bookId], references: [books.id] }),
  tasks: many(tasks),
}));

export const tasks = createTable(
  "task",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    unitId: d.integer().notNull().references(() => units.id),
    number: d.integer().notNull(), // always starts at 1
    completed: d.boolean().notNull().default(false),
    createdAt: d.timestamp({ withTimezone: true }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
  }),
  (t) => [index("task_unit_id_idx").on(t.unitId)]
);

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  unit: one(units, { fields: [tasks.unitId], references: [units.id] }),
  parts: many(taskParts),
}));

export const taskParts = createTable(
  "task_part",
  (d) => ({
    id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
    taskId: d.integer().notNull().references(() => tasks.id),
    letter: d.varchar({ length: 2 }).notNull(), // e.g. 'a', 'b', ...
    completed: d.boolean().notNull().default(false),
  }),
  (t) => [index("task_part_task_id_idx").on(t.taskId)]
);

export const taskPartsRelations = relations(taskParts, ({ one }) => ({
  task: one(tasks, { fields: [taskParts.taskId], references: [tasks.id] }),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
