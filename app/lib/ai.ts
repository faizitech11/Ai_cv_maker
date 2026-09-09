/**
 * Multi-Provider AI Service for AI CV Maker
 * Supports Google Gemini, Groq, OpenAI, OpenRouter, and Hugging Face,
 * along with a high-performance offline intelligent NLP enhancer.
 */

export type AIResult = {
  success: boolean;
  text: string;
  provider?: string;
  message?: string;
};

export type ImproveContentOptions = {
  content: string;
  type: "summary" | "experience" | "project" | "skills" | "general";
  context?: {
    jobTitle?: string;
    skills?: string[];
  };
};

export interface LLMCallResult {
  success: boolean;
  text: string;
  provider?: string;
  error?: string;
}

/**
 * Universal LLM caller that checks configured environment keys in order of speed and capability:
 * 1. Google Gemini (GEMINI_API_KEY)
 * 2. Groq (GROQ_API_KEY)
 * 3. OpenAI (OPENAI_API_KEY)
 * 4. OpenRouter (OPENROUTER_API_KEY)
 * 5. Hugging Face (HUGGINGFACE_API_KEY)
 */
export async function callLLM(
  prompt: string,
  systemInstruction?: string,
  options?: { jsonMode?: boolean; maxTokens?: number; temperature?: number }
): Promise<LLMCallResult> {
  const maxTokens = options?.maxTokens ?? 2048;
  const temperature = options?.temperature ?? 0.2;

  // 1. Google Gemini (Recommended & Free tier)
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const fullPrompt = systemInstruction
        ? `${systemInstruction}\n\nUser Request:\n${prompt}`
        : prompt;

      const bodyPayload: any = {
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      };

      if (options?.jsonMode) {
        bodyPayload.generationConfig.responseMimeType = "application/json";
      }

      // Try gemini-1.5-flash or gemini-2.0-flash
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const generatedText =
          data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (generatedText) {
          return { success: true, text: generatedText, provider: "Google Gemini" };
        }
      } else {
        const errText = await response.text();
        console.warn("Gemini API error response:", response.status, errText);
      }
    } catch (geminiErr) {
      console.warn("Gemini API call failed, trying next provider...", geminiErr);
    }
  }

  // 2. Groq (Ultra-fast free Llama 3.3)
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    try {
      const messages: { role: string; content: string }[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const bodyPayload: any = {
        model: "llama-3.3-70b-versatile",
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      if (options?.jsonMode) {
        bodyPayload.response_format = { type: "json_object" };
      }

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          return { success: true, text, provider: "Groq (Llama 3.3)" };
        }
      } else {
        const errText = await response.text();
        console.warn("Groq API error response:", response.status, errText);
      }
    } catch (groqErr) {
      console.warn("Groq API call failed, trying next provider...", groqErr);
    }
  }

  // 3. OpenAI
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    try {
      const messages: { role: string; content: string }[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const bodyPayload: any = {
        model: "gpt-4o-mini",
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      if (options?.jsonMode) {
        bodyPayload.response_format = { type: "json_object" };
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openaiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bodyPayload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          return { success: true, text, provider: "OpenAI (GPT-4o-mini)" };
        }
      }
    } catch (openaiErr) {
      console.warn("OpenAI API call failed, trying next provider...", openaiErr);
    }
  }

  // 4. OpenRouter
  const openrouterKey = process.env.OPENROUTER_API_KEY?.trim();
  if (openrouterKey) {
    try {
      const messages: { role: string; content: string }[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openrouterKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-3.2-3b-instruct:free",
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          return { success: true, text, provider: "OpenRouter" };
        }
      }
    } catch (orErr) {
      console.warn("OpenRouter API call failed...", orErr);
    }
  }

  // 5. Hugging Face
  const hfKey = process.env.HUGGINGFACE_API_KEY?.trim();
  if (hfKey) {
    try {
      const messages: { role: string; content: string }[] = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content?.trim();
        if (text) {
          return { success: true, text, provider: "Hugging Face" };
        }
      }
    } catch (hfErr) {
      console.warn("Hugging Face API call failed...", hfErr);
    }
  }

  return {
    success: false,
    text: "",
    error: "No active external AI provider configured or network request failed.",
  };
}

/**
 * High-performance smart local NLP enhancer.
 * Runs instantly offline and produces industry-standard, ATS-optimized CV phrasing.
 */
export function smartLocalEnhance(
  content: string,
  type: string,
  context?: { jobTitle?: string }
): string {
  let text = content.trim();

  // 1. Power Action Verbs Replacement
  const actionVerbMap: [RegExp, string][] = [
    [/\b(was|were) responsible for\b/gi, "Spearheaded and managed"],
    [/\bresponsible for\b/gi, "Led and executed"],
    [/\b(was|were) working on\b/gi, "Engineered and delivered"],
    [/\bworked on\b/gi, "Engineered and developed"],
    [/\bworked with\b/gi, "Collaborated cross-functionally with"],
    [/\bhelped to\b/gi, "Partnered to"],
    [/\bhelped with\b/gi, "Contributed significantly to"],
    [/\bhelped\b/gi, "Facilitated and supported"],
    [/\bin charge of\b/gi, "Directed and supervised"],
    [/\bmade\b/gi, "Architected and delivered"],
    [/\bdid\b/gi, "Executed and accomplished"],
    [/\bhandled\b/gi, "Managed and streamlined"],
    [/\bgot\b/gi, "Achieved"],
    [/\btook care of\b/gi, "Administered and maintained"],
    [/\btalked to\b/gi, "Liaised with"],
    [/\blooking to\b/gi, "Seeking to leverage demonstrated expertise to"],
    [/\bgood at\b/gi, "Proficient in"],
    [/\ba lot of\b/gi, "extensive"],
    [/\bmany\b/gi, "numerous"],
    [/\bfixed\b/gi, "Resolved and debugged"],
    [/\bchanged\b/gi, "Refactored and enhanced"],
    [/\bset up\b/gi, "Configured and deployed"],
    [/\bused\b/gi, "Leveraged"],
  ];

  for (const [pattern, replacement] of actionVerbMap) {
    text = text.replace(pattern, replacement);
  }

  // 2. Capitalization and punctuation cleanup
  text = text.replace(/(^\s*|[.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

  // 3. Format according to section type
  if (type === "summary") {
    const rolePrefix = context?.jobTitle ? `${context.jobTitle} with proven track record` : "Results-driven professional";
    if (!text.match(/professional|developer|engineer|experienced|proven|track record/i)) {
      text = `${rolePrefix}. ${text}`;
    }
    if (!text.endsWith(".")) {
      text += ".";
    }
  } else if (type === "experience" || type === "project") {
    // If multiline, ensure each line is bullet-ready
    const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
    if (lines.length > 1) {
      text = lines
        .map((line) => {
          let cleanLine = line.replace(/^[-•*]\s*/, "");
          cleanLine = cleanLine.charAt(0).toUpperCase() + cleanLine.slice(1);
          if (!cleanLine.endsWith(".")) cleanLine += ".";
          return `• ${cleanLine}`;
        })
        .join("\n");
    } else if (text && !text.endsWith(".")) {
      text += ".";
    }
  }

  return text;
}

/**
 * Improve any CV section content with AI or local smart fallback.
 */
export async function improveCVContent(
  options: ImproveContentOptions
): Promise<AIResult> {
  const content = options.content?.trim();
  if (!content) {
    return {
      success: false,
      text: "",
      message: "Content is required for AI enhancement.",
    };
  }

  const promptInstructions = {
    summary:
      "Rewrite this CV professional summary to be concise, impactful, and tailored for senior hiring managers. Retain all factual career details and do not invent new credentials.",
    experience:
      "Rewrite this work experience description into strong, action-driven bullet points using powerful verbs (e.g., Engineered, Spearheaded, Optimized). Keep original facts.",
    project:
      "Rewrite this project description into crisp, professional language detailing problem, implementation, and impact. Keep original facts.",
    skills:
      "Refine and organize this skills list into a clean, modern industry-standard format.",
    general:
      "Improve this CV text to make it professional, ATS-optimized, and grammatically impeccable. Do not invent new facts.",
  };

  const systemInstruction = `You are an executive CV writer and ATS optimization specialist.
Task: ${promptInstructions[options.type] || promptInstructions.general}

Rules:
- Never invent experiences, dates, companies, or technologies.
- Use active, professional, and confident business language.
- Return ONLY the improved text directly without markdown headers, intro explanations, or conversational filler.`;

  // Try external LLMs first
  const llmResult = await callLLM(content, systemInstruction, {
    temperature: 0.2,
    maxTokens: 600,
  });

  if (llmResult.success && llmResult.text) {
    return {
      success: true,
      text: llmResult.text,
      provider: llmResult.provider,
    };
  }

  // Guaranteed Smart Local Enhancement Fallback
  const localEnhanced = smartLocalEnhance(content, options.type, {
    jobTitle: options.context?.jobTitle,
  });

  return {
    success: true,
    text: localEnhanced,
    provider: "Smart Local ATS Engine",
  };
}

/**
 * Auto-generate a compelling professional summary from the user's existing CV profile data.
 */
export async function generateSummaryFromProfile(data: {
  jobTitle?: string;
  fullName?: string;
  experiences?: Array<{ position?: string; company?: string; description?: string }>;
  education?: Array<{ degree?: string; institution?: string }>;
  skills?: Array<{ name?: string }>;
}): Promise<AIResult> {
  const jobTitle = data.jobTitle || "Professional";
  const skillList = (data.skills || []).map((s) => s.name).filter(Boolean).slice(0, 8).join(", ");
  const topExp = (data.experiences || []).slice(0, 2).map((e) => `${e.position || "Role"} at ${e.company || "Company"}`).join("; ");
  const edu = (data.education || [])[0]?.degree || "";

  const prompt = `Craft a 3-4 sentence professional CV summary for:
Title/Role: ${jobTitle}
Key Skills: ${skillList || "Industry-standard skills"}
Recent Experience: ${topExp || "Proven background"}
Education: ${edu || "Relevant degree"}

Requirements:
- High impact, concise, and ATS-friendly.
- Highlight strengths in driving results and collaboration.
- Do NOT invent companies or statistics not mentioned.
- Return only the summary text.`;

  const systemInstruction = "You are a professional CV writing assistant. Return only the generated professional summary paragraph.";

  const llmResult = await callLLM(prompt, systemInstruction, { maxTokens: 300 });
  if (llmResult.success && llmResult.text) {
    return { success: true, text: llmResult.text, provider: llmResult.provider };
  }

  // Local fallback generator
  const skillsText = skillList ? ` Specialized in ${skillList}.` : "";
  const expText = topExp ? ` Demonstrated history of delivering impactful results, including experience as ${topExp}.` : "";
  const eduText = edu ? ` Holds a ${edu}.` : "";

  const generated = `Dedicated and results-driven ${jobTitle} with a solid foundation in professional excellence and execution.${skillsText}${expText}${eduText} Committed to delivering high-quality solutions and continuous professional advancement.`;

  return {
    success: true,
    text: generated,
    provider: "Smart Local ATS Engine",
  };
}

/**
 * Propose relevant industry-standard skills based on job title or existing skills.
 */
export async function suggestSkills(
  jobTitle: string,
  existingSkills: string[] = []
): Promise<{ success: boolean; skills: string[]; provider?: string }> {
  const title = jobTitle?.trim() || "Software Engineer";

  const prompt = `List 8 top in-demand professional and technical skills for the role: "${title}".
Existing skills to avoid repeating: ${existingSkills.join(", ")}.
Return ONLY a valid JSON array of strings, for example: ["Skill 1", "Skill 2", "Skill 3"].`;

  const systemInstruction = "You are a tech recruiter. Return ONLY a valid JSON array of skill strings.";

  const llmResult = await callLLM(prompt, systemInstruction, {
    jsonMode: true,
    maxTokens: 300,
  });

  if (llmResult.success && llmResult.text) {
    try {
      const parsed = JSON.parse(llmResult.text);
      const skillsArray = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.skills)
        ? parsed.skills
        : null;

      if (skillsArray && skillsArray.length > 0) {
        return {
          success: true,
          skills: skillsArray.map((s: unknown) => String(s).trim()).filter(Boolean),
          provider: llmResult.provider,
        };
      }
    } catch {
      // JSON parse failed, try local dictionary
    }
  }

  // Local curated industry skills dictionary
  const lowerTitle = title.toLowerCase();
  const skillBank: Record<string, string[]> = {
    developer: ["TypeScript", "React.js", "Node.js", "Git", "RESTful APIs", "SQL", "Docker", "Tailwind CSS"],
    frontend: ["React.js", "Next.js", "TypeScript", "Tailwind CSS", "HTML5/CSS3", "Redux", "Webpack", "Responsive Design"],
    backend: ["Node.js", "Python", "PostgreSQL", "REST APIs", "Microservices", "Docker", "Redis", "MongoDB"],
    fullstack: ["React.js", "Node.js", "TypeScript", "Next.js", "PostgreSQL", "Docker", "Git", "REST APIs"],
    data: ["Python", "SQL", "Pandas", "NumPy", "Data Visualization", "Machine Learning", "Tableau", "Power BI"],
    design: ["Figma", "UI/UX Design", "Wireframing", "Prototyping", "Adobe XD", "Design Systems", "User Research", "Adobe Photoshop"],
    manager: ["Agile/Scrum", "Project Management", "Team Leadership", "Stakeholder Communication", "Strategic Planning", "Budgeting", "Risk Management"],
    marketing: ["SEO", "Content Strategy", "Google Analytics", "Social Media Marketing", "Email Marketing", "Copywriting", "Campaign Management"],
  };

  let matchedSkills = skillBank.fullstack;
  for (const [key, list] of Object.entries(skillBank)) {
    if (lowerTitle.includes(key)) {
      matchedSkills = list;
      break;
    }
  }

  const existingSet = new Set(existingSkills.map((s) => s.toLowerCase()));
  const filtered = matchedSkills.filter((s) => !existingSet.has(s.toLowerCase()));

  return {
    success: true,
    skills: filtered.length > 0 ? filtered : ["Problem Solving", "Communication", "Teamwork", "Time Management", "Analytical Thinking"],
    provider: "Smart Local ATS Engine",
  };
}

export async function generateExperienceBullets(
  position?: string,
  company?: string
): Promise<AIResult> {
  const role = position?.trim() || "Software Developer";
  const comp = company?.trim() || "Company";

  const prompt = `Write 3 strong, professional resume bullet points for a "${role}" at "${comp}".
Use strong action verbs (e.g., Developed, Engineered, Spearheaded, Implemented, Optimized).
Focus on technical execution, team collaboration, and measurable business impact.
Do NOT invent fake dates or statistics. Return ONLY the 3 bullet points starting with •.`;

  const systemInstruction = "You are an executive CV writer. Return ONLY 3 professional resume bullet points starting with •.";

  const llmResult = await callLLM(prompt, systemInstruction, { maxTokens: 400 });
  if (llmResult.success && llmResult.text) {
    return { success: true, text: llmResult.text, provider: llmResult.provider };
  }

  // Smart local role-specific generator
  const lowerRole = role.toLowerCase();
  let bullets: string[];

  if (lowerRole.includes("developer") || lowerRole.includes("engineer") || lowerRole.includes("programmer") || lowerRole.includes("software")) {
    bullets = [
      `Engineered and maintained robust, scalable software features and user-facing modules at ${comp}.`,
      `Collaborated with cross-functional engineering teams to implement clean code, optimize performance, and conduct peer code reviews.`,
      `Resolved software bugs, streamlined continuous integration workflows, and improved application reliability and user experience.`,
    ];
  } else if (lowerRole.includes("design") || lowerRole.includes("ui") || lowerRole.includes("ux")) {
    bullets = [
      `Designed intuitive, user-centric interfaces, high-fidelity prototypes, and wireframes at ${comp}.`,
      `Collaborated closely with product managers and engineers to establish a cohesive design system and accessible UI components.`,
      `Conducted usability testing and transformed user insights into streamlined digital product experiences.`,
    ];
  } else if (lowerRole.includes("manager") || lowerRole.includes("lead") || lowerRole.includes("director")) {
    bullets = [
      `Directed project roadmaps, agile development cycles, and cross-team delivery milestones at ${comp}.`,
      `Mentored cross-functional team members, optimized sprint velocity, and fostered operational excellence.`,
      `Managed stakeholder communications, alignment on strategic goals, and high-impact project execution.`,
    ];
  } else {
    bullets = [
      `Executed daily operational tasks and high-priority deliverables with consistency and precision at ${comp}.`,
      `Collaborated cross-departmentally to optimize process workflows and achieve key business performance metrics.`,
      `Implemented strategic improvements to enhance service quality, team productivity, and operational effectiveness.`,
    ];
  }

  return {
    success: true,
    text: bullets.join("\n"),
    provider: "Smart Local ATS Engine",
  };
}

export async function generateProjectDescription(
  projectName?: string,
  technologies?: string
): Promise<AIResult> {
  const name = projectName?.trim() || "Project";
  const tech = technologies?.trim() || "Modern Technologies";

  const prompt = `Write a concise 2-3 sentence professional CV description for the project: "${name}" built with: "${tech}".
Detail the problem solved, implementation, and overall impact.
Return ONLY the description text.`;

  const systemInstruction = "You are a professional CV writing assistant. Return ONLY the concise project description.";

  const llmResult = await callLLM(prompt, systemInstruction, { maxTokens: 300 });
  if (llmResult.success && llmResult.text) {
    return { success: true, text: llmResult.text, provider: llmResult.provider };
  }

  const generated = `Architected and developed ${name} utilizing ${tech}, delivering an intuitive, high-performance user experience. Implemented robust feature workflows, optimized state management, and ensured clean, maintainable architecture.`;

  return {
    success: true,
    text: generated,
    provider: "Smart Local ATS Engine",
  };
}

export async function generateProfessionalSummary(content: string): Promise<AIResult> {
  return improveCVContent({ content, type: "summary" });
}

export async function improveExperience(content: string): Promise<AIResult> {
  return improveCVContent({ content, type: "experience" });
}

export async function improveProject(content: string): Promise<AIResult> {
  return improveCVContent({ content, type: "project" });
}

export async function improveSkills(content: string): Promise<AIResult> {
  return improveCVContent({ content, type: "skills" });
}