import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "../route";

const mockRun = {
  id: 1,
  name: "Bethesda Tuesday Track",
  dayOfWeek: "Tuesday",
  startTime: "6:00 AM",
  locationName: "Bethesda-Chevy Chase High School track",
  latitude: "38.9849",
  longitude: "-77.0941",
  typicalDistances: "4-6 miles with track intervals",
  terrain: "Road",
  paceGroups: {
    sub_8: "consistently",
    "8_to_9": "frequently",
    "9_to_10": "sometimes",
    "10_plus": "rarely",
  },
  contactName: "Sarah Chen",
  contactEmail: "sarah.chen@example.com",
  contactPhone: null,
  notes: "Structured speed workout.",
  isActive: true,
  editToken: "secret-token-123",
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

const mockFrom = vi.fn();
const mockWhere = vi.fn();
const mockValues = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({ from: mockFrom }),
    insert: () => ({ values: mockValues }),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockReturnValue({ where: mockWhere });
  mockValues.mockReturnValue({ returning: mockReturning });
});

describe("GET /api/runs", () => {
  it("returns only active runs", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.data[0].name).toBe("Bethesda Tuesday Track");
  });

  it("never includes editToken in response", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const response = await GET();
    const json = await response.json();

    expect(json.data[0]).not.toHaveProperty("editToken");
  });

  it("converts latitude and longitude to numbers", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const response = await GET();
    const json = await response.json();

    expect(typeof json.data[0].latitude).toBe("number");
    expect(typeof json.data[0].longitude).toBe("number");
    expect(json.data[0].latitude).toBeCloseTo(38.9849);
    expect(json.data[0].longitude).toBeCloseTo(-77.0941);
  });

  it("returns empty array when no active runs exist", async () => {
    mockWhere.mockResolvedValue([]);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it("response shape is { data: [...] }", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const response = await GET();
    const json = await response.json();

    expect(json).toHaveProperty("data");
    expect(Array.isArray(json.data)).toBe(true);
  });
});

describe("POST /api/runs", () => {
  const validBody = {
    name: "New Run",
    dayOfWeek: "Monday",
    startTime: "7:00 AM",
    locationName: "Test Park",
    latitude: 39.14,
    longitude: -77.15,
    typicalDistances: "5 miles",
    terrain: "Road",
    paceGroups: {
      sub_8: "consistently",
      "8_to_9": "frequently",
      "9_to_10": "sometimes",
      "10_plus": "rarely",
    },
  };

  it("returns 201 with editToken on valid creation", async () => {
    mockReturning.mockResolvedValue([
      {
        ...mockRun,
        id: 10,
        name: "New Run",
        latitude: "39.14",
        longitude: "-77.15",
      },
    ]);

    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.data).toHaveProperty("editToken");
    expect(typeof json.data.editToken).toBe("string");
  });

  it("returns 400 when required field is missing (no name)", async () => {
    const { name: _name, ...noName } = validBody;
    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noName),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toHaveProperty("error");
  });

  it("returns 400 for invalid terrain enum", async () => {
    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, terrain: "Gravel" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for invalid pace group availability level", async () => {
    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        paceGroups: { ...validBody.paceGroups, sub_8: "always" },
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 400 for latitude out of range", async () => {
    const request = new Request("http://localhost/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, latitude: 91 }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
