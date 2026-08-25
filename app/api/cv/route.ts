import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/db";

export async function GET() {
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

    const cvs = await db.cV.findMany({
      where: {
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
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      cvs,
    });
  } catch (error) {
    console.error("GET CV error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch CVs",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "My CV";

    const template =
      typeof body.template === "string" && body.template.trim()
        ? body.template.trim()
        : "modern";

    const cv = await db.cV.create({
      data: {
        title,
        template,
        status: "draft",
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
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "CV created successfully",
        cv,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST CV error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create CV",
      },
      { status: 500 }
    );
  }
}