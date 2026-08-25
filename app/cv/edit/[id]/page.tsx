"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

export default function EditCVPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [cv, setCv] = useState<CVData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [template, setTemplate] = useState("modern");

  const [personalInfo, setPersonalInfo] =
    useState<PersonalInfo>(emptyPersonalInfo);

  const [education, setEducation] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>(
    []
  );
  const [languages, setLanguages] = useState<Language[]>([]);

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

        setEducation(loadedCV.education || []);
        setExperiences(loadedCV.experiences || []);
        setSkills(loadedCV.skills || []);
        setProjects(loadedCV.projects || []);
        setCertifications(loadedCV.certifications || []);
        setLanguages(loadedCV.languages || []);
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

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

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
      setSuccess("CV saved successfully.");

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch {
      setError("Something went wrong while saving the CV.");
    } finally {
      setSaving(false);
    }
  }

  function updatePersonalInfo(
    field: keyof PersonalInfo,
    value: string
  ) {
    setPersonalInfo((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function addEducation() {
    setEducation((previous) => [
      ...previous,
      {
        degree: "",
        institution: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  }

  function updateEducation(
    index: number,
    field: keyof Education,
    value: string
  ) {
    setEducation((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function removeEducation(index: number) {
    setEducation((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addExperience() {
    setExperiences((previous) => [
      ...previous,
      {
        position: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  }

  function updateExperience(
    index: number,
    field: keyof Experience,
    value: string
  ) {
    setExperiences((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function removeExperience(index: number) {
    setExperiences((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addSkill() {
    setSkills((previous) => [
      ...previous,
      {
        name: "",
        level: "",
      },
    ]);
  }

  function updateSkill(
    index: number,
    field: keyof Skill,
    value: string
  ) {
    setSkills((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function removeSkill(index: number) {
    setSkills((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addProject() {
    setProjects((previous) => [
      ...previous,
      {
        name: "",
        description: "",
        technologies: "",
        projectUrl: "",
        startDate: "",
        endDate: "",
      },
    ]);
  }

  function updateProject(
    index: number,
    field: keyof Project,
    value: string
  ) {
    setProjects((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function removeProject(index: number) {
    setProjects((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addCertification() {
    setCertifications((previous) => [
      ...previous,
      {
        name: "",
        organization: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      },
    ]);
  }

  function updateCertification(
    index: number,
    field: keyof Certification,
    value: string
  ) {
    setCertifications((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function removeCertification(index: number) {
    setCertifications((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  function addLanguage() {
    setLanguages((previous) => [
      ...previous,
      {
        name: "",
        proficiency: "",
      },
    ]);
  }

  function updateLanguage(
    index: number,
    field: keyof Language,
    value: string
  ) {
    setLanguages((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function removeLanguage(index: number) {
    setLanguages((previous) =>
      previous.filter((_, itemIndex) => itemIndex !== index)
    );
  }

  const PreviewSectionTitle = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <h3 className="mb-3 border-b border-gray-300 pb-1 text-sm font-bold uppercase tracking-wider text-gray-800">
      {children}
    </h3>
  );

  function CVPreview() {
    const isClassic = template === "classic";
    const isProfessional = template === "professional";
    const isMinimal = template === "minimal";

    return (
      <div
        className={`mx-auto min-h-[1100px] w-full max-w-[794px] bg-white p-8 text-gray-800 shadow-xl sm:p-10 ${
          isClassic
            ? "font-serif"
            : isProfessional
            ? "font-sans"
            : "font-sans"
        }`}
      >
        {isClassic ? (
          <div className="border-b-2 border-gray-800 pb-5 text-center">
            <h1 className="text-3xl font-bold">
              {personalInfo.fullName || "Your Name"}
            </h1>

            <p className="mt-2 text-lg">
              {personalInfo.jobTitle || "Professional"}
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.city && <span>{personalInfo.city}</span>}
              {personalInfo.linkedin && (
                <span>{personalInfo.linkedin}</span>
              )}
              {personalInfo.github && (
                <span>{personalInfo.github}</span>
              )}
            </div>
          </div>
        ) : isProfessional ? (
          <div className="border-l-8 border-blue-700 pl-5">
            <h1 className="text-4xl font-extrabold text-blue-800">
              {personalInfo.fullName || "Your Name"}
            </h1>

            <p className="mt-1 text-xl font-semibold text-gray-600">
              {personalInfo.jobTitle || "Professional"}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.city && <span>{personalInfo.city}</span>}
              {personalInfo.country && (
                <span>{personalInfo.country}</span>
              )}
            </div>
          </div>
        ) : isMinimal ? (
          <div className="pb-5">
            <h1 className="text-4xl font-light">
              {personalInfo.fullName || "Your Name"}
            </h1>

            <p className="mt-2 text-lg text-gray-500">
              {personalInfo.jobTitle || "Professional"}
            </p>

            <div className="mt-3 text-xs text-gray-500">
              {[personalInfo.email, personalInfo.phone, personalInfo.city]
                .filter(Boolean)
                .join(" • ")}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-blue-700 p-6 text-white">
            <h1 className="text-3xl font-bold">
              {personalInfo.fullName || "Your Name"}
            </h1>

            <p className="mt-1 text-lg text-blue-100">
              {personalInfo.jobTitle || "Professional"}
            </p>

            <div className="mt-3 flex flex-wrap gap-3 text-xs text-blue-100">
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {personalInfo.city && <span>{personalInfo.city}</span>}
              {personalInfo.country && (
                <span>{personalInfo.country}</span>
              )}
            </div>
          </div>
        )}

        <div className="mt-7 space-y-6">
          {personalInfo.summary && (
            <section>
              <PreviewSectionTitle>Professional Summary</PreviewSectionTitle>

              <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                {personalInfo.summary}
              </p>
            </section>
          )}

          {experiences.length > 0 && (
            <section>
              <PreviewSectionTitle>Experience</PreviewSectionTitle>

              <div className="space-y-5">
                {experiences.map((item, index) => (
                  <div key={item.id || index}>
                    <div className="flex flex-col justify-between sm:flex-row">
                      <div>
                        <h4 className="font-bold">
                          {item.position || "Position"}
                        </h4>

                        <p className="text-sm font-medium text-gray-600">
                          {item.company || "Company"}
                          {item.location
                            ? ` • ${item.location}`
                            : ""}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        {item.startDate || ""}
                        {item.startDate || item.endDate ? " - " : ""}
                        {item.endDate || ""}
                      </p>
                    </div>

                    {item.description && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-5 text-gray-700">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <PreviewSectionTitle>Education</PreviewSectionTitle>

              <div className="space-y-4">
                {education.map((item, index) => (
                  <div key={item.id || index}>
                    <div className="flex flex-col justify-between sm:flex-row">
                      <div>
                        <h4 className="font-bold">
                          {item.degree || "Degree"}
                        </h4>

                        <p className="text-sm text-gray-600">
                          {item.institution || "Institution"}
                          {item.location
                            ? ` • ${item.location}`
                            : ""}
                        </p>
                      </div>

                      <p className="text-xs text-gray-500">
                        {item.startDate || ""}
                        {item.startDate || item.endDate ? " - " : ""}
                        {item.endDate || ""}
                      </p>
                    </div>

                    {item.description && (
                      <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <PreviewSectionTitle>Skills</PreviewSectionTitle>

              <div className="flex flex-wrap gap-2">
                {skills
                  .filter((item) => item.name)
                  .map((item, index) => (
                    <span
                      key={item.id || index}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs"
                    >
                      {item.name}
                      {item.level ? ` — ${item.level}` : ""}
                    </span>
                  ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <PreviewSectionTitle>Projects</PreviewSectionTitle>

              <div className="space-y-4">
                {projects.map((item, index) => (
                  <div key={item.id || index}>
                    <h4 className="font-bold">
                      {item.name || "Project"}
                    </h4>

                    {item.technologies && (
                      <p className="text-xs font-medium text-gray-500">
                        Technologies: {item.technologies}
                      </p>
                    )}

                    {item.description && (
                      <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                        {item.description}
                      </p>
                    )}

                    {item.projectUrl && (
                      <p className="mt-1 text-xs text-blue-700">
                        {item.projectUrl}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <PreviewSectionTitle>Certifications</PreviewSectionTitle>

              <div className="space-y-3">
                {certifications.map((item, index) => (
                  <div key={item.id || index}>
                    <h4 className="font-bold">
                      {item.name || "Certification"}
                    </h4>

                    <p className="text-sm text-gray-600">
                      {item.organization || ""}
                      {item.issueDate
                        ? ` • ${item.issueDate}`
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {languages.length > 0 && (
            <section>
              <PreviewSectionTitle>Languages</PreviewSectionTitle>

              <div className="grid grid-cols-2 gap-2">
                {languages
                  .filter((item) => item.name)
                  .map((item, index) => (
                    <div
                      key={item.id || index}
                      className="text-sm"
                    >
                      <span className="font-semibold">
                        {item.name}
                      </span>

                      {item.proficiency && (
                        <span className="text-gray-500">
                          {" "}
                          — {item.proficiency}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-gray-600">Loading CV...</p>
        </div>
      </main>
    );
  }

  if (error && !cv) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="mb-4 text-red-600">{error}</p>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-black px-5 py-3 text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit CV
            </h1>

            <p className="mt-2 text-gray-600">
              Edit your information and see the CV preview instantly.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            ← Back to Dashboard
          </button>
        </div>

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        <div className="grid items-start gap-8 xl:grid-cols-[560px_minmax(0,1fr)]">
          <form onSubmit={handleSave} className="space-y-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold">
                CV Settings
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    CV Title
                  </label>

                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="My CV"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Template
                  </label>

                  <select
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="modern">Modern</option>
                    <option value="classic">Classic</option>
                    <option value="professional">
                      Professional
                    </option>
                    <option value="minimal">Minimal</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-semibold">
                Personal Information
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                {(
                  [
                    ["fullName", "Full Name"],
                    ["jobTitle", "Job Title"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["address", "Address"],
                    ["city", "City"],
                    ["country", "Country"],
                    ["linkedin", "LinkedIn"],
                    ["github", "GitHub"],
                    ["portfolio", "Portfolio"],
                  ] as [keyof PersonalInfo, string][]
                ).map(([field, label]) => (
                  <div key={field}>
                    <label className="mb-2 block text-sm font-medium">
                      {label}
                    </label>

                    <input
                      value={personalInfo[field] || ""}
                      onChange={(e) =>
                        updatePersonalInfo(
                          field,
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    />
                  </div>
                ))}

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Professional Summary
                  </label>

                  <textarea
                    value={personalInfo.summary || ""}
                    onChange={(e) =>
                      updatePersonalInfo(
                        "summary",
                        e.target.value
                      )
                    }
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="Write a short professional summary..."
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Education
                </h2>

                <button
                  type="button"
                  onClick={addEducation}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-5">
                {education.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="mb-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeEducation(index)
                        }
                        className="text-sm font-medium text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={item.degree}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "degree",
                            e.target.value
                          )
                        }
                        placeholder="Degree"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.institution}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "institution",
                            e.target.value
                          )
                        }
                        placeholder="Institution"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.location || ""}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="Location"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.startDate || ""}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                        placeholder="Start Date"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.endDate || ""}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "endDate",
                            e.target.value
                          )
                        }
                        placeholder="End Date"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <textarea
                        value={item.description || ""}
                        onChange={(e) =>
                          updateEducation(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Description"
                        className="rounded-lg border border-gray-300 px-4 py-3 md:col-span-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Experience
                </h2>

                <button
                  type="button"
                  onClick={addExperience}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-5">
                {experiences.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="mb-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeExperience(index)
                        }
                        className="text-sm font-medium text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={item.position}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "position",
                            e.target.value
                          )
                        }
                        placeholder="Position"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.company}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "company",
                            e.target.value
                          )
                        }
                        placeholder="Company"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.location || ""}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "location",
                            e.target.value
                          )
                        }
                        placeholder="Location"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.startDate || ""}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "startDate",
                            e.target.value
                          )
                        }
                        placeholder="Start Date"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.endDate || ""}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "endDate",
                            e.target.value
                          )
                        }
                        placeholder="End Date"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <textarea
                        value={item.description || ""}
                        onChange={(e) =>
                          updateExperience(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Description"
                        className="rounded-lg border border-gray-300 px-4 py-3 md:col-span-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Skills
                </h2>

                <button
                  type="button"
                  onClick={addSkill}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-3">
                {skills.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <input
                      value={item.name}
                      onChange={(e) =>
                        updateSkill(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Skill"
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
                    />

                    <input
                      value={item.level || ""}
                      onChange={(e) =>
                        updateSkill(
                          index,
                          "level",
                          e.target.value
                        )
                      }
                      placeholder="Level"
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
                    />

                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="rounded-lg border border-red-200 px-4 py-3 text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Projects
                </h2>

                <button
                  type="button"
                  onClick={addProject}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-5">
                {projects.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="mb-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeProject(index)
                        }
                        className="text-sm font-medium text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={item.name}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Project Name"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.technologies || ""}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "technologies",
                            e.target.value
                          )
                        }
                        placeholder="Technologies"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.projectUrl || ""}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "projectUrl",
                            e.target.value
                          )
                        }
                        placeholder="Project URL"
                        className="rounded-lg border border-gray-300 px-4 py-3 md:col-span-2"
                      />

                      <textarea
                        value={item.description || ""}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Project Description"
                        className="rounded-lg border border-gray-300 px-4 py-3 md:col-span-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Certifications
                </h2>

                <button
                  type="button"
                  onClick={addCertification}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-5">
                {certifications.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="mb-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeCertification(index)
                        }
                        className="text-sm font-medium text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <input
                        value={item.name}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="Certification Name"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.organization || ""}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "organization",
                            e.target.value
                          )
                        }
                        placeholder="Organization"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.issueDate || ""}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "issueDate",
                            e.target.value
                          )
                        }
                        placeholder="Issue Date"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.expiryDate || ""}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "expiryDate",
                            e.target.value
                          )
                        }
                        placeholder="Expiry Date"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.credentialId || ""}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "credentialId",
                            e.target.value
                          )
                        }
                        placeholder="Credential ID"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />

                      <input
                        value={item.credentialUrl || ""}
                        onChange={(e) =>
                          updateCertification(
                            index,
                            "credentialUrl",
                            e.target.value
                          )
                        }
                        placeholder="Credential URL"
                        className="rounded-lg border border-gray-300 px-4 py-3"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Languages
                </h2>

                <button
                  type="button"
                  onClick={addLanguage}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white"
                >
                  + Add
                </button>
              </div>

              <div className="space-y-3">
                {languages.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <input
                      value={item.name}
                      onChange={(e) =>
                        updateLanguage(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      placeholder="Language"
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
                    />

                    <input
                      value={item.proficiency || ""}
                      onChange={(e) =>
                        updateLanguage(
                          index,
                          "proficiency",
                          e.target.value
                        )
                      }
                      placeholder="Proficiency"
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeLanguage(index)
                      }
                      className="rounded-lg border border-red-200 px-4 py-3 text-red-600"
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
              className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white shadow-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving CV..." : "Save CV"}
            </button>
          </form>

          <div className="xl:sticky xl:top-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  CV Preview
                </h2>

                <p className="text-sm text-gray-500">
                  Template:{" "}
                  <span className="font-semibold capitalize">
                    {template}
                  </span>
                </p>
              </div>
            </div>

            <div className="overflow-auto rounded-2xl bg-gray-300 p-4 shadow-inner">
              <CVPreview />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}