import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { runs } from "@/lib/db/schema";
import { updateRunSchema } from "@/lib/types/run";

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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid run ID" }, { status: 400 });
  }

  const [run] = await db.select().from(runs).where(eq(runs.id, numId));

  if (!run || !run.isActive) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json({ data: serializeRun(run as unknown as RunRow) });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid run ID" }, { status: 400 });
  }

  const token = request.nextUrl.searchParams.get("token");

  const [run] = await db.select().from(runs).where(eq(runs.id, numId));

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  if (!token || token !== run.editToken) {
    return NextResponse.json(
      { error: "Invalid edit token" },
      { status: 403 }
    );
  }

  const body: unknown = await request.json();
  const parsed = updateRunSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.dayOfWeek !== undefined) updateData.dayOfWeek = input.dayOfWeek;
  if (input.startTime !== undefined) updateData.startTime = input.startTime;
  if (input.locationName !== undefined)
    updateData.locationName = input.locationName;
  if (input.latitude !== undefined)
    updateData.latitude = input.latitude.toString();
  if (input.longitude !== undefined)
    updateData.longitude = input.longitude.toString();
  if (input.typicalDistances !== undefined)
    updateData.typicalDistances = input.typicalDistances;
  if (input.terrain !== undefined) updateData.terrain = input.terrain;
  if (input.paceGroups !== undefined) updateData.paceGroups = input.paceGroups;
  if (input.contactName !== undefined)
    updateData.contactName = input.contactName ?? null;
  if (input.contactEmail !== undefined)
    updateData.contactEmail = input.contactEmail ?? null;
  if (input.contactPhone !== undefined)
    updateData.contactPhone = input.contactPhone ?? null;
  if (input.notes !== undefined) updateData.notes = input.notes ?? null;
  if (input.isActive !== undefined) updateData.isActive = input.isActive;

  const [updated] = await db
    .update(runs)
    .set(updateData)
    .where(eq(runs.id, numId))
    .returning();

  return NextResponse.json({
    data: serializeRun(updated as unknown as RunRow),
  });
}
