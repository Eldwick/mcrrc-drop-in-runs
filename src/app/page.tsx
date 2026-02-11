import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { runs } from "@/lib/db/schema";
import { SeekerView } from "@/components/SeekerView";
import type { RunResponse, PaceGroupInput } from "@/lib/types/run";

async function getActiveRuns(): Promise<RunResponse[]> {
  const rows = await db.select().from(runs).where(eq(runs.isActive, true));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    dayOfWeek: row.dayOfWeek,
    startTime: row.startTime,
    locationName: row.locationName,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    typicalDistances: row.typicalDistances,
    terrain: row.terrain,
    paceGroups: row.paceGroups as PaceGroupInput,
    contactName: row.contactName,
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    notes: row.notes,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export default async function Home() {
  const activeRuns = await getActiveRuns();

  return (
    <main className="h-screen overflow-hidden">
      <SeekerView runs={activeRuns} />
    </main>
  );
}
