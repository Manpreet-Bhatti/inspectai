import { NextRequest, NextResponse } from "next/server";

// TODO: Import prisma client and S3 utilities
// import { prisma } from "@inspectai/database";
// import { uploadToS3, generatePresignedUrl } from "@/lib/s3";

/**
 * POST /api/photos
 * Upload photos for an inspection
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const inspectionId = formData.get("inspectionId") as string;
    const category = formData.get("category") as string;
    const location = formData.get("location") as string;
    const files = formData.getAll("files") as File[];

    if (!inspectionId) {
      return NextResponse.json(
        { error: "Missing inspectionId" },
        { status: 400 }
      );
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // TODO: Implement actual file upload to S3
    const uploadedPhotos = await Promise.all(
      files.map(async (file, index) => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return {
          id: `photo-${Date.now()}-${index}`,
          inspectionId,
          fileName: file.name,
          originalUrl: `/uploads/${file.name}`,
          thumbnailUrl: `/uploads/thumbs/${file.name}`,
          category: category || "OTHER",
          location: location || null,
          width: 1920,
          height: 1080,
          aiCaption: null,
          aiObjects: null,
          aiCondition: null,
          aiConfidence: null,
          processedAt: null,
          createdAt: new Date(),
        };
      })
    );

    return NextResponse.json(
      {
        photos: uploadedPhotos,
        message: `Successfully uploaded ${uploadedPhotos.length} photos`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading photos:", error);
    return NextResponse.json(
      { error: "Failed to upload photos" },
      { status: 500 }
    );
  }
}
