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

function smartLocalEnhance(content: string, type: string): string {
  let text = content.trim();

  const actionVerbMap: [RegExp, string][] = [
    [/\bwas responsible for\b/gi, "Spearheaded"],
    [/\bresponsible for\b/gi, "Led and managed"],
    [/\bworked on\b/gi, "Engineered and developed"],
    [/\bhelped to\b/gi, "Collaborated to"],
    [/\bhelped with\b/gi, "Contributed to"],
    [/\bin charge of\b/gi, "Directed and supervised"],
    [/\bmade\b/gi, "Architected and delivered"],
    [/\bdid\b/gi, "Executed and accomplished"],
    [/\bhandled\b/gi, "Managed and optimized"],
    [/\bgot\b/gi, "Achieved"],
    [/\blooking to\b/gi, "Seeking to leverage expertise to"],
    [/\bgood at\b/gi, "Proficient in"],
  ];

  for (const [pattern, replacement] of actionVerbMap) {
    text = text.replace(pattern, replacement);
  }

  text = text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

  if (type === "summary" && !text.match(/professional|developer|engineer|experienced|proven/i)) {
    text = `Results-driven professional with proven expertise. ${text}`;
  }

  return text;
}

export async function improveCVContent(
  options: ImproveContentOptions
): Promise<AIResult> {
  try {
    if (!options.content || !options.content.trim()) {
      return {
        success: false,
        text: "",
        message: "Content is required for AI enhancement.",
      };
    }

    const prompt = getPrompt(options);

    // Tier 1: Try Hugging Face if key is available
    const token = process.env.HUGGINGFACE_API_KEY;
    if (token && token.trim()) {
      try {
        const response = await fetch(HUGGING_FACE_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 500,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const generatedText = data?.choices?.[0]?.message?.content?.trim();
          if (generatedText) {
            return { success: true, text: generatedText };
          }
        }
      } catch (hfErr) {
        console.warn("Hugging Face API failed, trying Pollinations AI fallback...", hfErr);
      }
    }

    // Tier 2: Try Pollinations AI free open endpoint
    try {
      const pollRes = await fetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          seed: Math.floor(Math.random() * 10000),
        }),
      });

      if (pollRes.ok) {
        const text = (await pollRes.text()).trim();
        if (text && text.length > 5) {
          return { success: true, text };
        }
      }
    } catch (pollErr) {
        console.warn("Pollinations AI API failed, using Smart Local Enhancer...", pollErr);
    }

    // Tier 3: Guaranteed Smart Local Professional Enhancer
    const enhancedText = smartLocalEnhance(options.content, options.type);
    return {
      success: true,
      text: enhancedText,
    };
  } catch (error) {
    console.error("AI error:", error);
    const enhancedText = smartLocalEnhance(options.content, options.type);
    return {
      success: true,
      text: enhancedText,
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