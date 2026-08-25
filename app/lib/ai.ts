const HUGGING_FACE_API_URL =
  "https://router.huggingface.co/v1/chat/completions";

type AIResult = {
  success: boolean;
  text: string;
  message?: string;
};

type ImproveContentOptions = {
  content: string;
  type: "summary" | "experience" | "project" | "skills" | "general";
};

function getHFToken(): string {
  const token = process.env.HUGGINGFACE_API_KEY;

  if (!token) {
    throw new Error("HUGGINGFACE_API_KEY is not configured.");
  }

  return token;
}

function getPrompt({
  content,
  type,
}: ImproveContentOptions): string {
  const instructions = {
    summary:
      "Rewrite the provided professional summary to make it clear, professional, concise and suitable for a CV.",
    experience:
      "Rewrite the provided work experience description using clear, professional CV language. Keep the original facts and do not invent responsibilities, achievements, technologies or companies.",
    project:
      "Rewrite the provided project description to make it professional and clear. Keep only the information provided by the user and do not invent features, technologies or results.",
    skills:
      "Organize and improve the wording of the provided skills information without adding skills that were not provided.",
    general:
      "Improve the provided CV content while keeping all original facts. Do not invent information.",
  };

  return `
You are a professional CV writing assistant.

Task:
${instructions[type]}

Important rules:
- Only improve information provided by the user.
- Never invent education, experience, companies, skills, achievements, dates or technologies.
- Do not add fake statistics or responsibilities.
- Keep the meaning of the original information.
- Return only the improved CV content.
- Do not use markdown.
- Do not add explanations.

Original content:
${content}
`;
}

export async function improveCVContent(
  options: ImproveContentOptions
): Promise<AIResult> {
  try {
    if (!options.content.trim()) {
      return {
        success: false,
        text: "",
        message: "Content is required.",
      };
    }

    const token = getHFToken();

    const response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.1-8B-Instruct",
        messages: [
          {
            role: "user",
            content: getPrompt(options),
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Hugging Face API error:", errorText);

      return {
        success: false,
        text: "",
        message: "Unable to generate AI content.",
      };
    }

    const data = await response.json();

    const generatedText =
      data?.choices?.[0]?.message?.content?.trim() || "";

    if (!generatedText) {
      return {
        success: false,
        text: "",
        message: "AI returned empty content.",
      };
    }

    return {
      success: true,
      text: generatedText,
    };
  } catch (error) {
    console.error("AI error:", error);

    return {
      success: false,
      text: "",
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong with AI.",
    };
  }
}

export async function generateProfessionalSummary(
  content: string
): Promise<AIResult> {
  return improveCVContent({
    content,
    type: "summary",
  });
}

export async function improveExperience(
  content: string
): Promise<AIResult> {
  return improveCVContent({
    content,
    type: "experience",
  });
}

export async function improveProject(
  content: string
): Promise<AIResult> {
  return improveCVContent({
    content,
    type: "project",
  });
}

export async function improveSkills(
  content: string
): Promise<AIResult> {
  return improveCVContent({
    content,
    type: "skills",
  });
}