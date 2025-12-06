import { NextRequest, NextResponse } from "next/server";

// TODO: Import prisma client
// import { prisma } from "@inspectai/database";

/**
 * GET /api/findings
 * List findings with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inspectionId = searchParams.get("inspectionId");
    const severity = searchParams.get("severity");
    const category = searchParams.get("category");

    if (!inspectionId) {
      return NextResponse.json(
        { error: "Missing inspectionId parameter" },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database query
    const findings = [
      {
        id: "1",
        inspectionId,
        title: "Water damage on ceiling",
        description: "Visible water staining on living room ceiling",
        category: "STRUCTURAL",
        severity: "MAJOR",
        location: "Living Room",
        costEstimate: 2500,
        costMin: 1500,
        costMax: 4000,
        status: "ACTIVE",
        isAiGenerated: true,
        confidence: 0.92,
        photoId: "3",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    let filtered = findings;
    if (severity) {
      filtered = filtered.filter((f) => f.severity === severity);
    }
    if (category) {
      filtered = filtered.filter((f) => f.category === category);
    }

    return NextResponse.json({ data: filtered });
  } catch (error) {
    console.error("Error fetching findings:", error);
    return NextResponse.json(
      { error: "Failed to fetch findings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/findings
 * Create a new finding
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const required = [
      "inspectionId",
      "title",
      "description",
      "category",
      "severity",
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
    const newFinding = {
      id: String(Date.now()),
      ...body,
      status: "ACTIVE",
      isAiGenerated: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(newFinding, { status: 201 });
  } catch (error) {
    console.error("Error creating finding:", error);
    return NextResponse.json(
      { error: "Failed to create finding" },
      { status: 500 }
    );
  }
}
