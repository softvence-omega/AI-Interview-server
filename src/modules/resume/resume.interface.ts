// src/interfaces/Resume.ts

export interface Resume {
    summary?: string;
    name?: string;
    dateOfBirth: string | null;
    email?: string;
    phone?: string;
    address: {
      street?: string;
      city: string;
      state?: string | null;
      postalCode?: string | null;
      country: string;
    };
    linkedIn?: string | null;
    technicalSkills: string[];
    softSkills?: string[] | null;
    projects?: {
      projectName?: string;
      projectDescription?: string;
      technologies?: string[];
    }[];
    education: {
      degree: string;
      institution: string;
      majorField?: string;
      educationLevel?: string;
      startDate?: string;
      completionDate?: string;
      gpa?: string | null;
      gpaScale?: string | null;
    }[];
    awards?: string[] | null;
    experience?: {
      jobTitle?: string;
      company?: string;
      city?: string;
      country?: string;
      duration?: string;
      responsibilities?: string[];
      skills?: string[];
      startDate?: string;
      endDate?: string | null;
    }[];
    languages?: {
      name?: string;
      proficiency?: string;
    }[];
    certifications?: {
      certificateName?: string | null;
      certificateFile?: string | null;
    }[];
    training?: string | null;
  }
  