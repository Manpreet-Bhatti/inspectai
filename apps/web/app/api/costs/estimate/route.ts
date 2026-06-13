import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { estimateCost } from "@/lib/ml-client";

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
    const { category, severity, description } = body;

    if (!category || !severity) {
      return NextResponse.json(
        { error: "Missing required fields: category, severity" },
        { status: 400 }
      );
    }

    const estimate = await estimateCost(category, severity, description);
    return NextResponse.json(estimate);
  } catch (error) {
    console.error("Cost estimation proxy error:", error);
    return NextResponse.json(
      { error: "Cost estimation failed" },
      { status: 500 }
    );
  }
}
