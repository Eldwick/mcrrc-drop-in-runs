import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { runs } from "./schema";
import crypto from "crypto";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const seedRuns = [
  {
    name: "Bethesda Tuesday Track",
    dayOfWeek: "Tuesday",
    startTime: "6:00 AM",
    locationName: "Bethesda-Chevy Chase High School track",
    latitude: "38.9849",
    longitude: "-77.0941",
    typicalDistances: "4-6 miles with track intervals",
    terrain: "Road",
    paceGroups: {
      sub_8: "consistently" as const,
      "8_to_9": "frequently" as const,
      "9_to_10": "sometimes" as const,
      "10_plus": "rarely" as const,
    },
    contactName: "Sarah Chen",
    contactEmail: "sarah.chen@example.com",
    contactPhone: null,
    notes:
      "Structured speed workout. Warm up at 6:00, intervals start at 6:15. All paces welcome but expect a fast crowd. Bring headlamp Nov-Feb.",
    isActive: true,
    editToken: crypto.randomUUID(),
  },
  {
    name: "Rockville Saturday Long Run",
    dayOfWeek: "Saturday",
    startTime: "7:00 AM",
    locationName: "Rockville Town Square, near the fountain",
    latitude: "39.0840",
    longitude: "-77.1528",
    typicalDistances: "8-14 miles",
    terrain: "Road",
    paceGroups: {
      sub_8: "frequently" as const,
      "8_to_9": "consistently" as const,
      "9_to_10": "consistently" as const,
      "10_plus": "frequently" as const,
    },
    contactName: "Mike Rodriguez",
    contactEmail: "mike.r@example.com",
    contactPhone: "301-555-0142",
    notes:
      "Multiple pace groups form up naturally. Water stops on longer routes. Coffee at Starbucks after. Routes vary weekly — check the email list.",
    isActive: true,
    editToken: crypto.randomUUID(),
  },
  {
    name: "Silver Spring Wednesday Evening",
    dayOfWeek: "Wednesday",
    startTime: "6:30 PM",
    locationName: "Downtown Silver Spring Veterans Plaza",
    latitude: "38.9940",
    longitude: "-77.0311",
    typicalDistances: "4-5 miles",
    terrain: "Road",
    paceGroups: {
      sub_8: "sometimes" as const,
      "8_to_9": "frequently" as const,
      "9_to_10": "consistently" as const,
      "10_plus": "frequently" as const,
    },
    contactName: "Priya Patel",
    contactEmail: "priya.p@example.com",
    contactPhone: null,
    notes:
      "Relaxed weeknight run through Sligo Creek Trail and surrounding neighborhoods. Great for mid-pack runners. We regroup at every mile.",
    isActive: true,
    editToken: crypto.randomUUID(),
  },
  {
    name: "Germantown Sunday Trail Run",
    dayOfWeek: "Sunday",
    startTime: "8:00 AM",
    locationName: "Black Hill Regional Park, main parking lot",
    latitude: "39.2055",
    longitude: "-77.2927",
    typicalDistances: "5-8 miles",
    terrain: "Trail",
    paceGroups: {
      sub_8: "rarely" as const,
      "8_to_9": "sometimes" as const,
      "9_to_10": "frequently" as const,
      "10_plus": "consistently" as const,
    },
    contactName: "David Kim",
    contactEmail: "david.k@example.com",
    contactPhone: null,
    notes:
      "Trail run around Little Seneca Lake. Pace is relaxed — trail pace is slower than road pace. Watch for roots and mud after rain. Bug spray recommended in summer.",
    isActive: true,
    editToken: crypto.randomUUID(),
  },
  {
    name: "Olney Thursday Social Run",
    dayOfWeek: "Thursday",
    startTime: "6:00 PM",
    locationName: "Olney Ale House parking lot",
    latitude: "39.1533",
    longitude: "-77.0668",
    typicalDistances: "3-4 miles",
    terrain: "Road",
    paceGroups: {
      sub_8: "rarely" as const,
      "8_to_9": "sometimes" as const,
      "9_to_10": "frequently" as const,
      "10_plus": "consistently" as const,
    },
    contactName: "Lisa Thompson",
    contactEmail: null,
    contactPhone: "301-555-0198",
    notes:
      "Social run followed by food and drinks at the Ale House. Very beginner-friendly, no-drop policy. We wait for everyone!",
    isActive: true,
    editToken: crypto.randomUUID(),
  },
  {
    name: "Kentlands Saturday Morning",
    dayOfWeek: "Saturday",
    startTime: "7:30 AM",
    locationName: "Kentlands Main Street, by the gazebo",
    latitude: "39.1186",
    longitude: "-77.2419",
    typicalDistances: "5-7 miles",
    terrain: "Mixed",
    paceGroups: {
      sub_8: "sometimes" as const,
      "8_to_9": "consistently" as const,
      "9_to_10": "frequently" as const,
      "10_plus": "sometimes" as const,
    },
    contactName: "James Okafor",
    contactEmail: "james.o@example.com",
    contactPhone: null,
    notes:
      "Route goes through Kentlands neighborhood and connects to the Muddy Branch Trail. Mixed terrain — road and packed gravel. Good for tempo runs.",
    isActive: true,
    editToken: crypto.randomUUID(),
  },
  {
    name: "Cabin John Monday Evening",
    dayOfWeek: "Monday",
    startTime: "5:30 PM",
    locationName: "Cabin John Regional Park, nature center lot",
    latitude: "39.0324",
    longitude: "-77.1560",
    typicalDistances: "5-6 miles",
    terrain: "Trail",
    paceGroups: {
      sub_8: "consistently" as const,
      "8_to_9": "consistently" as const,
      "9_to_10": "sometimes" as const,
      "10_plus": "rarely" as const,
    },
    contactName: "Anna Walsh",
    contactEmail: "anna.w@example.com",
    contactPhone: null,
    notes:
      "Competitive but friendly group. We run the Cabin John Trail out-and-back. Expect hills. Faster runners welcome — this is a workout, not a jog.",
    isActive: true,
    editToken: crypto.randomUUID(),
  },
];

async function seed() {
  console.log("Seeding database with MCRRC run data...");

  for (const run of seedRuns) {
    await db.insert(runs).values(run);
    console.log(`  Inserted: ${run.name}`);
  }

  console.log(`\nDone! Inserted ${seedRuns.length} runs.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
