import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { improveCVContent } from "@/app/lib/ai";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { content, type } = await request.json();

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { success: false, message: "Content is required for AI enhancement." },
        { status: 400 }
      );
    }

    const validTypes = ["summary", "experience", "project", "skills", "general"];
    const enhancementType = validTypes.includes(type) ? type : "general";

    const result = await improveCVContent({
      content,
      type: enhancementType as any,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to generate AI enhancement.",
          text: result.text,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      text: result.text,
    });
  } catch (error) {
    console.error("AI enhancement API error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
