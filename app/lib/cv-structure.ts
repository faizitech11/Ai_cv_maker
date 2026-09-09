import type {
  PersonalInfo,
  Education,
  Experience,
  Skill,
  Project,
  Certification,
  Language,
} from "@/app/types/cv";
import { callLLM } from "@/app/lib/ai";

export interface StructuredCVData {
  personalInfo: PersonalInfo | null;
  education: Education[];
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
}

export type StructureResult = {
  success: boolean;
  data: StructuredCVData | null;
  provider?: string;
  message?: string;
};

function getSystemPrompt(): string {
  return `You are an expert CV and resume parsing system.
Extract structured information ONLY from the user's CV text.

CRITICAL RULES:
1. Never invent fake information, companies, dates, or degrees.
2. If any field is not found in the text, use null, empty string, or empty array.
3. Return strictly valid JSON with no markdown wrapping and no conversational text.

Required JSON Structure:
{
  "personalInfo": {
    "fullName": string | null,
    "email": string | null,
    "phone": string | null,
    "address": string | null,
    "city": string | null,
    "country": string | null,
    "summary": string | null,
    "jobTitle": string | null,
    "profileImage": null,
    "linkedin": string | null,
    "github": string | null,
    "portfolio": string | null
  },
  "education": [
    {
      "degree": string,
      "institution": string,
      "location": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "description": string | null
    }
  ],
  "experiences": [
    {
      "position": string,
      "company": string,
      "location": string | null,
      "startDate": string | null,
      "endDate": string | null,
      "description": string | null
    }
  ],
  "skills": [
    {
      "name": string,
      "level": string | null
    }
  ],
  "projects": [
    {
      "name": string,
      "description": string | null,
      "technologies": string | null,
      "projectUrl": string | null,
      "startDate": string | null,
      "endDate": string | null
    }
  ],
  "certifications": [
    {
      "name": string,
      "organization": string | null,
      "issueDate": string | null,
      "expiryDate": string | null,
      "credentialId": string | null,
      "credentialUrl": string | null
    }
  ],
  "languages": [
    {
      "name": string,
      "proficiency": string | null
    }
  ]
}`;
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

function normalizePersonalInfo(value: unknown): PersonalInfo | null {
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

  const hasData = Object.values(personalInfo).some((val) => val !== undefined);
  return hasData ? personalInfo : null;
}

function normalizeEducation(value: unknown): Education[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      degree: nullableString(item.degree) || "Degree",
      institution: nullableString(item.institution) || "Institution",
      location: nullableString(item.location),
      startDate: nullableString(item.startDate),
      endDate: nullableString(item.endDate),
      description: nullableString(item.description),
    }))
    .filter((e) => e.degree !== "Degree" || e.institution !== "Institution");
}

function normalizeExperiences(value: unknown): Experience[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      position: nullableString(item.position) || "Position",
      company: nullableString(item.company) || "Company",
      location: nullableString(item.location),
      startDate: nullableString(item.startDate),
      endDate: nullableString(item.endDate),
      description: nullableString(item.description),
    }))
    .filter((e) => e.position !== "Position" || e.company !== "Company");
}

function normalizeSkills(value: unknown): Skill[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      name: nullableString(item.name) || "",
      level: nullableString(item.level),
    }))
    .filter((skill) => Boolean(skill.name && skill.name !== "Not specified"));
}

function normalizeProjects(value: unknown): Project[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      name: nullableString(item.name) || "",
      description: nullableString(item.description),
      technologies: nullableString(item.technologies),
      projectUrl: nullableString(item.projectUrl),
      startDate: nullableString(item.startDate),
      endDate: nullableString(item.endDate),
    }))
    .filter((p) => Boolean(p.name));
}

function normalizeCertifications(value: unknown): Certification[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      name: nullableString(item.name) || "",
      organization: nullableString(item.organization),
      issueDate: nullableString(item.issueDate),
      expiryDate: nullableString(item.expiryDate),
      credentialId: nullableString(item.credentialId),
      credentialUrl: nullableString(item.credentialUrl),
    }))
    .filter((c) => Boolean(c.name));
}

function normalizeLanguages(value: unknown): Language[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      name: nullableString(item.name) || "",
      proficiency: nullableString(item.proficiency),
    }))
    .filter((l) => Boolean(l.name));
}

function normalizeCVData(value: unknown): StructuredCVData {
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

/**
 * Robust Heuristic ATS Resume Extractor.
 * Parses sections, dates, contact details, experiences, educations, and skills
 * with zero external dependencies when no LLM API key is configured.
 */
export function heuristicATSExtraction(cvText: string): StructuredCVData {
  const lines = cvText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Contact Information Regexes
  const emailMatch = cvText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = cvText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,14}/);
  const linkedinMatch = cvText.match(/(?:linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i);
  const githubMatch = cvText.match(/(?:github\.com\/[a-zA-Z0-9_-]+)/i);
  const portfolioMatch = cvText.match(/(?:https?:\/\/)?([a-zA-Z0-9-]+\.(?:dev|me|io|site|org))/i);

  // Identify Full Name: first line that doesn't contain email, phone, or symbols
  let fullName: string | undefined;
  for (const line of lines.slice(0, 5)) {
    if (
      !line.includes("@") &&
      !line.match(/\d{5,}/) &&
      !line.match(/curriculum|resume|cv|page|email|phone/i) &&
      line.length >= 3 &&
      line.length <= 40
    ) {
      fullName = line;
      break;
    }
  }

  // Identify Job Title
  let jobTitle: string | undefined;
  for (const line of lines.slice(0, 8)) {
    if (
      line !== fullName &&
      line.match(/developer|engineer|manager|designer|specialist|lead|consultant|architect|analyst|executive|officer|intern|associate/i) &&
      line.length <= 60
    ) {
      jobTitle = line.replace(/^[|•-]\s*/, "");
      break;
    }
  }

  // 2. Section Segmentation
  const sectionHeaders: { section: string; regex: RegExp }[] = [
    { section: "summary", regex: /^(?:professional\s+summary|executive\s+summary|summary|profile|about\s+me|career\s+objective|objective)\b/i },
    { section: "experience", regex: /^(?:work\s+experience|professional\s+experience|employment\s+history|experience|work\s+history)\b/i },
    { section: "education", regex: /^(?:education|academic\s+background|academic\s+qualifications|qualifications|academic\s+history)\b/i },
    { section: "skills", regex: /^(?:technical\s+skills|core\s+competencies|key\s+skills|skills\s*(?:&|and)\s*expertise|skills)\b/i },
    { section: "projects", regex: /^(?:projects|key\s+projects|academic\s+projects|personal\s+projects)\b/i },
    { section: "certifications", regex: /^(?:certifications|certificates|licenses|courses|accreditations)\b/i },
    { section: "languages", regex: /^(?:languages|language\s+proficiency)\b/i },
  ];

  const sectionLines: Record<string, string[]> = {
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: [],
  };

  let currentSection: string | null = null;

  for (const line of lines) {
    let matchedHeader = false;
    for (const header of sectionHeaders) {
      if (header.regex.test(line)) {
        currentSection = header.section;
        matchedHeader = true;
        break;
      }
    }

    if (matchedHeader) continue;

    if (currentSection && sectionLines[currentSection]) {
      sectionLines[currentSection].push(line);
    }
  }

  // Summary Parsing
  let summaryText = sectionLines.summary.join(" ").slice(0, 600);
  if (!summaryText && lines.length > 2) {
    // If no explicit summary header, check lines 2 to 5
    const candidateLines = lines.slice(1, 6).filter((l) => l !== jobTitle && !l.includes("@") && !l.match(/\d{5,}/) && l.length > 25);
    if (candidateLines.length > 0) {
      summaryText = candidateLines.join(" ").slice(0, 500);
    }
  }

  // Date Range Regex for Experience / Education
  const dateRangeRegex = /(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}\/\d{2,4})\s+)?(\d{4})\s*[-–—to]+\s*(?:(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|\d{1,2}\/\d{2,4})\s+)?(\d{4}|Present|Current|Now)/i;

  // 3. Experience Parser
  const experiences: Experience[] = [];
  const expLines = sectionLines.experience;
  let currentExp: Experience | null = null;

  for (const line of expLines) {
    const dateMatch = line.match(dateRangeRegex);

    if (dateMatch) {
      if (currentExp) {
        experiences.push(currentExp);
      }

      const datePart = dateMatch[0];
      const restOfLine = line.replace(datePart, "").replace(/^[|•,-\s]+|[|•,-\s]+$/g, "");
      const dateParts = datePart.split(/[-–—to]+/i);

      let position = restOfLine || jobTitle || "Position";
      let company = "Company";

      if (restOfLine.includes(" at ")) {
        const parts = restOfLine.split(" at ");
        position = parts[0].trim();
        company = parts[1].trim();
      } else if (restOfLine.includes(" - ")) {
        const parts = restOfLine.split(" - ");
        position = parts[0].trim();
        company = parts[1].trim();
      } else if (restOfLine.includes("|")) {
        const parts = restOfLine.split("|");
        position = parts[0].trim();
        company = parts[1].trim();
      }

      currentExp = {
        position,
        company,
        startDate: dateParts[0]?.trim() || "",
        endDate: dateParts[1]?.trim() || "Present",
        description: "",
      };
    } else if (currentExp) {
      if (currentExp.description) {
        currentExp.description += `\n${line}`;
      } else {
        currentExp.description = line;
      }
    } else if (line.match(/developer|engineer|manager|specialist|lead|designer|analyst|executive|officer/i)) {
      currentExp = {
        position: line,
        company: "Company",
        startDate: "",
        endDate: "Present",
        description: "",
      };
    }
  }

  if (currentExp) {
    experiences.push(currentExp);
  }

  // 4. Education Parser
  const education: Education[] = [];
  const eduLines = sectionLines.education;
  let currentEdu: Education | null = null;
  const degreeRegex = /(?:bachelor|master|ph\.?d|doctorate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|b\.?sc|m\.?sc|b\.?tech|associate|diploma|matric|intermediate|high\s+school)/i;

  for (const line of eduLines) {
    const hasDegree = degreeRegex.test(line);
    const dateMatch = line.match(dateRangeRegex);

    if (hasDegree || (dateMatch && !currentEdu)) {
      if (currentEdu) education.push(currentEdu);

      const datePart = dateMatch ? dateMatch[0] : "";
      const cleanLine = datePart ? line.replace(datePart, "").replace(/^[|•,-\s]+|[|•,-\s]+$/g, "") : line;
      const dateParts = datePart ? datePart.split(/[-–—to]+/i) : [];

      let degree = cleanLine;
      let institution = "University / College";

      if (cleanLine.includes(" at ")) {
        const parts = cleanLine.split(" at ");
        degree = parts[0].trim();
        institution = parts[1].trim();
      } else if (cleanLine.includes(",")) {
        const parts = cleanLine.split(",");
        degree = parts[0].trim();
        institution = parts.slice(1).join(",").trim();
      } else if (cleanLine.includes("-")) {
        const parts = cleanLine.split("-");
        degree = parts[0].trim();
        institution = parts[1].trim();
      }

      currentEdu = {
        degree: degree || "Degree",
        institution: institution || "Institution",
        startDate: dateParts[0]?.trim() || "",
        endDate: dateParts[1]?.trim() || "",
        description: "",
      };
    } else if (currentEdu) {
      if (!currentEdu.institution || currentEdu.institution === "University / College") {
        currentEdu.institution = line;
      } else {
        currentEdu.description = currentEdu.description ? `${currentEdu.description}\n${line}` : line;
      }
    }
  }

  if (currentEdu) education.push(currentEdu);

  // 5. Skills Parser
  const skills: Skill[] = [];
  const skillLines = sectionLines.skills;
  const rawSkillTokens: string[] = [];

  for (const line of skillLines) {
    // Split by commas, bullets, slashes, or pipes
    const tokens = line.split(/[,•|/;\t\n]+/).map((t) => t.trim()).filter(Boolean);
    for (const token of tokens) {
      const cleanToken = token.replace(/^[-*•]\s*/, "").trim();
      if (cleanToken.length >= 2 && cleanToken.length <= 40 && !cleanToken.match(/^http/i)) {
        rawSkillTokens.push(cleanToken);
      }
    }
  }

  // Remove duplicates
  const seenSkills = new Set<string>();
  for (const s of rawSkillTokens) {
    const lower = s.toLowerCase();
    if (!seenSkills.has(lower)) {
      seenSkills.add(lower);
      skills.push({ name: s, level: "Proficient" });
    }
  }

  // 6. Projects Parser
  const projects: Project[] = [];
  for (const line of sectionLines.projects) {
    if (line.length > 3 && !line.startsWith("•") && !line.startsWith("-")) {
      projects.push({
        name: line,
        description: "",
        technologies: "",
        projectUrl: undefined,
      });
    } else if (projects.length > 0) {
      const lastProject = projects[projects.length - 1];
      if (line.match(/^tech(?:nologies)?[:\s]/i)) {
        lastProject.technologies = line.replace(/^tech(?:nologies)?[:\s]/i, "").trim();
      } else {
        lastProject.description = lastProject.description ? `${lastProject.description} ${line}` : line;
      }
    }
  }

  // 7. Languages Parser
  const languages: Language[] = [];
  const commonLanguages = [
    "English", "Urdu", "Spanish", "French", "German", "Arabic", "Hindi", "Chinese", "Mandarin",
    "Russian", "Japanese", "Portuguese", "Italian", "Turkish", "Punjabi", "Pashto", "Sindhi"
  ];

  for (const line of sectionLines.languages) {
    for (const lang of commonLanguages) {
      if (new RegExp(`\\b${lang}\\b`, "i").test(line)) {
        const profMatch = line.match(/\b(Native|Fluent|Proficient|Intermediate|Basic|Professional|Bilingual)\b/i);
        languages.push({
          name: lang,
          proficiency: profMatch ? profMatch[0] : "Fluent",
        });
      }
    }
  }

  // 8. Certifications Parser
  const certifications: Certification[] = [];
  for (const line of sectionLines.certifications) {
    if (line.length >= 3 && line.length <= 80) {
      certifications.push({
        name: line.replace(/^[-•*]\s*/, ""),
        organization: undefined,
      });
    }
  }

  return {
    personalInfo: {
      fullName,
      email: emailMatch ? emailMatch[0] : undefined,
      phone: phoneMatch ? phoneMatch[0] : undefined,
      address: undefined,
      city: undefined,
      country: undefined,
      summary: summaryText || undefined,
      jobTitle: jobTitle || undefined,
      profileImage: undefined,
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : undefined,
      github: githubMatch ? `https://${githubMatch[0]}` : undefined,
      portfolio: portfolioMatch ? portfolioMatch[0] : undefined,
    },
    education,
    experiences,
    skills,
    projects,
    certifications,
    languages,
  };
}

/**
 * Main CV Parsing entry point.
 * Uses available LLM provider if key configured, otherwise seamlessly uses the intelligent ATS parser.
 */
export async function parseCVToStructuredData(
  cvText: string
): Promise<StructureResult> {
  try {
    if (!cvText || !cvText.trim()) {
      return {
        success: false,
        data: null,
        message: "CV text is empty.",
      };
    }

    // Step 1: Check if any external LLM provider is available
    const hasAnyKey = Boolean(
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GROQ_API_KEY?.trim() ||
      process.env.OPENAI_API_KEY?.trim() ||
      process.env.OPENROUTER_API_KEY?.trim() ||
      process.env.HUGGINGFACE_API_KEY?.trim()
    );

    if (hasAnyKey) {
      try {
        const prompt = `Extract all details from this CV text into the exact JSON format:\n\n${cvText}`;
        const llmResult = await callLLM(prompt, getSystemPrompt(), {
          jsonMode: true,
          maxTokens: 3500,
          temperature: 0.1,
        });

        if (llmResult.success && llmResult.text) {
          const jsonText = cleanJsonText(llmResult.text);
          const parsed = JSON.parse(jsonText);
          const structured = normalizeCVData(parsed);

          // Verify that structured result has meaningful data
          if (
            structured.personalInfo ||
            structured.experiences.length > 0 ||
            structured.education.length > 0 ||
            structured.skills.length > 0
          ) {
            return {
              success: true,
              data: structured,
              provider: llmResult.provider,
              message: `Parsed successfully using ${llmResult.provider}`,
            };
          }
        }
      } catch (aiParseErr) {
        console.warn("LLM parsing encountered format error, falling back to ATS Heuristic Engine...", aiParseErr);
      }
    }

    // Step 2: Intelligent Heuristic ATS Fallback Engine (Guaranteed extraction)
    const heuristicData = heuristicATSExtraction(cvText);

    return {
      success: true,
      data: heuristicData,
      provider: "Smart Local ATS Parser",
      message: "Parsed successfully using Built-in ATS Extraction Engine",
    };
  } catch (error) {
    console.error("CV structure parsing error:", error);

    return {
      success: true,
      data: heuristicATSExtraction(cvText),
      provider: "Smart Local ATS Parser",
      message: "Parsed using standard extraction fallback.",
    };
  }
}