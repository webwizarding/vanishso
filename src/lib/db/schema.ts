import { pgTable, boolean, text, varchar, bigint } from "drizzle-orm/pg-core";

export const notes = pgTable("notes", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  confirmBeforeViewing: boolean("confirmBeforeViewing").notNull(),
  mode: varchar("mode", { length: 16 }).notNull(),
  encrypted: text("encrypted").notNull(),
  exp: bigint("exp", { mode: "number" }).notNull(),
  h: varchar("h", { length: 256 }).notNull(),
  cs: varchar("cs", { length: 256 }).notNull(),
  ss: varchar("ss", { length: 256 }).notNull(),
});

export type Note = typeof notes.$inferInsert;
