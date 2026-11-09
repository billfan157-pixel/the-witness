import { sqliteTable, text, integer, primaryKey, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

export const players = sqliteTable('players', {
  userId: text('user_id').primaryKey(),
  displayName: text('display_name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
export const saves = sqliteTable('game_saves', {
  userId: text('user_id').notNull().references(() => players.userId, { onDelete: 'cascade' }),
  slot: integer('slot').notNull(), revision: integer('revision').notNull(),
  data: text('data_json'), hash: text('sha256'),
  chapter: integer('chapter'), characterName: text('character_name'),
  clientId: text('client_id').notNull(), mutationId: text('mutation_id').notNull(),
  updatedAt: text('updated_at').notNull(), deleted: integer('deleted').notNull().default(0),
}, t => [primaryKey({ columns: [t.userId, t.slot] })]);
export const revisions = sqliteTable('save_revisions', {
  userId: text('user_id').notNull().references(() => players.userId, { onDelete: 'cascade' }),
  slot: integer('slot').notNull(), revision: integer('revision').notNull(),
  data: text('data_json'), hash: text('sha256'), chapter: integer('chapter'),
  characterName: text('character_name'), clientId: text('client_id').notNull(),
  mutationId: text('mutation_id').notNull(), createdAt: text('created_at').notNull(),
  deleted: integer('deleted').notNull().default(0),
}, t => [primaryKey({ columns: [t.userId, t.slot, t.revision] }), uniqueIndex('revisions_mutation').on(t.userId, t.mutationId)]);
export const audit = sqliteTable('save_audit', {
  id: text('id').notNull(), userId: text('user_id').notNull().references(() => players.userId, { onDelete: 'cascade' }),
  action: text('action').notNull(), slot: integer('slot').notNull(),
  revision: integer('revision').notNull(), createdAt: text('created_at').notNull(),
}, t => [primaryKey({ columns: [t.userId, t.id] }), index('audit_user_time').on(t.userId, t.createdAt)]);
export const rateLimits = sqliteTable('write_limits', {
  userId: text('user_id').primaryKey().references(() => players.userId, { onDelete: 'cascade' }),
  window: integer('window_start').notNull(), count: integer('request_count').notNull(),
});
