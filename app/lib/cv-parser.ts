import fs from "fs/promises";
import path from "path";
import { extractImageText } from "@/app/lib/ocr";

type ParserResult = {
  text: string;
  success: boolean;
  message?: string;
};

export async function extractCVText(
  filePath: string,
  fileType: string
): Promise<ParserResult> {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), "public", filePath);

    const fileBuffer = await fs.readFile(absolutePath);
    const extension = path.extname(filePath).toLowerCase();

    if (
      fileType === "application/pdf" ||
      extension === ".pdf"
    ) {
      return await extractPDFText(fileBuffer);
    }

    if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      extension === ".docx"
    ) {
      return await extractDOCXText(fileBuffer);
    }

    if (
      fileType === "application/msword" ||
      extension === ".doc"
    ) {
      return {
        success: false,
        text: "",
        message:
          "Old DOC files are not supported. Please upload a DOCX or PDF file.",
      };
    }

    if (
      fileType === "image/jpeg" ||
      fileType === "image/jpg" ||
      fileType === "image/png" ||
      fileType === "image/webp" ||
      [".jpg", ".jpeg", ".png", ".webp"].includes(extension)
    ) {
      return await extractImageText(fileBuffer);
    }

    if (
      fileType === "text/plain" ||
      extension === ".txt"
    ) {
      const text = fileBuffer.toString("utf-8").trim();

      return {
        success: Boolean(text),
        text,
        message: text
          ? undefined
          : "The text file is empty.",
      };
    }

    return {
      success: false,
      text: "",
      message: "Unsupported CV file type.",
    };
  } catch (error) {
    console.error("CV parser error:", error);

    return {
      success: false,
      text: "",
      message:
        error instanceof Error
          ? error.message
          : "Unable to extract text from the CV.",
    };
  }
}

async function extractPDFText(
  buffer: Buffer
): Promise<ParserResult> {
  try {
    console.log("PDF extraction started...");
    console.log("PDF buffer size:", buffer.length);

    const pdfParseModule = await import("pdf-parse");

    const pdfParse =
      (pdfParseModule as any).default ??
      (pdfParseModule as any);

    if (typeof pdfParse !== "function") {
      console.error(
        "pdf-parse module:",
        pdfParseModule
      );

      return {
        success: false,
        text: "",
        message:
          "PDF parser could not be initialized.",
      };
    }

    const result = await pdfParse(buffer);

    const text =
      typeof result?.text === "string"
        ? result.text.trim()
        : "";

    console.log(
      "PDF pages:",
      result?.numpages ?? "unknown"
    );

    console.log(
      "Extracted PDF text length:",
      text.length
    );

    if (!text) {
      return {
        success: false,
        text: "",
        message:
          "No readable text was found in the PDF. Please upload a PDF containing selectable text.",
      };
    }

    console.log(
      "PDF text preview:",
      text.substring(0, 500)
    );

    return {
      success: true,
      text,
    };
  } catch (error) {
    console.error(
      "PDF extraction error:",
      error
    );

    return {
      success: false,
      text: "",
      message:
        error instanceof Error
          ? error.message
          : "Unable to extract text from PDF.",
    };
  }
}

async function extractDOCXText(
  buffer: Buffer
): Promise<ParserResult> {
  try {
    const mammoth = await import("mammoth");

    const result =
      await mammoth.extractRawText({
        buffer,
      });

    const text =
      result.value?.trim() || "";

    if (!text) {
      return {
        success: false,
        text: "",
        message:
          "No readable text was found in the DOCX file.",
      };
    }

    return {
      success: true,
      text,
    };
  } catch (error) {
    console.error(
      "DOCX extraction error:",
      error
    );

    return {
      success: false,
      text: "",
      message:
        error instanceof Error
          ? error.message
          : "Unable to extract text from DOCX.",
    };
  }
}