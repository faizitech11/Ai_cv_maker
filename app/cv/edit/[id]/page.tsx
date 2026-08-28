"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CVPreview from "@/app/components/CVPreview";

interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  summary?: string;
  jobTitle?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

interface Education {
  id?: string;
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Experience {
  id?: string;
  position: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

interface Skill {
  id?: string;
  name: string;
  level?: string;
}

interface Project {
  id?: string;
  name: string;
  description?: string;
  technologies?: string;
  projectUrl?: string;
  startDate?: string;
  endDate?: string;
}

interface Certification {
  id?: string;
  name: string;
  organization?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface Language {
  id?: string;
  name: string;
  proficiency?: string;
}

interface CVData {
  id: string;
  title: string;
  template: string;
  status: string;
  personalInfo?: PersonalInfo | null;
  education: Education[];
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
}

const emptyPersonalInfo: PersonalInfo = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  summary: "",
  jobTitle: "",
  linkedin: "",
  github: "",
  portfolio: "",
};

function generateUniqueId() {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function EditCVPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [cv, setCv] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("modern");

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(emptyPersonalInfo);
  const [education, setEducation] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);

  // AI loading state
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  // Fullscreen Preview Modal toggle
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  useEffect(() => {
    async function loadCV() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/cv/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load CV");
          return;
        }

        const loadedCV: CVData = data.cv;

        setCv(loadedCV);
        setTitle(loadedCV.title || "My CV");
        setTemplate(loadedCV.template || "modern");

        setPersonalInfo({
          ...emptyPersonalInfo,
          ...(loadedCV.personalInfo || {}),
        });

        setEducation(
          (loadedCV.education || []).map((item) => ({ ...item, id: item.id || generateUniqueId() }))
        );
        setExperiences(
          (loadedCV.experiences || []).map((item) => ({ ...item, id: item.id || generateUniqueId() }))
        );
        setSkills(
          (loadedCV.skills || []).map((item) => ({ ...item, id: item.id || generateUniqueId() }))
        );
        setProjects(
          (loadedCV.projects || []).map((item) => ({ ...item, id: item.id || generateUniqueId() }))
        );
        setCertifications(
          (loadedCV.certifications || []).map((item) => ({ ...item, id: item.id || generateUniqueId() }))
        );
        setLanguages(
          (loadedCV.languages || []).map((item) => ({ ...item, id: item.id || generateUniqueId() }))
        );
      } catch {
        setError("Something went wrong while loading the CV.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadCV();
    }
  }, [id]);

  async function handleSave(e?: FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();

    setSaving(true);
    setSuccess("");
    setError("");

    try {
      const response = await fetch(`/api/cv/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          template,
          status: "draft",
          personalInfo,
          education,
          experiences,
          skills,
          projects,
          certifications,
          languages,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to save CV");
        return;
      }

      setCv(data.cv);
      const savedTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastSavedAt(savedTime);
      setSuccess(`CV saved successfully in database at ${savedTime}!`);

      setTimeout(() => {
        setSuccess("");
      }, 5000);
    } catch {
      setError("Something went wrong while saving the CV.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownloadPDF() {
    setDownloadingPdf(true);
    setError("");

    try {
      const element = document.getElementById("cv-printable-area");
      if (!element) {
        setDownloadingPdf(false);
        return;
      }

      const { toJpeg } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const imgData = await toJpeg(element, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const elementWidth = element.offsetWidth || 800;
      const elementHeight = element.offsetHeight || 1130;
      const pdfHeight = (elementHeight * pdfWidth) / elementWidth;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

      const safeTitle = (title || "My_CV").trim().replace(/[^a-zA-Z0-9]/g, "_") || "My_CV";
      const cleanFileName = `${safeTitle}.pdf`;

      // Generate PDF Blob and trigger direct browser anchor file download
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);

      const downloadAnchor = document.createElement("a");
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = cleanFileName;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

      setSuccess(`PDF file "${cleanFileName}" downloaded directly to your Downloads folder!`);
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: unknown) {
      console.error("PDF Download error:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Failed to download PDF directly (${errorMessage}).`);
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleAIEnhance(
    content: string,
    type: "summary" | "experience" | "project" | "skills" | "general",
    onSuccess: (enhancedText: string) => void,
    loadingKey: string
  ) {
    if (!content.trim()) {
      setError("Please write some text first before clicking AI Enhance.");
      return;
    }

    try {
      setAiLoading(loadingKey);
      setError("");

      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, type }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to generate AI content.");
        return;
      }

      onSuccess(data.text);
      setSuccess("Content successfully enhanced with AI!");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Error connecting to AI service.");
    } finally {
      setAiLoading(null);
    }
  }

  function updatePersonalInfo(field: keyof PersonalInfo, value: string) {
    setPersonalInfo((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function addEducation() {
    setEducation((previous) => [
      ...previous,
      {
        id: generateUniqueId(),
        degree: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  }

  function updateEducation(index: number, field: keyof Education, value: string) {
    setEducation((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeEducation(index: number) {
    setEducation((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  }

  function addExperience() {
    setExperiences((previous) => [
      ...previous,
      {
        id: generateUniqueId(),
        position: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  }

  function updateExperience(index: number, field: keyof Experience, value: string) {
    setExperiences((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeExperience(index: number) {
    setExperiences((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  }

  function addSkill() {
    setSkills((previous) => [...previous, { id: generateUniqueId(), name: "", level: "" }]);
  }

  function updateSkill(index: number, field: keyof Skill, value: string) {
    setSkills((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeSkill(index: number) {
    setSkills((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  }

  function addProject() {
    setProjects((previous) => [
      ...previous,
      {
        id: generateUniqueId(),
        name: "",
        description: "",
        technologies: "",
        projectUrl: "",
        startDate: "",
        endDate: "",
      },
    ]);
  }

  function updateProject(index: number, field: keyof Project, value: string) {
    setProjects((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeProject(index: number) {
    setProjects((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  }

  function addCertification() {
    setCertifications((previous) => [
      ...previous,
      {
        id: generateUniqueId(),
        name: "",
        organization: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      },
    ]);
  }

  function updateCertification(index: number, field: keyof Certification, value: string) {
    setCertifications((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeCertification(index: number) {
    setCertifications((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  }

  function addLanguage() {
    setLanguages((previous) => [
      ...previous,
      { id: generateUniqueId(), name: "", proficiency: "" },
    ]);
  }

  function updateLanguage(index: number, field: keyof Language, value: string) {
    setLanguages((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function removeLanguage(index: number) {
    setLanguages((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  }

  function handlePrint() {
    const printElement = document.getElementById("cv-printable-area");
    if (!printElement) {
      window.print();
      return;
    }

    try {
      const printWindow = window.open("", "_blank", "width=950,height=1150");
      if (!printWindow) {
        window.print();
        return;
      }

      const styles = Array.from(
        document.querySelectorAll("style, link[rel='stylesheet']")
      )
        .map((node) => node.outerHTML)
        .join("\n");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>${title || "My CV"}</title>
            ${styles}
            <style>
              @page {
                size: A4 portrait;
                margin: 0;
              }
              body {
                background: #ffffff !important;
                color: #000000 !important;
                margin: 0 !important;
                padding: 0 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: Arial, Helvetica, sans-serif;
              }
              #cv-printable-area {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 12mm !important;
                box-shadow: none !important;
                border: none !important;
                background: #ffffff !important;
              }
            </style>
          </head>
          <body>
            <div id="cv-printable-area">
              ${printElement.innerHTML}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.focus();
                  window.print();
                  window.close();
                }, 300);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch {
      window.print();
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400 font-sans">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500" />
          <p>Loading your CV editor...</p>
        </div>
      </main>
    );
  }

  if (error && !cv) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100 px-6 font-sans">
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center max-w-md shadow-2xl">
          <p className="mb-6 text-red-400 font-medium">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-blue-500 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      {/* Glow Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 no-print">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 no-print">
        <div className="max-w-[1700px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center gap-2"
            >
              <span>← Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <h1 className="text-lg font-extrabold text-white truncate max-w-xs sm:max-w-md">
                {title || "Untitled CV"}
              </h1>
              {lastSavedAt && (
                <p className="text-[10px] text-slate-400">
                  Last saved: {lastSavedAt}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFullscreenPreview(true)}
              className="hidden sm:flex px-3 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold transition items-center gap-2"
            >
              <span>🔍 Fullscreen</span>
            </button>

            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 flex items-center gap-2"
            >
              {downloadingPdf ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <span>📥 Download PDF (.pdf)</span>
              )}
            </button>


            {/* Save Button */}
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>💾 Save CV</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Save Toast Banner */}
      <div className="relative z-10 max-w-[1700px] mx-auto px-6 pt-4 no-print">
        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/15 p-4 text-sm font-semibold text-emerald-300 flex items-center justify-between shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold">✓</span>
              <div>
                <p className="font-bold text-white">Success!</p>
                <p className="text-xs text-emerald-300/80">{success}</p>
              </div>
            </div>
            <button onClick={() => setSuccess("")} className="text-emerald-400 hover:text-white px-2 text-lg">✕</button>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/15 p-4 text-sm font-semibold text-red-300 flex items-center justify-between shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/20 text-red-400 font-bold">⚠️</span>
              <div>
                <p className="font-bold text-white">Notice</p>
                <p className="text-xs text-red-300/80">{error}</p>
              </div>
            </div>
            <button onClick={() => setError("")} className="text-red-400 hover:text-white px-2 text-lg">✕</button>
          </div>
        )}
      </div>

      {/* Main Form + Live Preview Layout Grid */}
      <main className="relative z-10 max-w-[1700px] mx-auto px-6 py-6">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Left Column: Editor Form */}
          <form onSubmit={handleSave} className="space-y-6 lg:col-span-6 xl:col-span-6 no-print">
            {/* Settings & Template Selector Card */}
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span>⚙️</span>
                <span>CV Settings & Template Selector</span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    CV Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="e.g. Senior Developer CV"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Choose Template Theme (8 Designs)
                  </label>
                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                  >
                    <option value="modern" className="bg-slate-900 text-white">Modern Accent (Indigo Banner)</option>
                    <option value="classic" className="bg-slate-900 text-white">Classic Serif (Traditional Corporate)</option>
                    <option value="professional" className="bg-slate-900 text-white">Professional (Left Border Accent)</option>
                    <option value="minimal" className="bg-slate-900 text-white">Minimal Clean (Generous Whitespace)</option>
                    <option value="executive" className="bg-slate-900 text-white">Executive (Navy & Amber Gold Bar)</option>
                    <option value="tech" className="bg-slate-900 text-white">Tech / Developer (Code Pills & Monospace)</option>
                    <option value="creative" className="bg-slate-900 text-white">Creative Split (Dark Left Sidebar)</option>
                    <option value="compact" className="bg-slate-900 text-white">Compact One-Page (Dense Grid)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Personal Info Card */}
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <span>👤</span>
                <span>Personal Information</span>
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["fullName", "Full Name", "John Doe"],
                    ["jobTitle", "Job Title", "Full Stack Developer"],
                    ["email", "Email", "john@example.com"],
                    ["phone", "Phone Number", "+1 234 567 890"],
                    ["address", "Address", "123 Main St"],
                    ["city", "City", "New York"],
                    ["country", "Country", "United States"],
                    ["linkedin", "LinkedIn URL", "linkedin.com/in/johndoe"],
                    ["github", "GitHub URL", "github.com/johndoe"],
                    ["portfolio", "Portfolio URL", "johndoe.dev"],
                  ] as [keyof PersonalInfo, string, string][]
                ).map(([field, label, placeholder]) => (
                  <div key={field}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                      {label}
                    </label>
                    <input
                      value={personalInfo[field] || ""}
                      onChange={(e) => updatePersonalInfo(field, e.target.value)}
                      placeholder={placeholder}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    />
                  </div>
                ))}

                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Professional Summary
                    </label>
                    <button
                      type="button"
                      disabled={aiLoading === "summary"}
                      onClick={() =>
                        handleAIEnhance(
                          personalInfo.summary || "",
                          "summary",
                          (enhanced) => updatePersonalInfo("summary", enhanced),
                          "summary"
                        )
                      }
                      className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {aiLoading === "summary" ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
                          <span>AI Improving...</span>
                        </>
                      ) : (
                        <span>✨ Enhance Summary with AI</span>
                      )}
                    </button>
                  </div>
                  <textarea
                    value={personalInfo.summary || ""}
                    onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                    rows={4}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition"
                    placeholder="Brief overview of your professional background, skills, and key achievements..."
                  />
                </div>
              </div>
            </section>

            {/* Experience Card */}
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>💼</span>
                  <span>Work Experience</span>
                </h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
                >
                  + Add Experience
                </button>
              </div>

              <div className="space-y-6">
                {experiences.map((item, index) => (
                  <div key={item.id || `exp-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Experience #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExperience(index)}
                        className="text-xs font-semibold text-red-400 hover:bg-red-500/10 px-3 py-1 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        value={item.position}
                        onChange={(e) => updateExperience(index, "position", e.target.value)}
                        placeholder="Job Position (e.g. Senior Frontend Engineer)"
                        className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                      />
                      <input
                        value={item.company}
                        onChange={(e) => updateExperience(index, "company", e.target.value)}
                        placeholder="Company Name (e.g. Acme Corp)"
                        className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                      />
                      <input
                        value={item.location || ""}
                        onChange={(e) => updateExperience(index, "location", e.target.value)}
                        placeholder="Location (e.g. Remote / New York)"
                        className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={item.startDate || ""}
                          onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                          placeholder="Start (e.g. Jan 2021)"
                          className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                        />
                        <input
                          value={item.endDate || ""}
                          onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                          placeholder="End (e.g. Present)"
                          className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Description & Achievements
                          </label>
                          <button
                            type="button"
                            disabled={aiLoading === `exp-${index}`}
                            onClick={() =>
                              handleAIEnhance(
                                item.description || "",
                                "experience",
                                (enhanced) => updateExperience(index, "description", enhanced),
                                `exp-${index}`
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition flex items-center gap-1 disabled:opacity-50"
                          >
                            {aiLoading === `exp-${index}` ? (
                              <span>AI Enhancing...</span>
                            ) : (
                              <span>✨ AI Enhance</span>
                            )}
                          </button>
                        </div>
                        <textarea
                          value={item.description || ""}
                          onChange={(e) => updateExperience(index, "description", e.target.value)}
                          rows={3}
                          placeholder="Key responsibilities, achievements, and impact..."
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Education Card */}
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🎓</span>
                  <span>Education</span>
                </h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
                >
                  + Add Education
                </button>
              </div>

              <div className="space-y-6">
                {education.map((item, index) => (
                  <div key={item.id || `edu-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Education #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-xs font-semibold text-red-400 hover:bg-red-500/10 px-3 py-1 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        value={item.degree}
                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                        placeholder="Degree (e.g. B.S. Computer Science)"
                        className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                      />
                      <input
                        value={item.institution}
                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                        placeholder="University / School Name"
                        className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                      />
                      <input
                        value={item.location || ""}
                        onChange={(e) => updateEducation(index, "location", e.target.value)}
                        placeholder="Location (e.g. Boston, MA)"
                        className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={item.startDate || ""}
                          onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                          placeholder="Start (e.g. 2018)"
                          className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                        />
                        <input
                          value={item.endDate || ""}
                          onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                          placeholder="End (e.g. 2022)"
                          className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Skills Card */}
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>⚡</span>
                  <span>Skills</span>
                </h2>
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
                >
                  + Add Skill
                </button>
              </div>

              <div className="space-y-3">
                {skills.map((item, index) => (
                  <div
                    key={item.id || `skill-${index}`}
                    className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl"
                  >
                    <input
                      value={item.name}
                      onChange={(e) => updateSkill(index, "name", e.target.value)}
                      placeholder="Skill Name (e.g. React.js, Python)"
                      className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                    <input
                      value={item.level || ""}
                      onChange={(e) => updateSkill(index, "level", e.target.value)}
                      placeholder="Proficiency Level (e.g. Advanced)"
                      className="sm:w-48 rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="shrink-0 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects Card */}
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🚀</span>
                  <span>Projects</span>
                </h2>
                <button
                  type="button"
                  onClick={addProject}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
                >
                  + Add Project
                </button>
              </div>

              <div className="space-y-6">
                {projects.map((item, index) => (
                  <div key={item.id || `proj-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        Project #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className="text-xs font-semibold text-red-400 hover:bg-red-500/10 px-3 py-1 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <input
                        value={item.name}
                        onChange={(e) => updateProject(index, "name", e.target.value)}
                        placeholder="Project Title"
                        className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                      />
                      <input
                        value={item.technologies || ""}
                        onChange={(e) => updateProject(index, "technologies", e.target.value)}
                        placeholder="Tech Stack (e.g. Next.js, TypeScript, Tailwind)"
                        className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                      />
                      <input
                        value={item.projectUrl || ""}
                        onChange={(e) => updateProject(index, "projectUrl", e.target.value)}
                        placeholder="Live URL / GitHub repository"
                        className="sm:col-span-2 rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                      />
                      <div className="sm:col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Project Description
                          </label>
                          <button
                            type="button"
                            disabled={aiLoading === `proj-${index}`}
                            onClick={() =>
                              handleAIEnhance(
                                item.description || "",
                                "project",
                                (enhanced) => updateProject(index, "description", enhanced),
                                `proj-${index}`
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition flex items-center gap-1 disabled:opacity-50"
                          >
                            {aiLoading === `proj-${index}` ? (
                              <span>AI Enhancing...</span>
                            ) : (
                              <span>✨ AI Enhance</span>
                            )}
                          </button>
                        </div>
                        <textarea
                          value={item.description || ""}
                          onChange={(e) => updateProject(index, "description", e.target.value)}
                          rows={3}
                          placeholder="What did you build and what was its impact?"
                          className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-3 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Certifications Card */}
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🏆</span>
                  <span>Certifications</span>
                </h2>
                <button
                  type="button"
                  onClick={addCertification}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
                >
                  + Add Certification
                </button>
              </div>

              <div className="space-y-4">
                {certifications.map((item, index) => (
                  <div key={item.id || `cert-${index}`} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 grid gap-3 sm:grid-cols-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateCertification(index, "name", e.target.value)}
                      placeholder="Certification Name"
                      className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                    <input
                      value={item.organization || ""}
                      onChange={(e) => updateCertification(index, "organization", e.target.value)}
                      placeholder="Issuing Organization (e.g. AWS)"
                      className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                    <input
                      value={item.issueDate || ""}
                      onChange={(e) => updateCertification(index, "issueDate", e.target.value)}
                      placeholder="Issue Date"
                      className="rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                    <div className="flex justify-end items-center">
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-xs font-semibold text-red-400 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Languages Card */}
            <section className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>🌐</span>
                  <span>Languages</span>
                </h2>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition"
                >
                  + Add Language
                </button>
              </div>

              <div className="space-y-3">
                {languages.map((item, index) => (
                  <div
                    key={item.id || `lang-${index}`}
                    className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl"
                  >
                    <input
                      value={item.name}
                      onChange={(e) => updateLanguage(index, "name", e.target.value)}
                      placeholder="Language (e.g. English, Urdu)"
                      className="flex-1 rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                    <input
                      value={item.proficiency || ""}
                      onChange={(e) => updateLanguage(index, "proficiency", e.target.value)}
                      placeholder="Proficiency (e.g. Native / Fluent)"
                      className="sm:w-48 rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="shrink-0 px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-4 font-bold text-base shadow-xl shadow-indigo-600/30 transition hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving Changes to Database...</span>
                </>
              ) : (
                <span>💾 Save CV Changes</span>
              )}
            </button>
          </form>

          {/* Right Column: Sticky Live Preview Pane */}
          <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between px-2 no-print">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Live Preview ({template})
                </span>
              </div>
            </div>

            {/* Preview Box Container */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl shadow-2xl overflow-auto max-h-[calc(100vh-8rem)]">
              <CVPreview
                cv={{
                  title,
                  template,
                  personalInfo,
                  education,
                  experiences,
                  skills,
                  projects,
                  certifications,
                  languages,
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Preview Modal */}
      {isFullscreenPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/90 backdrop-blur-xl p-4 sm:p-8 overflow-y-auto no-print">
          <div className="max-w-[900px] w-full mx-auto flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-white">Full A4 Document Preview ({template})</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPdf}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition"
              >
                {downloadingPdf ? "Generating PDF..." : "📥 Download PDF File"}
              </button>

              <button
                onClick={() => setIsFullscreenPreview(false)}
                className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 hover:text-white font-semibold text-xs transition"
              >
                Close ✕
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center pb-12">
            <div className="w-full max-w-[800px] bg-white rounded-md shadow-2xl p-2">
              <CVPreview
                cv={{
                  title,
                  template,
                  personalInfo,
                  education,
                  experiences,
                  skills,
                  projects,
                  certifications,
                  languages,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}