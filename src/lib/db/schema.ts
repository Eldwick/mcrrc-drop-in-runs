import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  jsonb,
  numeric,
} from "drizzle-orm/pg-core";

export interface PaceGroups {
  sub_8: "consistently" | "frequently" | "sometimes" | "rarely";
  "8_to_9": "consistently" | "frequently" | "sometimes" | "rarely";
  "9_to_10": "consistently" | "frequently" | "sometimes" | "rarely";
  "10_plus": "consistently" | "frequently" | "sometimes" | "rarely";
}

export const runs = pgTable("runs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  dayOfWeek: text("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  locationName: text("location_name").notNull(),
  latitude: numeric("latitude").notNull(),
  longitude: numeric("longitude").notNull(),
  typicalDistances: text("typical_distances").notNull(),
  terrain: text("terrain").notNull(),
  paceGroups: jsonb("pace_groups").notNull().$type<PaceGroups>(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  editToken: text("edit_token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
