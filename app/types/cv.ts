export interface PersonalInfo {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  summary?: string;
  jobTitle?: string;
  profileImage?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
}

export interface Education {
  id?: string;
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Experience {
  id?: string;
  position: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface Skill {
  id?: string;
  name: string;
  level?: string;
}

export interface Project {
  id?: string;
  name: string;
  description?: string;
  technologies?: string;
  projectUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id?: string;
  name: string;
  organization?: string;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Language {
  id?: string;
  name: string;
  proficiency?: string;
}

export interface UploadedCV {
  id?: string;
  originalName: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath?: string;
  extractedText?: string;
  parsedData?: Record<string, unknown>;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIContent {
  id?: string;
  type: string;
  originalText?: string;
  generatedText?: string;
  model?: string;
  status?: string;
  createdAt?: string;
}

export interface CV {
  id?: string;
  title: string;
  template: string;
  status: string;

  createdAt?: string;
  updatedAt?: string;

  userId?: string;

  personalInfo?: PersonalInfo | null;

  education: Education[];
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];

  uploadedCVs?: UploadedCV[];
  aiContents?: AIContent[];
}

export interface CreateCVInput {
  title?: string;
  template?: string;
  status?: string;
}

export interface UpdateCVInput {
  title?: string;
  template?: string;
  status?: string;
}