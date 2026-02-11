import { z } from "zod";

const availabilityLevels = [
  "consistently",
  "frequently",
  "sometimes",
  "rarely",
] as const;

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const terrainTypes = ["Road", "Trail", "Mixed"] as const;

const paceRanges = ["sub_8", "8_to_9", "9_to_10", "10_plus"] as const;

export const paceGroupSchema = z.object({
  sub_8: z.enum(availabilityLevels),
  "8_to_9": z.enum(availabilityLevels),
  "9_to_10": z.enum(availabilityLevels),
  "10_plus": z.enum(availabilityLevels),
});

export const createRunSchema = z.object({
  name: z.string().min(1),
  dayOfWeek: z.enum(daysOfWeek),
  startTime: z.string().min(1),
  locationName: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  typicalDistances: z.string().min(1),
  terrain: z.enum(terrainTypes),
  paceGroups: paceGroupSchema,
  contactName: z.string().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateRunSchema = createRunSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const seekerQuerySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  paceRange: z.enum(paceRanges),
});

export type CreateRunInput = z.infer<typeof createRunSchema>;
export type UpdateRunInput = z.infer<typeof updateRunSchema>;
export type SeekerQuery = z.infer<typeof seekerQuerySchema>;
export type PaceGroupInput = z.infer<typeof paceGroupSchema>;

export interface RunResponse {
  id: number;
  name: string;
  dayOfWeek: string;
  startTime: string;
  locationName: string;
  latitude: number;
  longitude: number;
  typicalDistances: string;
  terrain: string;
  paceGroups: PaceGroupInput;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
