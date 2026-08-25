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

function SectionTitle({
  children,
  template,
}: {
  children: React.ReactNode;
  template: string;
}) {
  if (template === "classic") {
    return (
      <h2 className="mb-3 border-b border-gray-400 pb-1 text-sm font-bold uppercase tracking-widest text-gray-800">
        {children}
      </h2>
    );
  }

  if (template === "professional") {
    return (
      <h2 className="mb-3 border-l-4 border-blue-600 pl-3 text-base font-bold uppercase tracking-wide text-gray-800">
        {children}
      </h2>
    );
  }

  if (template === "minimal") {
    return (
      <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-700">
        {children}
      </h2>
    );
  }

  return (
    <h2 className="mb-3 border-b-2 border-blue-600 pb-1 text-base font-bold uppercase tracking-wide text-blue-700">
      {children}
    </h2>
  );
}

export default function CVPreview({ cv }: CVPreviewProps) {
  const personal = cv.personalInfo;

  const education = cv.education || [];
  const experiences = cv.experiences || [];
  const skills = cv.skills || [];
  const projects = cv.projects || [];
  const certifications = cv.certifications || [];
  const languages = cv.languages || [];

  const template = cv.template || "modern";

  const fullName = value(personal?.fullName) || "Your Name";
  const jobTitle = value(personal?.jobTitle);
  const summary = value(personal?.summary);

  const contactItems = [
    value(personal?.email),
    value(personal?.phone),
    value(personal?.address),
    value(personal?.city),
    value(personal?.country),
  ].filter(Boolean);

  return (
    <div className="w-full overflow-auto rounded-xl bg-gray-200 p-4 md:p-8">
      <div
        className={`mx-auto min-h-[1123px] w-full max-w-[794px] bg-white text-gray-900 shadow-xl ${
          template === "minimal" ? "p-10 md:p-14" : "p-8 md:p-12"
        }`}
      >
        {template === "professional" ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[210px_1fr]">
            <aside className="rounded-xl bg-gray-100 p-5">
              <h1 className="text-2xl font-bold leading-tight">
                {fullName}
              </h1>

              {jobTitle && (
                <p className="mt-2 text-sm font-medium text-blue-700">
                  {jobTitle}
                </p>
              )}

              {contactItems.length > 0 && (
                <div className="mt-6 space-y-2 text-xs text-gray-600">
                  {contactItems.map((item, index) => (
                    <p key={`${item}-${index}`} className="break-words">
                      {item}
                    </p>
                  ))}
                </div>
              )}

              {(personal?.linkedin ||
                personal?.github ||
                personal?.portfolio) && (
                <div className="mt-6 space-y-2 text-xs">
                  {personal.linkedin && (
                    <p className="break-all text-blue-700">
                      {personal.linkedin}
                    </p>
                  )}

                  {personal.github && (
                    <p className="break-all text-blue-700">
                      {personal.github}
                    </p>
                  )}

                  {personal.portfolio && (
                    <p className="break-all text-blue-700">
                      {personal.portfolio}
                    </p>
                  )}
                </div>
              )}

              {skills.length > 0 && (
                <div className="mt-8">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">
                    Skills
                  </h2>

                  <div className="space-y-2">
                    {skills.map((skill, index) => (
                      <div key={skill.id || index}>
                        <p className="text-xs font-medium">
                          {value(skill.name)}
                        </p>

                        {skill.level && (
                          <p className="text-[11px] text-gray-500">
                            {skill.level}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {languages.length > 0 && (
                <div className="mt-8">
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide">
                    Languages
                  </h2>

                  <div className="space-y-2">
                    {languages.map((language, index) => (
                      <div key={language.id || index}>
                        <p className="text-xs font-medium">
                          {value(language.name)}
                        </p>

                        {language.proficiency && (
                          <p className="text-[11px] text-gray-500">
                            {language.proficiency}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            <div>
              {summary && (
                <section className="mb-7">
                  <SectionTitle template={template}>
                    Profile
                  </SectionTitle>

                  <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                    {summary}
                  </p>
                </section>
              )}

              {experiences.length > 0 && (
                <section className="mb-7">
                  <SectionTitle template={template}>
                    Experience
                  </SectionTitle>

                  <div className="space-y-5">
                    {experiences.map((experience, index) => (
                      <div key={experience.id || index}>
                        <div className="flex flex-col justify-between gap-1 sm:flex-row">
                          <div>
                            <h3 className="font-bold">
                              {value(experience.position) ||
                                "Position"}
                            </h3>

                            <p className="text-sm font-medium text-blue-700">
                              {value(experience.company)}
                            </p>
                          </div>

                          {(experience.startDate ||
                            experience.endDate) && (
                            <p className="text-xs text-gray-500">
                              {value(experience.startDate)}
                              {experience.startDate &&
                              experience.endDate
                                ? " - "
                                : ""}
                              {value(experience.endDate)}
                            </p>
                          )}
                        </div>

                        {experience.location && (
                          <p className="mt-1 text-xs text-gray-500">
                            {experience.location}
                          </p>
                        )}

                        {experience.description && (
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                            {experience.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {education.length > 0 && (
                <section className="mb-7">
                  <SectionTitle template={template}>
                    Education
                  </SectionTitle>

                  <div className="space-y-4">
                    {education.map((item, index) => (
                      <div key={item.id || index}>
                        <h3 className="font-bold">
                          {value(item.degree) || "Degree"}
                        </h3>

                        <p className="text-sm text-blue-700">
                          {value(item.institution)}
                        </p>

                        {(item.startDate || item.endDate) && (
                          <p className="text-xs text-gray-500">
                            {value(item.startDate)}
                            {item.startDate && item.endDate
                              ? " - "
                              : ""}
                            {value(item.endDate)}
                          </p>
                        )}

                        {item.location && (
                          <p className="text-xs text-gray-500">
                            {item.location}
                          </p>
                        )}

                        {item.description && (
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                            {item.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {projects.length > 0 && (
                <section className="mb-7">
                  <SectionTitle template={template}>
                    Projects
                  </SectionTitle>

                  <div className="space-y-4">
                    {projects.map((project, index) => (
                      <div key={project.id || index}>
                        <h3 className="font-bold">
                          {value(project.name) || "Project"}
                        </h3>

                        {project.technologies && (
                          <p className="mt-1 text-xs font-medium text-blue-700">
                            {project.technologies}
                          </p>
                        )}

                        {project.description && (
                          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                            {project.description}
                          </p>
                        )}

                        {project.projectUrl && (
                          <p className="mt-1 break-all text-xs text-blue-600">
                            {project.projectUrl}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {certifications.length > 0 && (
                <section className="mb-7">
                  <SectionTitle template={template}>
                    Certifications
                  </SectionTitle>

                  <div className="space-y-4">
                    {certifications.map((certification, index) => (
                      <div key={certification.id || index}>
                        <h3 className="font-bold">
                          {value(certification.name) ||
                            "Certification"}
                        </h3>

                        {certification.organization && (
                          <p className="text-sm text-blue-700">
                            {certification.organization}
                          </p>
                        )}

                        {certification.issueDate && (
                          <p className="text-xs text-gray-500">
                            Issued: {certification.issueDate}
                          </p>
                        )}

                        {certification.credentialId && (
                          <p className="text-xs text-gray-500">
                            Credential ID: {certification.credentialId}
                          </p>
                        )}

                        {certification.credentialUrl && (
                          <p className="break-all text-xs text-blue-600">
                            {certification.credentialUrl}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        ) : (
          <>
            <header
              className={`mb-8 ${
                template === "classic"
                  ? "border-b-2 border-gray-800 pb-5 text-center"
                  : template === "minimal"
                    ? "border-b border-gray-300 pb-5"
                    : "rounded-xl bg-blue-600 p-6 text-white"
              }`}
            >
              <h1
                className={`text-3xl font-bold md:text-4xl ${
                  template === "modern"
                    ? "text-white"
                    : "text-gray-900"
                }`}
              >
                {fullName}
              </h1>

              {jobTitle && (
                <p
                  className={`mt-2 text-base ${
                    template === "modern"
                      ? "text-blue-100"
                      : "text-gray-600"
                  }`}
                >
                  {jobTitle}
                </p>
              )}

              {contactItems.length > 0 && (
                <div
                  className={`mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs ${
                    template === "modern"
                      ? "text-blue-50"
                      : "text-gray-600"
                  } ${template === "classic" ? "justify-center" : ""}`}
                >
                  {contactItems.map((item, index) => (
                    <span key={`${item}-${index}`}>{item}</span>
                  ))}
                </div>
              )}

              {(personal?.linkedin ||
                personal?.github ||
                personal?.portfolio) && (
                <div
                  className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs ${
                    template === "classic" ? "justify-center" : ""
                  }`}
                >
                  {personal.linkedin && (
                    <span className="break-all text-blue-600">
                      {personal.linkedin}
                    </span>
                  )}

                  {personal.github && (
                    <span className="break-all text-blue-600">
                      {personal.github}
                    </span>
                  )}

                  {personal.portfolio && (
                    <span className="break-all text-blue-600">
                      {personal.portfolio}
                    </span>
                  )}
                </div>
              )}
            </header>

            {summary && (
              <section className="mb-7">
                <SectionTitle template={template}>
                  Professional Summary
                </SectionTitle>

                <p className="whitespace-pre-line text-sm leading-6 text-gray-700">
                  {summary}
                </p>
              </section>
            )}

            {experiences.length > 0 && (
              <section className="mb-7">
                <SectionTitle template={template}>
                  Experience
                </SectionTitle>

                <div className="space-y-5">
                  {experiences.map((experience, index) => (
                    <div key={experience.id || index}>
                      <div className="flex flex-col justify-between gap-1 sm:flex-row">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {value(experience.position) || "Position"}
                          </h3>

                          <p className="text-sm font-medium text-blue-700">
                            {value(experience.company)}
                          </p>
                        </div>

                        {(experience.startDate ||
                          experience.endDate) && (
                          <p className="text-xs text-gray-500">
                            {value(experience.startDate)}
                            {experience.startDate &&
                            experience.endDate
                              ? " - "
                              : ""}
                            {value(experience.endDate)}
                          </p>
                        )}
                      </div>

                      {experience.location && (
                        <p className="mt-1 text-xs text-gray-500">
                          {experience.location}
                        </p>
                      )}

                      {experience.description && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                          {experience.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {education.length > 0 && (
              <section className="mb-7">
                <SectionTitle template={template}>
                  Education
                </SectionTitle>

                <div className="space-y-4">
                  {education.map((item, index) => (
                    <div key={item.id || index}>
                      <h3 className="font-bold text-gray-900">
                        {value(item.degree) || "Degree"}
                      </h3>

                      <p className="text-sm font-medium text-blue-700">
                        {value(item.institution)}
                      </p>

                      {(item.startDate || item.endDate) && (
                        <p className="text-xs text-gray-500">
                          {value(item.startDate)}
                          {item.startDate && item.endDate
                            ? " - "
                            : ""}
                          {value(item.endDate)}
                        </p>
                      )}

                      {item.location && (
                        <p className="text-xs text-gray-500">
                          {item.location}
                        </p>
                      )}

                      {item.description && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {skills.length > 0 && (
              <section className="mb-7">
                <SectionTitle template={template}>
                  Skills
                </SectionTitle>

                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={skill.id || index}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        template === "modern"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {value(skill.name)}
                      {skill.level ? ` • ${skill.level}` : ""}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section className="mb-7">
                <SectionTitle template={template}>
                  Projects
                </SectionTitle>

                <div className="space-y-4">
                  {projects.map((project, index) => (
                    <div key={project.id || index}>
                      <h3 className="font-bold text-gray-900">
                        {value(project.name) || "Project"}
                      </h3>

                      {project.technologies && (
                        <p className="mt-1 text-xs font-medium text-blue-700">
                          {project.technologies}
                        </p>
                      )}

                      {project.description && (
                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">
                          {project.description}
                        </p>
                      )}

                      {project.projectUrl && (
                        <p className="mt-1 break-all text-xs text-blue-600">
                          {project.projectUrl}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {certifications.length > 0 && (
              <section className="mb-7">
                <SectionTitle template={template}>
                  Certifications
                </SectionTitle>

                <div className="space-y-4">
                  {certifications.map((certification, index) => (
                    <div key={certification.id || index}>
                      <h3 className="font-bold text-gray-900">
                        {value(certification.name) ||
                          "Certification"}
                      </h3>

                      {certification.organization && (
                        <p className="text-sm text-blue-700">
                          {certification.organization}
                        </p>
                      )}

                      {certification.issueDate && (
                        <p className="text-xs text-gray-500">
                          Issued: {certification.issueDate}
                        </p>
                      )}

                      {certification.credentialId && (
                        <p className="text-xs text-gray-500">
                          Credential ID: {certification.credentialId}
                        </p>
                      )}

                      {certification.credentialUrl && (
                        <p className="break-all text-xs text-blue-600">
                          {certification.credentialUrl}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {languages.length > 0 && (
              <section className="mb-7">
                <SectionTitle template={template}>
                  Languages
                </SectionTitle>

                <div className="flex flex-wrap gap-3">
                  {languages.map((language, index) => (
                    <div
                      key={language.id || index}
                      className="rounded-lg border border-gray-200 px-4 py-2"
                    >
                      <span className="text-sm font-medium">
                        {value(language.name)}
                      </span>

                      {language.proficiency && (
                        <span className="ml-2 text-xs text-gray-500">
                          {language.proficiency}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {!personal &&
          education.length === 0 &&
          experiences.length === 0 &&
          skills.length === 0 &&
          projects.length === 0 &&
          certifications.length === 0 &&
          languages.length === 0 && (
            <div className="flex min-h-[400px] items-center justify-center text-center">
              <div>
                <div className="text-5xl">📄</div>
                <h2 className="mt-4 text-xl font-bold text-gray-800">
                  No CV data available
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Add CV information to see the preview.
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}