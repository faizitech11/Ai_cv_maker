import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import {
  improveCVContent,
  generateSummaryFromProfile,
  generateExperienceBullets,
  generateProjectDescription,
  suggestSkills,
} from "@/app/lib/ai";
import { db } from "@/app/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check session for logging if present, but do NOT block functionality if absent
    let userId: string | undefined;
    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id;
    } catch {
      // Session lookup failed, continue gracefully
    }

    const body = await request.json();
    const {
      type,
      content,
      cvId,
      context,
      jobTitle,
      existingSkills,
      position,
      company,
      projectName,
      technologies,
    } = body;

    // 1. Suggest Skills Feature
    if (type === "suggest_skills") {
      const targetJob = jobTitle || content || "Software Engineer";
      const result = await suggestSkills(targetJob, existingSkills || []);

      return NextResponse.json({
        success: true,
        skills: result.skills,
        provider: result.provider,
      });
    }

    // 2. Generate Summary directly from Profile Data
    if (type === "summary_from_profile" || (type === "summary" && (!content || !content.trim()))) {
      const result = await generateSummaryFromProfile({
        jobTitle: jobTitle || context?.jobTitle || "Professional",
        fullName: context?.fullName,
        experiences: context?.experiences,
        education: context?.education,
        skills: context?.skills,
      });

      if (cvId) {
        try {
          await db.aIContent.create({
            data: {
              cvId,
              type: "summary_from_profile",
              originalText: jobTitle || "",
              generatedText: result.text,
              model: result.provider || "Smart ATS Engine",
              status: "generated",
            },
          });
        } catch (dbErr) {
          console.warn("Could not log AI content to DB:", dbErr);
        }
      }

      return NextResponse.json({
        success: true,
        text: result.text,
        provider: result.provider,
      });
    }

    // 3. Experience Generation (when content is empty)
    if (type === "experience" && (!content || !content.trim())) {
      const targetRole = position || jobTitle || "Software Developer";
      const targetCompany = company || "Company";
      const result = await generateExperienceBullets(targetRole, targetCompany);

      if (cvId) {
        try {
          await db.aIContent.create({
            data: {
              cvId,
              type: "experience_generation",
              originalText: `${targetRole} at ${targetCompany}`,
              generatedText: result.text,
              model: result.provider || "Smart ATS Engine",
              status: "generated",
            },
          });
        } catch {}
      }

      return NextResponse.json({
        success: true,
        text: result.text,
        provider: result.provider,
      });
    }

    // 4. Project Description Generation (when content is empty)
    if (type === "project" && (!content || !content.trim())) {
      const targetName = projectName || body.name || "Project";
      const targetTech = technologies || "Modern Technologies";
      const result = await generateProjectDescription(targetName, targetTech);

      if (cvId) {
        try {
          await db.aIContent.create({
            data: {
              cvId,
              type: "project_generation",
              originalText: `${targetName} with ${targetTech}`,
              generatedText: result.text,
              model: result.provider || "Smart ATS Engine",
              status: "generated",
            },
          });
        } catch {}
      }

      return NextResponse.json({
        success: true,
        text: result.text,
        provider: result.provider,
      });
    }

    // 5. Text Enhancement (when content is provided)
    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Please write some text or provide a job title/project name first.",
        },
        { status: 400 }
      );
    }

    const validTypes = ["summary", "experience", "project", "skills", "general"];
    const enhancementType = validTypes.includes(type) ? type : "general";

    const result = await improveCVContent({
      content,
      type: enhancementType as any,
      context: {
        jobTitle: jobTitle || context?.jobTitle,
      },
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

    // Log to database if cvId provided
    if (cvId) {
      try {
        await db.aIContent.create({
          data: {
            cvId,
            type: enhancementType,
            originalText: content,
            generatedText: result.text,
            model: result.provider || "Smart ATS Engine",
            status: "generated",
          },
        });
      } catch (dbErr) {
        console.warn("Could not log AI content to DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      text: result.text,
      provider: result.provider,
    });
  } catch (error) {
    console.error("AI enhancement API error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during AI enhancement." },
      { status: 500 }
    );
  }
}
