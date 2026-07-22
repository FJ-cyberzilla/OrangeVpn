import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the 'users' table using the Firebase UID as the primary key
export const users = pgTable('users', {
  uid: text('uid').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'logs' table
export const logs = pgTable('logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  event: text('event').notNull(), // 'connection_start', 'connection_end', 'error', 'security_alert'
  details: text('details').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Define the 'user_settings' table
export const userSettings = pgTable('user_settings', {
  userId: text('user_id')
    .references(() => users.uid, { onDelete: 'cascade' })
    .primaryKey(),
  protocol: text('protocol').notNull(),
  isDpiBypassEnabled: boolean('is_dpi_bypass_enabled').notNull().default(false),
  isPacketMorphingEnabled: boolean('is_packet_morphing_enabled').notNull().default(false),
  isTimingObfuscationEnabled: boolean('is_timing_obfuscation_enabled').notNull().default(false),
  isAlpnSpoofingEnabled: boolean('is_alpn_spoofing_enabled').notNull().default(false),
  isChaffingEnabled: boolean('is_chaffing_enabled').notNull().default(false),
  isMultiPathSimEnabled: boolean('is_multi_path_sim_enabled').notNull().default(false),
  isYoutubeOptimizerEnabled: boolean('is_youtube_optimizer_enabled').notNull().default(false),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relationships for easy fetching if needed
export const usersRelations = relations(users, ({ many, one }) => ({
  logs: many(logs),
  settings: one(userSettings, {
    fields: [users.uid],
    references: [userSettings.userId],
  }),
}));

export const logsRelations = relations(logs, ({ one }) => ({
  user: one(users, {
    fields: [logs.userId],
    references: [users.uid],
  }),
}));
