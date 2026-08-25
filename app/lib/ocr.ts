import { createWorker } from "tesseract.js";

type OCRResult = {
  success: boolean;
  text: string;
  message?: string;
};

export async function extractImageText(
  buffer: Buffer
): Promise<OCRResult> {
  let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

  try {
    if (!buffer || buffer.length === 0) {
      return {
        success: false,
        text: "",
        message: "Image file is empty.",
      };
    }

    worker = await createWorker("eng");

    const result = await worker.recognize(buffer);

    const text = result.data.text?.trim() || "";

    if (!text) {
      return {
        success: false,
        text: "",
        message: "No readable text was found in the image.",
      };
    }

    return {
      success: true,
      text,
    };
  } catch (error) {
    console.error("OCR extraction error:", error);

    return {
      success: false,
      text: "",
      message: "Unable to extract text from the CV image.",
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}