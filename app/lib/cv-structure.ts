import type {
  PersonalInfo,
  Education,
  Experience,
  Skill,
  Project,
  Certification,
  Language,
} from "@/app/types/cv";

const HUGGING_FACE_API_URL =
  "https://router.huggingface.co/v1/chat/completions";

const MODEL = "meta-llama/Llama-3.1-8B-Instruct";

export interface StructuredCVData {
  personalInfo: PersonalInfo | null;
  education: Education[];
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
}

type StructureResult = {
  success: boolean;
  data: StructuredCVData | null;
  message?: string;
};

function getToken(): string {
  const token = process.env.HUGGINGFACE_API_KEY;

  if (!token) {
    throw new Error("HUGGINGFACE_API_KEY is not configured.");
  }

  return token;
}

function getSystemPrompt(): string {
  return `
You are a CV information extraction system.

Your task is to extract structured information ONLY from the CV text provided by the user.

STRICT RULES:

1. Never invent information.
2. Never create fake education.
3. Never create fake companies.
4. Never create fake job positions.
5. Never create fake skills.
6. Never create fake projects.
7. Never create fake certifications.
8. Never create fake languages.
9. Never create fake dates.
10. Never create fake achievements.
11. If information is missing, use null, an empty string, or an empty array.
12. Keep the original meaning of the CV.
13. Do not improve or rewrite the content.
14. This step is ONLY extraction and organization.
15. Return ONLY valid JSON.
16. Do not use markdown.
17. Do not put the JSON inside a code block.

Return exactly this JSON structure:

{
  "personalInfo": {
    "fullName": null,
    "email": null,
    "phone": null,
    "address": null,
    "city": null,
    "country": null,
    "summary": null,
    "jobTitle": null,
    "profileImage": null,
    "linkedin": null,
    "github": null,
    "portfolio": null
  },
  "education": [],
  "experiences": [],
  "skills": [],
  "projects": [],
  "certifications": [],
  "languages": []
}

Education objects must use:
{
  "degree": "",
  "institution": "",
  "location": null,
  "startDate": null,
  "endDate": null,
  "description": null
}

Experience objects must use:
{
  "position": "",
  "company": "",
  "location": null,
  "startDate": null,
  "endDate": null,
  "description": null
}

Skill objects must use:
{
  "name": "",
  "level": null
}

Project objects must use:
{
  "name": "",
  "description": null,
  "technologies": null,
  "projectUrl": null,
  "startDate": null,
  "endDate": null
}

Certification objects must use:
{
  "name": "",
  "organization": null,
  "issueDate": null,
  "expiryDate": null,
  "credentialId": null,
  "credentialUrl": null
}

Language objects must use:
{
  "name": "",
  "proficiency": null
}
`;
}

function cleanJsonText(text: string): string {
  let cleaned = text.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/i, "");
  }

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned.trim();
}

function nullableString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed || undefined;
}

function normalizePersonalInfo(
  value: unknown
): PersonalInfo | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Record<string, unknown>;

  const personalInfo: PersonalInfo = {
    fullName: nullableString(item.fullName),
    email: nullableString(item.email),
    phone: nullableString(item.phone),
    address: nullableString(item.address),
    city: nullableString(item.city),
    country: nullableString(item.country),
    summary: nullableString(item.summary),
    jobTitle: nullableString(item.jobTitle),
    profileImage: nullableString(item.profileImage),
    linkedin: nullableString(item.linkedin),
    github: nullableString(item.github),
    portfolio: nullableString(item.portfolio),
  };

  const hasData = Object.values(personalInfo).some(
    (value) => value !== undefined
  );

  return hasData ? personalInfo : null;
}

function normalizeEducation(value: unknown): Education[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object"
    )
    .map((item) => ({
      degree: nullableString(item.degree) || "Not specified",
      institution:
        nullableString(item.institution) || "Not specified",
      location: nullableString(item.location),
      startDate: nullableString(item.startDate),
      endDate: nullableString(item.endDate),
      description: nullableString(item.description),
    }));
}

function normalizeExperiences(value: unknown): Experience[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object"
    )
    .map((item) => ({
      position:
        nullableString(item.position) || "Not specified",
      company:
        nullableString(item.company) || "Not specified",
      location: nullableString(item.location),
      startDate: nullableString(item.startDate),
      endDate: nullableString(item.endDate),
      description: nullableString(item.description),
    }));
}

function normalizeSkills(value: unknown): Skill[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object"
    )
    .map((item) => ({
      name: nullableString(item.name) || "Not specified",
      level: nullableString(item.level),
    }))
    .filter((skill) => skill.name !== "Not specified");
}

function normalizeProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object"
    )
    .map((item) => ({
      name: nullableString(item.name) || "Not specified",
      description: nullableString(item.description),
      technologies: nullableString(item.technologies),
      projectUrl: nullableString(item.projectUrl),
      startDate: nullableString(item.startDate),
      endDate: nullableString(item.endDate),
    }));
}

function normalizeCertifications(
  value: unknown
): Certification[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object"
    )
    .map((item) => ({
      name: nullableString(item.name) || "Not specified",
      organization: nullableString(item.organization),
      issueDate: nullableString(item.issueDate),
      expiryDate: nullableString(item.expiryDate),
      credentialId: nullableString(item.credentialId),
      credentialUrl: nullableString(item.credentialUrl),
    }));
}

function normalizeLanguages(value: unknown): Language[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object"
    )
    .map((item) => ({
      name: nullableString(item.name) || "Not specified",
      proficiency: nullableString(item.proficiency),
    }))
    .filter((language) => language.name !== "Not specified");
}

function normalizeCVData(
  value: unknown
): StructuredCVData {
  if (!value || typeof value !== "object") {
    return {
      personalInfo: null,
      education: [],
      experiences: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
    };
  }

  const data = value as Record<string, unknown>;

  return {
    personalInfo: normalizePersonalInfo(data.personalInfo),
    education: normalizeEducation(data.education),
    experiences: normalizeExperiences(data.experiences),
    skills: normalizeSkills(data.skills),
    projects: normalizeProjects(data.projects),
    certifications: normalizeCertifications(data.certifications),
    languages: normalizeLanguages(data.languages),
  };
}

export async function parseCVToStructuredData(
  cvText: string
): Promise<StructureResult> {
  try {
    if (!cvText.trim()) {
      return {
        success: false,
        data: null,
        message: "CV text is empty.",
      };
    }

    const token = getToken();

    const response = await fetch(HUGGING_FACE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "system",
            content: getSystemPrompt(),
          },
          {
            role: "user",
            content: `Extract information from this CV:\n\n${cvText}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Hugging Face structured CV error:",
        errorText
      );

      return {
        success: false,
        data: null,
        message: "Unable to parse CV using AI.",
      };
    }

    const result = await response.json();

    const generatedText =
      result?.choices?.[0]?.message?.content?.trim();

    if (!generatedText) {
      return {
        success: false,
        data: null,
        message: "AI returned empty CV data.",
      };
    }

    const jsonText = cleanJsonText(generatedText);

    let parsedData: unknown;

    try {
      parsedData = JSON.parse(jsonText);
    } catch (error) {
      console.error("Invalid AI JSON:", generatedText);
      console.error("JSON parsing error:", error);

      return {
        success: false,
        data: null,
        message: "AI returned invalid structured CV data.",
      };
    }

    const structuredData = normalizeCVData(parsedData);

    return {
      success: true,
      data: structuredData,
    };
  } catch (error) {
    console.error("CV structure parsing error:", error);

    return {
      success: false,
      data: null,
      message:
        error instanceof Error
          ? error.message
          : "Unable to structure CV data.",
    };
  }
}