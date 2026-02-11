import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, PUT } from "../route";

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

const mockWhere = vi.fn();
const mockSet = vi.fn();
const mockUpdateWhere = vi.fn();
const mockReturning = vi.fn();

vi.mock("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: mockWhere,
      }),
    }),
    update: () => ({
      set: mockSet,
    }),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockSet.mockReturnValue({ where: mockUpdateWhere });
  mockUpdateWhere.mockReturnValue({ returning: mockReturning });
});

function makeParams(id: string): Promise<{ id: string }> {
  return Promise.resolve({ id });
}

describe("GET /api/runs/[id]", () => {
  it("returns run by ID without editToken", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const request = new NextRequest("http://localhost/api/runs/1");
    const response = await GET(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.name).toBe("Bethesda Tuesday Track");
    expect(json.data).not.toHaveProperty("editToken");
  });

  it("converts latitude and longitude to numbers", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const request = new NextRequest("http://localhost/api/runs/1");
    const response = await GET(request, { params: makeParams("1") });
    const json = await response.json();

    expect(typeof json.data.latitude).toBe("number");
    expect(typeof json.data.longitude).toBe("number");
  });

  it("returns 404 for nonexistent run", async () => {
    mockWhere.mockResolvedValue([]);

    const request = new NextRequest("http://localhost/api/runs/999");
    const response = await GET(request, { params: makeParams("999") });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe("Run not found");
  });

  it("returns 404 for inactive run", async () => {
    mockWhere.mockResolvedValue([{ ...mockRun, isActive: false }]);

    const request = new NextRequest("http://localhost/api/runs/1");
    const response = await GET(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe("Run not found");
  });

  it("returns 400 for non-numeric ID", async () => {
    const request = new NextRequest("http://localhost/api/runs/abc");
    const response = await GET(request, { params: makeParams("abc") });

    expect(response.status).toBe(400);
  });
});

describe("GET /api/runs/[id] with token", () => {
  it("returns inactive run when valid token is provided", async () => {
    mockWhere.mockResolvedValue([{ ...mockRun, isActive: false }]);

    const request = new NextRequest(
      "http://localhost/api/runs/1?token=secret-token-123"
    );
    const response = await GET(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.name).toBe("Bethesda Tuesday Track");
    expect(json.data.isActive).toBe(false);
    expect(json.data).not.toHaveProperty("editToken");
  });

  it("returns 404 for inactive run with invalid token", async () => {
    mockWhere.mockResolvedValue([{ ...mockRun, isActive: false }]);

    const request = new NextRequest(
      "http://localhost/api/runs/1?token=wrong-token"
    );
    const response = await GET(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe("Run not found");
  });

  it("returns 404 for inactive run with no token", async () => {
    mockWhere.mockResolvedValue([{ ...mockRun, isActive: false }]);

    const request = new NextRequest("http://localhost/api/runs/1");
    const response = await GET(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe("Run not found");
  });

  it("returns active run regardless of token presence", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const request = new NextRequest(
      "http://localhost/api/runs/1?token=any-token"
    );
    const response = await GET(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.name).toBe("Bethesda Tuesday Track");
  });
});

describe("PUT /api/runs/[id]", () => {
  it("succeeds with valid token and valid body", async () => {
    mockWhere.mockResolvedValue([mockRun]);
    mockReturning.mockResolvedValue([
      { ...mockRun, name: "Updated Name", updatedAt: new Date() },
    ]);

    const request = new NextRequest(
      "http://localhost/api/runs/1?token=secret-token-123",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      }
    );

    const response = await PUT(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.name).toBe("Updated Name");
    expect(json.data).not.toHaveProperty("editToken");
  });

  it("returns 403 for invalid token", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const request = new NextRequest(
      "http://localhost/api/runs/1?token=wrong-token",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      }
    );

    const response = await PUT(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe("Invalid edit token");
  });

  it("returns 403 when token is missing", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const request = new NextRequest("http://localhost/api/runs/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Updated Name" }),
    });

    const response = await PUT(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe("Invalid edit token");
  });

  it("returns 404 for nonexistent run", async () => {
    mockWhere.mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost/api/runs/999?token=any-token",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Name" }),
      }
    );

    const response = await PUT(request, { params: makeParams("999") });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.error).toBe("Run not found");
  });

  it("returns 400 for invalid body", async () => {
    mockWhere.mockResolvedValue([mockRun]);

    const request = new NextRequest(
      "http://localhost/api/runs/1?token=secret-token-123",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ terrain: "Sand" }),
      }
    );

    const response = await PUT(request, { params: makeParams("1") });
    expect(response.status).toBe(400);
  });

  it("succeeds with partial update (single field)", async () => {
    mockWhere.mockResolvedValue([mockRun]);
    mockReturning.mockResolvedValue([
      { ...mockRun, startTime: "7:00 AM", updatedAt: new Date() },
    ]);

    const request = new NextRequest(
      "http://localhost/api/runs/1?token=secret-token-123",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime: "7:00 AM" }),
      }
    );

    const response = await PUT(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.startTime).toBe("7:00 AM");
  });

  it("allows deactivating a run with isActive: false", async () => {
    mockWhere.mockResolvedValue([mockRun]);
    mockReturning.mockResolvedValue([
      { ...mockRun, isActive: false, updatedAt: new Date() },
    ]);

    const request = new NextRequest(
      "http://localhost/api/runs/1?token=secret-token-123",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      }
    );

    const response = await PUT(request, { params: makeParams("1") });
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.isActive).toBe(false);
  });
});
