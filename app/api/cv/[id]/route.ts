import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const cv = await db.cV.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        personalInfo: true,
        education: true,
        experiences: true,
        skills: true,
        projects: true,
        certifications: true,
        languages: true,
        uploadedCVs: true,
        aiContents: true,
      },
    });

    if (!cv) {
      return NextResponse.json(
        {
          success: false,
          message: "CV not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      cv,
    });
  } catch (error) {
    console.error("GET single CV error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch CV",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const existingCV = await db.cV.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCV) {
      return NextResponse.json(
        {
          success: false,
          message: "CV not found",
        },
        { status: 404 }
      );
    }

    const data: {
      title?: string;
      template?: string;
      status?: string;
    } = {};

    if (typeof body.title === "string" && body.title.trim()) {
      data.title = body.title.trim();
    }

    if (typeof body.template === "string" && body.template.trim()) {
      data.template = body.template.trim();
    }

    if (typeof body.status === "string" && body.status.trim()) {
      data.status = body.status.trim();
    }

    const cv = await db.cV.update({
      where: {
        id,
      },
      data,
      include: {
        personalInfo: true,
        education: true,
        experiences: true,
        skills: true,
        projects: true,
        certifications: true,
        languages: true,
        uploadedCVs: true,
        aiContents: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "CV updated successfully",
      cv,
    });
  } catch (error) {
    console.error("PUT CV error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update CV",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const existingCV = await db.cV.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCV) {
      return NextResponse.json(
        {
          success: false,
          message: "CV not found",
        },
        { status: 404 }
      );
    }

    await db.cV.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "CV deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CV error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete CV",
      },
      { status: 500 }
    );
  }
}