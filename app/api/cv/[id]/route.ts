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

    // Update base CV fields
    await db.cV.update({
      where: { id },
      data,
    });

    // Update Personal Info if provided
    if (body.personalInfo) {
      const pi = body.personalInfo;
      await db.personalInfo.upsert({
        where: { cvId: id },
        create: {
          cvId: id,
          fullName: pi.fullName || "",
          email: pi.email || "",
          phone: pi.phone || "",
          address: pi.address || "",
          city: pi.city || "",
          country: pi.country || "",
          summary: pi.summary || "",
          jobTitle: pi.jobTitle || "",
          linkedin: pi.linkedin || "",
          github: pi.github || "",
          portfolio: pi.portfolio || "",
        },
        update: {
          fullName: pi.fullName || "",
          email: pi.email || "",
          phone: pi.phone || "",
          address: pi.address || "",
          city: pi.city || "",
          country: pi.country || "",
          summary: pi.summary || "",
          jobTitle: pi.jobTitle || "",
          linkedin: pi.linkedin || "",
          github: pi.github || "",
          portfolio: pi.portfolio || "",
        },
      });
    }

    // Update Education list if provided
    if (Array.isArray(body.education)) {
      await db.education.deleteMany({ where: { cvId: id } });
      if (body.education.length > 0) {
        await db.education.createMany({
          data: body.education.map((item: any) => ({
            cvId: id,
            degree: item.degree || "",
            institution: item.institution || "",
            location: item.location || "",
            startDate: item.startDate || "",
            endDate: item.endDate || "",
            description: item.description || "",
          })),
        });
      }
    }

    // Update Experience list if provided
    if (Array.isArray(body.experiences)) {
      await db.experience.deleteMany({ where: { cvId: id } });
      if (body.experiences.length > 0) {
        await db.experience.createMany({
          data: body.experiences.map((item: any) => ({
            cvId: id,
            position: item.position || "",
            company: item.company || "",
            location: item.location || "",
            startDate: item.startDate || "",
            endDate: item.endDate || "",
            description: item.description || "",
          })),
        });
      }
    }

    // Update Skills list if provided
    if (Array.isArray(body.skills)) {
      await db.skill.deleteMany({ where: { cvId: id } });
      if (body.skills.length > 0) {
        await db.skill.createMany({
          data: body.skills.map((item: any) => ({
            cvId: id,
            name: item.name || "",
            level: item.level || "",
          })),
        });
      }
    }

    // Update Projects list if provided
    if (Array.isArray(body.projects)) {
      await db.project.deleteMany({ where: { cvId: id } });
      if (body.projects.length > 0) {
        await db.project.createMany({
          data: body.projects.map((item: any) => ({
            cvId: id,
            name: item.name || "",
            description: item.description || "",
            technologies: item.technologies || "",
            projectUrl: item.projectUrl || "",
            startDate: item.startDate || "",
            endDate: item.endDate || "",
          })),
        });
      }
    }

    // Update Certifications list if provided
    if (Array.isArray(body.certifications)) {
      await db.certification.deleteMany({ where: { cvId: id } });
      if (body.certifications.length > 0) {
        await db.certification.createMany({
          data: body.certifications.map((item: any) => ({
            cvId: id,
            name: item.name || "",
            organization: item.organization || "",
            issueDate: item.issueDate || "",
            expiryDate: item.expiryDate || "",
            credentialId: item.credentialId || "",
            credentialUrl: item.credentialUrl || "",
          })),
        });
      }
    }

    // Update Languages list if provided
    if (Array.isArray(body.languages)) {
      await db.language.deleteMany({ where: { cvId: id } });
      if (body.languages.length > 0) {
        await db.language.createMany({
          data: body.languages.map((item: any) => ({
            cvId: id,
            name: item.name || "",
            proficiency: item.proficiency || "",
          })),
        });
      }
    }

    const updatedCV = await db.cV.findUnique({
      where: { id },
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
      cv: updatedCV,
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