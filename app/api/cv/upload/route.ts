import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { db } from "@/app/lib/db";
import { extractCVText } from "@/app/lib/cv-parser";
import { parseCVToStructuredData } from "@/app/lib/cv-structure";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const allowedExtensions = [
  ".pdf",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
];

export async function POST(request: Request) {
  let savedFilePath = "";

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You must be logged in to upload a CV",
        },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "No CV file was provided",
        },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only PDF, DOCX, JPG, JPEG, PNG and WEBP files are supported",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "The uploaded file is empty",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File size must be less than 10 MB",
        },
        { status: 400 }
      );
    }

    const extension = path.extname(file.name).toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid file extension. Supported formats: PDF, DOCX, JPG, JPEG, PNG and WEBP",
        },
        { status: 400 }
      );
    }

    const safeName =
      path
        .basename(file.name, extension)
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80) || "uploaded-cv";

    const uniqueFileName = `${Date.now()}-${crypto.randomUUID()}-${safeName}${extension}`;

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "cvs"
    );

    await fs.mkdir(uploadDirectory, {
      recursive: true,
    });

    savedFilePath = path.join(uploadDirectory, uniqueFileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    await fs.writeFile(savedFilePath, buffer);

    const publicPath = `/uploads/cvs/${uniqueFileName}`;

    const extraction = await extractCVText(
      savedFilePath,
      file.type
    );

    if (!extraction.success) {
      await fs.unlink(savedFilePath).catch(() => {});

      return NextResponse.json(
        {
          success: false,
          message:
            extraction.message ||
            "Unable to extract text from the uploaded CV",
        },
        { status: 422 }
      );
    }

    const extractedText = extraction.text.trim();

    if (!extractedText) {
      await fs.unlink(savedFilePath).catch(() => {});

      return NextResponse.json(
        {
          success: false,
          message:
            "No readable text was found in this CV.",
        },
        { status: 422 }
      );
    }

    const structureResult =
      await parseCVToStructuredData(extractedText);

    const parsedData = structureResult.success
      ? structureResult.data
      : null;

    const cv = await db.cV.create({
      data: {
        title:
          path.basename(file.name, extension).trim() ||
          "Uploaded CV",

        template: "modern",

        status: "uploaded",

        userId: session.user.id,

        personalInfo: parsedData?.personalInfo
          ? {
              create: {
                fullName:
                  parsedData.personalInfo.fullName,
                email:
                  parsedData.personalInfo.email,
                phone:
                  parsedData.personalInfo.phone,
                address:
                  parsedData.personalInfo.address,
                city:
                  parsedData.personalInfo.city,
                country:
                  parsedData.personalInfo.country,
                summary:
                  parsedData.personalInfo.summary,
                jobTitle:
                  parsedData.personalInfo.jobTitle,
                profileImage:
                  parsedData.personalInfo.profileImage,
                linkedin:
                  parsedData.personalInfo.linkedin,
                github:
                  parsedData.personalInfo.github,
                portfolio:
                  parsedData.personalInfo.portfolio,
              },
            }
          : undefined,

        education: {
          create: parsedData?.education || [],
        },

        experiences: {
          create: parsedData?.experiences || [],
        },

        skills: {
          create: parsedData?.skills || [],
        },

        projects: {
          create: parsedData?.projects || [],
        },

        certifications: {
          create: parsedData?.certifications || [],
        },

        languages: {
          create: parsedData?.languages || [],
        },

        uploadedCVs: {
          create: {
            originalName: file.name,
            fileName: uniqueFileName,
            fileType: file.type,
            fileSize: file.size,
            filePath: publicPath,
            extractedText,
            parsedData: parsedData
              ? JSON.parse(JSON.stringify(parsedData))
              : undefined,
            status: structureResult.success
              ? "parsed"
              : "extracted",
          },
        },
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
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: structureResult.success
          ? "CV uploaded and information extracted successfully"
          : "CV uploaded and text extracted, but structured parsing could not be completed",
        cv,
        extractedText,
        parsedData,
        parsingSuccess: structureResult.success,
        parsingMessage: structureResult.message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CV upload error:", error);

    if (savedFilePath) {
      await fs.unlink(savedFilePath).catch(() => {});
    }

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while uploading the CV",
      },
      { status: 500 }
    );
  }
}