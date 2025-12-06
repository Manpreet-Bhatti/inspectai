import { NextRequest, NextResponse } from "next/server";

// TODO: Import prisma client and add authentication
// import { prisma } from "@inspectai/database";

const mockInspections = [
  {
    id: "1",
    title: "123 Oak Street Inspection",
    address: "123 Oak Street",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    propertyType: "SINGLE_FAMILY",
    status: "COMPLETED",
    userId: "1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
];

/**
 * GET /api/inspections
 * List inspections with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const propertyType = searchParams.get("propertyType");

    // TODO: Replace with actual database query
    let filtered = [...mockInspections];

    if (status) {
      filtered = filtered.filter((i) => i.status === status);
    }

    if (propertyType) {
      filtered = filtered.filter((i) => i.propertyType === propertyType);
    }

    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const data = filtered.slice(start, end);

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inspections
 * Create a new inspection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      "title",
      "address",
      "city",
      "state",
      "zipCode",
      "propertyType",
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // TODO: Replace with actual database creation
    const newInspection = {
      id: String(Date.now()),
      ...body,
      status: "DRAFT",
      userId: "1", // TODO: Get from session
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(newInspection, { status: 201 });
  } catch (error) {
    console.error("Error creating inspection:", error);
    return NextResponse.json(
      { error: "Failed to create inspection" },
      { status: 500 }
    );
  }
}
