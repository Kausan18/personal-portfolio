import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

function readJSON<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJSON<T>(filename: string, data: T): void {
  const filePath = path.join(dataDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// ── Skills ────────────────────────────────────────────────
export interface SkillCategory {
  id: string;
  label: string;
  icon: string;
  skills: string[];
}

export function getSkills(): { categories: SkillCategory[] } {
  return readJSON("skills.json");
}

export function saveSkills(data: { categories: SkillCategory[] }): void {
  writeJSON("skills.json", data);
}

// ── Projects ──────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  featured: boolean;
}

export function getProjects(): { projects: Project[] } {
  return readJSON("projects.json");
}

export function saveProjects(data: { projects: Project[] }): void {
  writeJSON("projects.json", data);
}

// ── Contact ───────────────────────────────────────────────
export interface ContactInfo {
  linkedin: string;
  github: string;
  phone: string;
  email: string;
}

export function getContact(): { contact: ContactInfo } {
  return readJSON("contact.json");
}

export function saveContact(data: { contact: ContactInfo }): void {
  writeJSON("contact.json", data);
}