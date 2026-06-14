import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { classifySeverity } from "@/lib/ml-client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, imageCondition, imageConfidence } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, category" },
        { status: 400 }
      );
    }

    const result = await classifySeverity(
      title,
      description,
      category,
      imageCondition,
      imageConfidence
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Severity classification proxy error:", error);
    return NextResponse.json(
      { error: "Severity classification failed" },
      { status: 500 }
    );
  }
}
