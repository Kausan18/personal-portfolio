import { supabase } from "./supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SkillCategory {
  id: string;
  label: string;
  icon: string;
  skills: string[];
  sort_order?: number;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  live_url: string;
  github_url: string;
  featured: boolean;
  images?: string[];
}

export interface HeroData {
  description: string;
}

export interface ContactInfo {
  linkedin: string;
  github: string;
  phone: string;
  email: string;
}

// ── Skills ────────────────────────────────────────────────────────────────────

export async function getSkills(): Promise<{ categories: SkillCategory[] }> {
  const { data, error } = await supabase
    .from("skill_categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return { categories: data as SkillCategory[] };
}

export async function saveSkills(id: string, skills: string[]): Promise<void> {
  const { error } = await supabase
    .from("skill_categories")
    .update({ skills })
    .eq("id", id);
  if (error) throw error;
}

export async function addSkillCategory(category: {
  id: string;
  label: string;
  icon: string;
  skills: string[];
  sort_order?: number;
}): Promise<void> {
  const { error } = await supabase.from("skill_categories").insert(category);
  if (error) throw error;
}

export async function deleteSkillCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from("skill_categories")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function getProjects(): Promise<{ projects: Project[] }> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return { projects: data as Project[] };
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Project;
}

export async function addProject(project: Project): Promise<void> {
  const { error } = await supabase.from("projects").insert(project);
  if (error) throw error;
}

export async function updateProject(
  id: string,
  fields: Partial<Project>
): Promise<void> {
  const { error } = await supabase
    .from("projects")
    .update(fields)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}

// ── Hero ──────────────────────────────────────────────────────────────────────

export async function getHero(): Promise<HeroData> {
  const { data, error } = await supabase
    .from("hero")
    .select("description")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return data as HeroData;
}

export async function saveHero(heroData: HeroData): Promise<void> {
  const { error } = await supabase
    .from("hero")
    .update({ description: heroData.description })
    .eq("id", 1);
  if (error) throw error;
}

// ── Contact ───────────────────────────────────────────────────────────────────

export async function getContact(): Promise<{ contact: ContactInfo }> {
  const { data, error } = await supabase
    .from("contact")
    .select("linkedin, github, phone, email")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return { contact: data as ContactInfo };
}

export async function saveContact(contactData: ContactInfo): Promise<void> {
  const { error } = await supabase
    .from("contact")
    .update(contactData)
    .eq("id", 1);
  if (error) throw error;
}