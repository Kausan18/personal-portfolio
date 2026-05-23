"use client";

import Image from "next/image";
import { ChangeEvent, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkillCategory {
  id: string;
  label: string;
  icon: string;
  skills: string[];
}

type SkillsData = SkillCategory[];

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  live_url?: string;
  github_url?: string;
  featured?: boolean;
  images?: string[];
}

interface ContactData {
  linkedin: string;
  github: string;
  phone: string;
  email: string;
}

type Tab = "skills" | "projects" | "contact";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`px-4 py-2 rounded-lg text-sm font-mono ${
        type === "success"
          ? "bg-violet-500/10 border border-violet-500/30 text-violet-300"
          : "bg-red-500/10 border border-red-500/30 text-red-300"
      }`}
    >
      {type === "success" ? "✓ " : "✗ "}
      {message}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-mono uppercase tracking-widest text-violet-400 mb-4">
      {children}
    </h2>
  );
}

// ─── Skills Tab ───────────────────────────────────────────────────────────────

function SkillsTab({
  password,
  onStatus,
}: {
  password: string;
  onStatus: (msg: string, type: "success" | "error") => void;
}) {
  const [skills, setSkills] = useState<SkillsData>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [newSkills, setNewSkills] = useState<Record<string, string>>({});

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch("/api/skills");
      const data = await res.json();
      if (Array.isArray(data.categories)) {
        setSkills(data.categories);
      }
    } catch {
      onStatus("Failed to load skills", "error");
    } finally {
      setLoading(false);
    }
  }, [onStatus]);

  useEffect(() => {
    async function load() {
      await fetchSkills();
    }
    void load();
  }, [fetchSkills]);

  const addSkillToCategory = async (categoryId: string) => {
    const skillName = (newSkills[categoryId] ?? "").trim();
    if (!skillName) return;

    const category = skills.find((c) => c.id === categoryId);
    if (!category) return;

    const updatedSkills = [...category.skills, skillName];

    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: categoryId, skills: updatedSkills }),
    });

    if (res.ok) {
      setNewSkills((prev) => ({ ...prev, [categoryId]: "" }));
      await fetchSkills();
      onStatus(`Added "${skillName}" to ${category.label}`, "success");
    } else {
      onStatus("Failed to add skill", "error");
    }
  };

  const removeSkillFromCategory = async (categoryId: string, skill: string) => {
    const category = skills.find((c) => c.id === categoryId);
    if (!category) return;

    const updatedSkills = category.skills.filter((s) => s !== skill);

    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id: categoryId, skills: updatedSkills }),
    });

    if (res.ok) {
      await fetchSkills();
      onStatus(`Removed "${skill}"`, "success");
    } else {
      onStatus("Failed to remove skill", "error");
    }
  };

  const addCategory = async () => {
    const label = newCategory.trim();
    if (!label) return;

    const id = slugify(label);

    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        action: "addCategory",
        id,
        label,
        icon: "code",
        skills: [],
        sort_order: skills.length + 1,
      }),
    });

    if (res.ok) {
      setNewCategory("");
      await fetchSkills();
      onStatus(`Category "${label}" added`, "success");
    } else {
      onStatus("Failed to add category", "error");
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm("Delete this entire category?")) return;

    const res = await fetch("/api/skills", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "deleteCategory", categoryId }),
    });

    if (res.ok) {
      await fetchSkills();
      onStatus("Category deleted", "success");
    } else {
      onStatus("Failed to delete category", "error");
    }
  };

  if (loading) return <p className="text-gray-500 font-mono text-sm">Loading skills...</p>;

  return (
    <div className="space-y-6">
      <SectionTitle>Skill Categories</SectionTitle>

      {skills.map((cat) => (
        <div key={cat.id} className="bg-[#0d0d20] border border-white/8 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{cat.label}</h3>
            <button
              onClick={() => deleteCategory(cat.id)}
              className="text-red-400 hover:text-red-300 text-xs font-mono transition-colors"
            >
              Delete Category
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {cat.skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1.5 px-3 py-1 bg-violet-900/30 border border-violet-700/30 text-violet-300 rounded-lg text-sm font-mono"
              >
                {skill}
                <button
                  onClick={() => removeSkillFromCategory(cat.id, skill)}
                  className="text-violet-500 hover:text-red-400 transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkills[cat.id] ?? ""}
              onChange={(e) =>
                setNewSkills((prev) => ({ ...prev, [cat.id]: e.target.value }))
              }
              onKeyDown={(e) => e.key === "Enter" && addSkillToCategory(cat.id)}
              placeholder="Add skill..."
              className="flex-1 bg-[#080814] border border-white/10 text-white rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-violet-500/50"
            />
            <button
              onClick={() => addSkillToCategory(cat.id)}
              className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-mono transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      ))}

      {/* Add new category */}
      <div className="bg-[#0d0d20] border border-dashed border-white/10 rounded-xl p-5">
        <SectionTitle>New Category</SectionTitle>
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCategory()}
            placeholder="Category name..."
            className="flex-1 bg-[#080814] border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={addCategory}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-mono transition-colors"
          >
            Add Category
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────

type ProjectForm = {
  title: string;
  subtitle: string;
  description: string;
  live_url: string;
  github_url: string;
  tags: string;
  featured: boolean;
  images: string[];
};

function ProjectsTab({
  password,
  onStatus,
}: {
  password: string;
  onStatus: (msg: string, type: "success" | "error") => void;
}) {
  const emptyForm: ProjectForm = {
    title: "",
    subtitle: "",
    description: "",
    live_url: "",
    github_url: "",
    tags: "",
    featured: false,
    images: [],
  };

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [showAdd, setShowAdd] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch {
      onStatus("Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  }, [onStatus]);

  useEffect(() => {
    async function load() {
      await fetchProjects();
    }
    void load();
  }, [fetchProjects]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;
    setForm((prev) => ({ ...prev, [target.name]: value }));
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input so same file can be re-selected if needed
    e.target.value = "";

    if (!file) return;
    if (!form.title.trim()) {
      onStatus("Enter a project title before uploading images", "error");
      return;
    }

    setUploadingImage(true);
    const projectId = editingId ?? slugify(form.title);
    const fd = new FormData();
    fd.append("password", password);
    fd.append("projectId", projectId);
    fd.append("file", file);

    try {
      const res = await fetch("/api/projects/images", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
        onStatus("Image uploaded", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        onStatus(err.error ?? "Image upload failed", "error");
      }
    } catch {
      onStatus("Image upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const saveProject = async () => {
    const { title, subtitle, description, live_url, github_url, tags, featured, images } = form;
    if (!title.trim()) {
      onStatus("Title is required", "error");
      return;
    }

    const tagsArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id: editingId,
          title,
          subtitle,
          description,
          live_url,
          github_url,
          tags: tagsArray,
          featured,
          images,
        }),
      });
      if (res.ok) {
        onStatus("Project updated", "success");
        setEditingId(null);
        setForm(emptyForm);
        await fetchProjects();
      } else {
        onStatus("Failed to update project", "error");
      }
    } else {
      const id = slugify(title);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id,
          title,
          subtitle,
          description,
          live_url,
          github_url,
          tags: tagsArray,
          featured,
          images,
        }),
      });
      if (res.ok) {
        onStatus("Project added", "success");
        setForm(emptyForm);
        setShowAdd(false);
        await fetchProjects();
      } else {
        onStatus("Failed to add project", "error");
      }
    }
  };

  const startEdit = (project: Project) => {
    setEditingId(project.id);
    setShowAdd(false);
    setForm({
      title: project.title,
      subtitle: project.subtitle,
      description: project.description,
      live_url: project.live_url ?? "",
      github_url: project.github_url ?? "",
      tags: (project.tags ?? []).join(", "),
      featured: project.featured ?? false,
      images: project.images ?? [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowAdd(false);
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    const res = await fetch("/api/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, id }),
    });
    if (res.ok) {
      onStatus("Project deleted", "success");
      await fetchProjects();
    } else {
      onStatus("Failed to delete project", "error");
    }
  };

  const formFields: { key: keyof ProjectForm; placeholder: string; textarea?: boolean }[] = [
    { key: "title", placeholder: "Title *" },
    { key: "subtitle", placeholder: "Subtitle (e.g. EDA tool)" },
    { key: "description", placeholder: "Description", textarea: true },
    { key: "tags", placeholder: "Tags (comma-separated: React, FastAPI, Supabase)" },
    { key: "live_url", placeholder: "Live URL (optional)" },
    { key: "github_url", placeholder: "GitHub URL (optional)" },
  ];

  if (loading) return <p className="text-gray-500 font-mono text-sm">Loading projects...</p>;

  return (
    <div className="space-y-6">
      <SectionTitle>Projects</SectionTitle>

      {/* Edit / Add form */}
      {(editingId || showAdd) && (
        <div className="bg-[#0d0d20] border border-violet-500/20 rounded-xl p-5 space-y-3">
          <h3 className="text-violet-400 font-mono text-sm mb-2">
            {editingId ? "Edit Project" : "New Project"}
          </h3>

          {formFields.map(({ key, placeholder, textarea }) =>
            textarea ? (
              <textarea
                key={key}
                name={key}
                value={form[key] as string}
                onChange={handleChange}
                placeholder={placeholder}
                rows={4}
                className="w-full bg-[#080814] border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-500/50 resize-none"
              />
            ) : (
              <input
                key={key}
                type="text"
                name={key}
                value={form[key] as string}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full bg-[#080814] border border-white/10 text-white rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-violet-500/50"
              />
            )
          )}

          <label className="flex items-center gap-2 text-gray-400 text-sm font-mono cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="accent-violet-500"
            />
            Featured project
          </label>

          {/* ── Image upload section ── */}
          <div className="space-y-2 pt-1">
            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">
              Project Images
            </p>

            {form.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, idx) => (
                  <div key={url} className="relative group">
                    <Image
                      src={url}
                      alt={`project-image-${idx}`}
                      width={96}
                      height={64}
                      unoptimized
                      className="rounded-lg border border-white/10 object-cover w-24 h-16"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-400 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className={`flex items-center gap-2 px-3 py-2 border border-dashed rounded-lg text-sm font-mono transition-colors w-fit ${
              uploadingImage
                ? "border-violet-500/40 text-violet-400 cursor-wait"
                : "border-white/10 hover:border-violet-500/40 text-gray-500 hover:text-violet-400 cursor-pointer"
            }`}>
              {uploadingImage ? "Uploading..." : "+ Upload Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={handleImageUpload}
              />
            </label>
            <p className="text-gray-700 text-xs font-mono">
              Images upload instantly to Supabase Storage. Click Add/Save to persist the project.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveProject}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-mono transition-colors"
            >
              {editingId ? "Save Changes" : "Add Project"}
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-400 rounded-lg text-sm font-mono transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Project list */}
      {projects.map((project) => (
        <div
          key={project.id}
          className={`bg-[#0d0d20] border rounded-xl p-5 ${
            editingId === project.id ? "border-violet-500/40" : "border-white/8"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-semibold font-mono truncate">{project.title}</h3>
                {project.images && project.images.length > 0 && (
                  <span className="text-gray-600 text-xs font-mono">
                    {project.images.length} img
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-0.5">{project.subtitle}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {(project.tags ?? []).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-violet-900/20 text-violet-400 rounded text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => startEdit(project)}
                className="px-3 py-1.5 border border-violet-500/30 hover:border-violet-500 text-violet-400 rounded-lg text-xs font-mono transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProject(project.id)}
                className="px-3 py-1.5 border border-red-500/20 hover:border-red-500/50 text-red-400 rounded-lg text-xs font-mono transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {!showAdd && !editingId && (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full py-3 border border-dashed border-white/10 hover:border-violet-500/30 text-gray-500 hover:text-violet-400 rounded-xl text-sm font-mono transition-colors"
        >
          + Add New Project
        </button>
      )}
    </div>
  );
}

// ─── Contact Tab ──────────────────────────────────────────────────────────────

function ContactTab({
  password,
  onStatus,
}: {
  password: string;
  onStatus: (msg: string, type: "success" | "error") => void;
}) {
  // FIX: initialize with empty strings so inputs are always controlled
  const [contact, setContact] = useState<ContactData>({
    linkedin: "",
    github: "",
    phone: "",
    email: "",
  });
  const [hero, setHero] = useState("");
  const [resumeExists, setResumeExists] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/contact"),
      fetch("/api/hero"),
      fetch("/api/resume"),
    ])
      .then(async ([contactRes, heroRes, resumeRes]) => {
        const contactData = await contactRes.json();
        const heroData = await heroRes.json();
        const resumeData = await resumeRes.json();

        // FIX: API returns { contact: {...} } — unwrap it
        const c = contactData.contact ?? contactData;
        setContact({
          linkedin: c.linkedin ?? "",
          github: c.github ?? "",
          phone: c.phone ?? "",
          email: c.email ?? "",
        });

        setHero(heroData.description ?? "");
        setResumeExists(resumeData.exists ?? false);
      })
      .catch(() => onStatus("Failed to load data", "error"))
      .finally(() => setLoading(false));
  }, [onStatus]);

  const saveHero = async () => {
    const res = await fetch("/api/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, description: hero }),
    });
    if (res.ok) onStatus("Bio updated", "success");
    else onStatus("Failed to update bio", "error");
  };

  const saveContact = async () => {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...contact }),
    });
    if (res.ok) onStatus("Contact updated", "success");
    else onStatus("Failed to update contact", "error");
  };

  const uploadResume = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("password", password);
    formData.append("file", file);
    const res = await fetch("/api/resume", { method: "POST", body: formData });
    if (res.ok) {
      setResumeExists(true);
      onStatus("Resume uploaded", "success");
    } else {
      onStatus("Failed to upload resume", "error");
    }
  };

  const deleteResume = async () => {
    if (!confirm("Remove resume?")) return;
    const res = await fetch("/api/resume", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setResumeExists(false);
      onStatus("Resume removed", "success");
    } else {
      onStatus("Failed to remove resume", "error");
    }
  };

  if (loading) return <p className="text-gray-500 font-mono text-sm">Loading...</p>;

  return (
    <div className="space-y-8">
      {/* Bio */}
      <div>
        <SectionTitle>Hero Bio</SectionTitle>
        <textarea
          value={hero}
          onChange={(e) => setHero(e.target.value)}
          rows={4}
          className="w-full bg-[#0d0d20] border border-white/10 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-violet-500/50 resize-none mb-3"
        />
        <button
          onClick={saveHero}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-mono transition-colors"
        >
          Save Bio
        </button>
      </div>

      {/* Contact links */}
      <div>
        <SectionTitle>Contact Info</SectionTitle>
        <div className="space-y-3">
          {(["linkedin", "github", "email", "phone"] as const).map((key) => (
            <input
              key={key}
              type="text"
              value={contact[key]}
              onChange={(e) => setContact((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
              className="w-full bg-[#0d0d20] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-violet-500/50"
            />
          ))}
        </div>
        <button
          onClick={saveContact}
          className="mt-3 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-mono transition-colors"
        >
          Save Contact
        </button>
      </div>

      {/* Resume */}
      <div>
        <SectionTitle>Resume</SectionTitle>
        <div className="flex items-center gap-4">
          <label className="px-4 py-2 border border-white/10 hover:border-violet-500/40 text-gray-400 hover:text-violet-400 rounded-lg text-sm font-mono transition-colors cursor-pointer">
            {resumeExists ? "Replace PDF" : "Upload PDF"}
            <input type="file" accept=".pdf" className="hidden" onChange={uploadResume} />
          </label>
          {resumeExists && (
            <>
              <a
                href="/resume.pdf"
                target="_blank"
                className="text-violet-400 hover:text-violet-300 text-sm font-mono transition-colors"
              >
                View current
              </a>
              <button
                onClick={deleteResume}
                className="text-red-400 hover:text-red-300 text-sm font-mono transition-colors"
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("projects");
  const [status, setStatus] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const handleStatus = (msg: string, type: "success" | "error") => {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3500);
  };

  const handleLogin = async () => {
    setAuthError("");
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "ping" }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setAuthError("Wrong password");
    }
  };

  if (!authed) {
    return (
      <main className="bg-[#080814] min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold font-mono text-violet-400 mb-6 text-center">
            Admin
          </h1>
          <div className="bg-[#0d0d20] border border-white/8 rounded-2xl p-6 space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              className="w-full bg-[#080814] border border-white/10 text-white rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:border-violet-500/50"
            />
            {authError && (
              <p className="text-red-400 text-xs font-mono">{authError}</p>
            )}
            <button
              onClick={handleLogin}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-sm font-mono transition-colors"
            >
              Enter
            </button>
          </div>
        </div>
      </main>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "projects", label: "Projects" },
    { key: "skills", label: "Skills" },
    { key: "contact", label: "Contact & Bio" },
  ];

  return (
    <main className="bg-[#080814] min-h-screen text-white px-4 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-mono text-violet-400">Admin Panel</h1>
        <button
          onClick={() => setAuthed(false)}
          className="text-gray-600 hover:text-gray-400 text-xs font-mono transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0d0d20] border border-white/8 rounded-xl p-1 mb-8">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-2 rounded-lg text-sm font-mono transition-colors ${
              tab === key
                ? "bg-violet-600 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Status */}
      {status && (
        <div className="mb-6">
          <StatusBadge message={status.msg} type={status.type} />
        </div>
      )}

      {/* Tab content */}
      {tab === "skills" && <SkillsTab password={password} onStatus={handleStatus} />}
      {tab === "projects" && <ProjectsTab password={password} onStatus={handleStatus} />}
      {tab === "contact" && <ContactTab password={password} onStatus={handleStatus} />}
    </main>
  );
}