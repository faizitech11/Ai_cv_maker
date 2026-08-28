"use client";

interface PersonalInfo {
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  summary?: string | null;
  jobTitle?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
}

interface Education {
  id?: string;
  degree?: string | null;
  institution?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

interface Experience {
  id?: string;
  position?: string | null;
  company?: string | null;
  location?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

interface Skill {
  id?: string;
  name?: string | null;
  level?: string | null;
}

interface Project {
  id?: string;
  name?: string | null;
  description?: string | null;
  technologies?: string | null;
  projectUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

interface Certification {
  id?: string;
  name?: string | null;
  organization?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  credentialId?: string | null;
  credentialUrl?: string | null;
}

interface Language {
  id?: string;
  name?: string | null;
  proficiency?: string | null;
}

export interface CVPreviewData {
  title?: string;
  template?: string;
  personalInfo?: PersonalInfo | null;
  education?: Education[];
  experiences?: Experience[];
  skills?: Skill[];
  projects?: Project[];
  certifications?: Certification[];
  languages?: Language[];
}

interface CVPreviewProps {
  cv: CVPreviewData;
}

const value = (text?: string | null) => text?.trim() || "";

export default function CVPreview({ cv }: CVPreviewProps) {
  const personal = cv.personalInfo;
  const education = cv.education || [];
  const experiences = cv.experiences || [];
  const skills = cv.skills || [];
  const projects = cv.projects || [];
  const certifications = cv.certifications || [];
  const languages = cv.languages || [];

  const template = cv.template || "modern";

  const fullName = value(personal?.fullName) || "Your Full Name";
  const jobTitle = value(personal?.jobTitle) || "Professional Title";
  const summary = value(personal?.summary);

  const contactItems = [
    value(personal?.email),
    value(personal?.phone),
    value(personal?.city) ? `${value(personal?.city)}${value(personal?.country) ? `, ${value(personal?.country)}` : ""}` : value(personal?.country),
    value(personal?.address),
  ].filter(Boolean);

  const socialItems = [
    personal?.linkedin ? { label: "LinkedIn", url: personal.linkedin } : null,
    personal?.github ? { label: "GitHub", url: personal.github } : null,
    personal?.portfolio ? { label: "Portfolio", url: personal.portfolio } : null,
  ].filter(Boolean) as { label: string; url: string }[];

  // ==========================================
  // TEMPLATE 7: CREATIVE (2-COLUMN SPLIT SIDEBAR)
  // ==========================================
  if (template === "creative") {
    return (
      <div
        id="cv-printable-area"
        className="mx-auto min-h-[1050px] w-full max-w-[794px] bg-white text-slate-900 shadow-xl rounded-sm font-sans flex flex-col sm:flex-row overflow-hidden border border-slate-200"
      >
        {/* Left Dark Sidebar */}
        <aside className="w-full sm:w-[250px] shrink-0 bg-slate-900 text-white p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center font-bold text-2xl text-white shadow-lg mb-3">
                {fullName.charAt(0)}
              </div>
              <h1 className="text-xl font-bold leading-tight text-white">{fullName}</h1>
              <p className="text-xs font-semibold text-indigo-300 mt-1">{jobTitle}</p>
            </div>

            {/* Contact */}
            {contactItems.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact</h3>
                {contactItems.map((item, idx) => (
                  <p key={idx} className="text-xs text-slate-300 break-words">{item}</p>
                ))}
                {socialItems.map((item, idx) => (
                  <p key={idx} className="text-xs text-indigo-400 truncate">{item.url}</p>
                ))}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {skills.map((s, idx) => (
                    <span key={s.id || idx} className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 text-[11px] font-medium border border-slate-700">
                      {value(s.name)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Languages</h3>
                <div className="space-y-1 text-xs">
                  {languages.map((l, idx) => (
                    <div key={l.id || idx} className="flex justify-between text-slate-300">
                      <span>{value(l.name)}</span>
                      {l.proficiency && <span className="text-slate-500 text-[10px]">{l.proficiency}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-800 pt-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Certifications</h3>
                <div className="space-y-2 text-xs">
                  {certifications.map((c, idx) => (
                    <div key={c.id || idx}>
                      <p className="font-semibold text-slate-200">{value(c.name)}</p>
                      <p className="text-[10px] text-slate-400">{value(c.organization)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 p-6 sm:p-8 space-y-5">
          {summary && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-100 pb-1 mb-2">Profile</h2>
              <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{summary}</p>
            </section>
          )}

          {experiences.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-100 pb-1 mb-3">Work Experience</h2>
              <div className="space-y-4">
                {experiences.map((exp, idx) => (
                  <div key={exp.id || idx}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-xs text-slate-900">{value(exp.position)}</h3>
                      <span className="text-[10px] text-slate-500">{value(exp.startDate)} - {value(exp.endDate) || "Present"}</span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600">{value(exp.company)} {exp.location ? `• ${exp.location}` : ""}</p>
                    {exp.description && <p className="mt-1 text-xs text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-100 pb-1 mb-3">Education</h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={edu.id || idx}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-bold text-xs text-slate-900">{value(edu.degree)}</h3>
                      <span className="text-[10px] text-slate-500">{value(edu.startDate)} - {value(edu.endDate)}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600">{value(edu.institution)} {edu.location ? `• ${edu.location}` : ""}</p>
                    {edu.description && <p className="mt-1 text-xs text-slate-600">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 border-b-2 border-indigo-100 pb-1 mb-3">Key Projects</h2>
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={proj.id || idx}>
                    <h3 className="font-bold text-xs text-slate-900">{value(proj.name)}</h3>
                    {proj.technologies && <p className="text-[11px] font-medium text-slate-500">Tech: {proj.technologies}</p>}
                    {proj.description && <p className="mt-1 text-xs text-slate-700">{proj.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    );
  }

  // ==========================================
  // TEMPLATES 1-6 & 8 (FULL STANDALONE LAYOUTS)
  // ==========================================
  return (
    <div
      id="cv-printable-area"
      className={`mx-auto min-h-[1050px] w-full max-w-[794px] bg-white text-slate-900 shadow-xl rounded-sm p-6 sm:p-10 border border-slate-200 ${
        template === "classic"
          ? "font-serif"
          : template === "tech"
          ? "font-mono"
          : "font-sans"
      }`}
    >
      {/* ----------------- HEADER STYLES ----------------- */}
      {template === "executive" ? (
        <header className="rounded-xl bg-slate-950 p-6 text-white mb-6 border-b-4 border-amber-400 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">{fullName}</h1>
            <p className="text-base font-semibold text-amber-400 mt-1">{jobTitle}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
              {contactItems.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded bg-amber-400/20 text-amber-300 font-bold text-xs uppercase border border-amber-400/30">
            Executive Profile
          </span>
        </header>
      ) : template === "tech" ? (
        <header className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs mb-1">
            <span>&gt; Developer_Resume.json</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900">{fullName}</h1>
          <p className="text-base font-bold text-cyan-700 mt-0.5">&lt;{jobTitle} /&gt;</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
            {contactItems.map((c, i) => <span key={i} className="bg-slate-100 px-2 py-0.5 rounded">{c}</span>)}
            {socialItems.map((s, i) => <span key={i} className="bg-cyan-50 text-cyan-800 px-2 py-0.5 rounded">{s.url}</span>)}
          </div>
        </header>
      ) : template === "classic" ? (
        <header className="border-b-2 border-slate-800 pb-5 mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight uppercase text-slate-900">{fullName}</h1>
          <p className="text-base italic text-slate-700 mt-1">{jobTitle}</p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
            {contactItems.map((c, i) => <span key={i}>{c}</span>)}
            {socialItems.map((s, i) => <span key={i}>{s.url}</span>)}
          </div>
        </header>
      ) : template === "professional" ? (
        <header className="border-l-8 border-slate-900 pl-5 py-1 mb-6">
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">{fullName}</h1>
          <p className="text-base font-bold text-slate-700 mt-1">{jobTitle}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
            {contactItems.map((c, i) => <span key={i}>{c}</span>)}
            {socialItems.map((s, i) => <span key={i}>{s.url}</span>)}
          </div>
        </header>
      ) : template === "minimal" ? (
        <header className="border-b border-slate-200 pb-5 mb-6">
          <h1 className="text-3xl font-light text-slate-900 tracking-wide">{fullName}</h1>
          <p className="text-base text-slate-500 font-normal mt-1">{jobTitle}</p>
          <div className="mt-2 text-xs text-slate-500">
            {[...contactItems, ...socialItems.map(s => s.url)].join("  •  ")}
          </div>
        </header>
      ) : template === "compact" ? (
        <header className="border-b border-slate-800 pb-3 mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">{fullName}</h1>
            <p className="text-xs font-bold text-slate-700">{jobTitle}</p>
          </div>
          <div className="text-right text-[11px] text-slate-600 space-y-0.5">
            <p>{contactItems.join(" | ")}</p>
            {socialItems.length > 0 && <p>{socialItems.map(s => s.url).join(" | ")}</p>}
          </div>
        </header>
      ) : (
        /* Modern Header */
        <header className="rounded-2xl bg-gradient-to-r from-indigo-700 to-blue-700 p-6 text-white shadow-md mb-6">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{fullName}</h1>
          <p className="text-base font-semibold text-indigo-100 mt-1">{jobTitle}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-indigo-100/90 font-medium">
            {contactItems.map((c, i) => <span key={i}>{c}</span>)}
            {socialItems.map((s, i) => <span key={i}>{s.url}</span>)}
          </div>
        </header>
      )}

      {/* ----------------- SECTION HEADING RENDERER ----------------- */}
      {(() => {
        const renderTitle = (text: string) => {
          if (template === "executive") {
            return (
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-100 border-l-4 border-slate-900 px-3 py-1">
                {text}
              </h2>
            );
          }
          if (template === "tech") {
            return (
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-800 border-b border-cyan-200 pb-1">
                // {text}
              </h2>
            );
          }
          if (template === "classic") {
            return (
              <h2 className="mb-3 border-b border-slate-400 pb-1 text-xs font-bold uppercase tracking-widest text-slate-800">
                {text}
              </h2>
            );
          }
          if (template === "professional") {
            return (
              <h2 className="mb-3 border-l-4 border-slate-900 pl-3 text-xs font-extrabold uppercase tracking-wide text-slate-900">
                {text}
              </h2>
            );
          }
          if (template === "minimal") {
            return (
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                {text}
              </h2>
            );
          }
          if (template === "compact") {
            return (
              <h2 className="mb-2 border-b-2 border-slate-800 pb-0.5 text-[11px] font-black uppercase tracking-wider text-slate-900">
                {text}
              </h2>
            );
          }
          return (
            <h2 className="mb-3 border-b-2 border-indigo-600 pb-1 text-xs font-extrabold uppercase tracking-wider text-indigo-700">
              {text}
            </h2>
          );
        };

        return (
          <div className="space-y-5">
            {/* Summary */}
            {summary && (
              <section>
                {renderTitle("Professional Summary")}
                <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-line">{summary}</p>
              </section>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
              <section>
                {renderTitle("Work Experience")}
                <div className="space-y-4">
                  {experiences.map((exp, idx) => (
                    <div key={exp.id || idx}>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                        <div>
                          <h3 className="font-bold text-xs text-slate-900">{value(exp.position)}</h3>
                          <p className="text-xs font-semibold text-indigo-700">
                            {value(exp.company)} {exp.location ? `• ${exp.location}` : ""}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          {value(exp.startDate)} {exp.startDate || exp.endDate ? "–" : ""} {value(exp.endDate) || "Present"}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="mt-1.5 text-xs text-slate-700 leading-relaxed whitespace-pre-line">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {education.length > 0 && (
              <section>
                {renderTitle("Education")}
                <div className="space-y-3">
                  {education.map((edu, idx) => (
                    <div key={edu.id || idx}>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                        <div>
                          <h3 className="font-bold text-xs text-slate-900">{value(edu.degree)}</h3>
                          <p className="text-xs font-medium text-slate-700">
                            {value(edu.institution)} {edu.location ? `• ${edu.location}` : ""}
                          </p>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          {value(edu.startDate)} {edu.startDate || edu.endDate ? "–" : ""} {value(edu.endDate)}
                        </span>
                      </div>
                      {edu.description && <p className="mt-1 text-xs text-slate-600">{edu.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <section>
                {renderTitle("Skills")}
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, idx) => (
                    <span
                      key={s.id || idx}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                        template === "tech"
                          ? "bg-slate-900 text-cyan-400 font-mono border border-slate-800"
                          : template === "executive"
                          ? "bg-slate-100 border border-slate-300 text-slate-900 font-bold"
                          : "bg-indigo-50 border border-indigo-200 text-indigo-800"
                      }`}
                    >
                      {value(s.name)}
                      {s.level ? ` (${s.level})` : ""}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <section>
                {renderTitle("Projects")}
                <div className="space-y-3">
                  {projects.map((proj, idx) => (
                    <div key={proj.id || idx}>
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-bold text-xs text-slate-900">{value(proj.name)}</h3>
                        {proj.projectUrl && (
                          <a href={proj.projectUrl} target="_blank" rel="noreferrer" className="text-[11px] text-indigo-600 underline">
                            Link
                          </a>
                        )}
                      </div>
                      {proj.technologies && <p className="text-[11px] font-medium text-slate-500">Tech: {proj.technologies}</p>}
                      {proj.description && <p className="mt-1 text-xs text-slate-700 whitespace-pre-line">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications & Languages */}
            {(certifications.length > 0 || languages.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {certifications.length > 0 && (
                  <section>
                    {renderTitle("Certifications")}
                    <div className="space-y-2 text-xs">
                      {certifications.map((c, idx) => (
                        <div key={c.id || idx}>
                          <h4 className="font-bold text-slate-900">{value(c.name)}</h4>
                          <p className="text-slate-600">{value(c.organization)} {c.issueDate ? `(${c.issueDate})` : ""}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {languages.length > 0 && (
                  <section>
                    {renderTitle("Languages")}
                    <div className="space-y-1 text-xs">
                      {languages.map((l, idx) => (
                        <div key={l.id || idx} className="flex justify-between">
                          <span className="font-bold text-slate-900">{value(l.name)}</span>
                          {l.proficiency && <span className="text-slate-500">{l.proficiency}</span>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}