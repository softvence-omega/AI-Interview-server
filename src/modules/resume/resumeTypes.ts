export interface Address {
    street: string;
    city: string;
    state: string | null;
    postal_code: string | null;
    country: string | null;
  }
  
  export interface Project {
    Project_name: string;
    Project_description: string;
    technologies: string[];
  }
  
  export interface Education {
    degree: string;
    institution: string;
    major_field: string;
    education_level: string;
    start_date: string;
    completion_date: string;
    gpa: string | null;
    gpa_scale: string | null;
  }
  
  export interface Experience {
    job_title: string;
    company: string;
    duration: string;
    responsibilities: string[];
    skills: string;
    start_date: string;
    end_date: string | null;
  }
  
  export interface Language {
    name: string;
    proficiency: string;
  }
  
  export interface Resume {
    summary: string;
    name: string;
    Date_Of_Birth: string | null;
    email: string;
    git_hub: string | null;
    phone: string;
    address: Address;
    linkedIn: string | null;
    technical_skills: string[];
    soft_skills: string[] | null;
    projects: Project[];
    education: Education[];
    experience: Experience[];
    languages: Language[];
    certifications: string[] | null;
    training: string[] | null;
  }