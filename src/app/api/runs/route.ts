import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { runs } from "@/lib/db/schema";
import { createRunSchema } from "@/lib/types/run";
import crypto from "crypto";

interface RunRow {
  id: number;
  name: string;
  dayOfWeek: string;
  startTime: string;
  locationName: string;
  latitude: string;
  longitude: string;
  typicalDistances: string;
  terrain: string;
  paceGroups: unknown;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  notes: string | null;
  isActive: boolean;
  editToken: string;
  createdAt: Date;
  updatedAt: Date;
}

function serializeRun(row: RunRow) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { editToken, ...rest } = row;
  return {
    ...rest,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
  };
}

export async function GET() {
  const activeRuns = await db
    .select()
    .from(runs)
    .where(eq(runs.isActive, true));

  const data = activeRuns.map((row) => serializeRun(row as unknown as RunRow));
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = createRunSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const editToken = crypto.randomUUID();

  const [inserted] = await db
    .insert(runs)
    .values({
      name: input.name,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      locationName: input.locationName,
      latitude: input.latitude.toString(),
      longitude: input.longitude.toString(),
      typicalDistances: input.typicalDistances,
      terrain: input.terrain,
      paceGroups: input.paceGroups,
      contactName: input.contactName ?? null,
      contactEmail: input.contactEmail ?? null,
      contactPhone: input.contactPhone ?? null,
      notes: input.notes ?? null,
      isActive: true,
      editToken,
    })
    .returning();

  const serialized = serializeRun(inserted as unknown as RunRow);

  return NextResponse.json(
    { data: { ...serialized, editToken } },
    { status: 201 }
  );
}
