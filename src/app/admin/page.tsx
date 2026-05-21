"use client";

import { ChangeEvent, useState, useEffect, useCallback } from "react";
import Image from "next/image";

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
  liveUrl?: string;
  githubUrl?: string;
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

function StatusBadge({
  message,
  type,
}: {
  message: string;
  type: "success" | "error";
}) {
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
      } else if (data && typeof data === "object") {
        setSkills(
          Object.entries(data).map(([label, value]) => ({
            id: slugify(label),
            label,
            icon: "code",
            skills: Array.isArray(value) ? value : [],
          }))
        );
      } else {
        setSkills([]);
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
    load();
  }, [fetchSkills]);

  async function post(body: object) {
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...body }),
    });
    return res.json();
  }

  async function handleAddSkill(categoryId: string) {
    const skill = newSkills[categoryId]?.trim();
    if (!skill) return;

    const updated = skills.map((category) =>
      category.id === categoryId
        ? { ...category, skills: [...category.skills, skill] }
        : category
    );

    const result = await post({ categories: updated });
    if (result.error) return onStatus(result.error, "error");

    setSkills(updated);
    setNewSkills((prev) => ({ ...prev, [categoryId]: "" }));
    onStatus(`Added "${skill}" to ${skills.find((c) => c.id === categoryId)?.label ?? "category"}`, "success");
  }

  async function handleRemoveSkill(categoryId: string, skill: string) {
    const updated = skills.map((category) =>
      category.id === categoryId
        ? { ...category, skills: category.skills.filter((item) => item !== skill) }
        : category
    );

    const result = await post({ categories: updated });
    if (result.error) return onStatus(result.error, "error");

    setSkills(updated);
    onStatus(`Removed "${skill}"`, "success");
  }

  async function handleDeleteCategory(categoryId: string, categoryLabel: string) {
    if (!confirm(`Delete category "${categoryLabel}" and all its skills?`)) return;

    const res = await fetch("/api/skills", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, action: "deleteCategory", category: categoryLabel }),
    });
    const result = await res.json();
    if (result.error) return onStatus(result.error, "error");

    setSkills((prev) => prev.filter((category) => category.id !== categoryId));
    onStatus(`Deleted category "${categoryLabel}"`, "success");
  }

  async function handleAddCategory() {
    const label = newCategory.trim();
    if (!label) return;

    const idBase = slugify(label);
    let id = idBase;
    const existingIds = new Set(skills.map((cat) => cat.id));
    let suffix = 1;
    while (existingIds.has(id)) {
      id = `${idBase}-${suffix}`;
      suffix += 1;
    }

    const updated = [
      ...skills,
      { id, label, icon: "code", skills: [] },
    ];

    const result = await post({ categories: updated });
    if (result.error) return onStatus(result.error, "error");

    setSkills(updated);
    setNewCategory("");
    onStatus(`Created category "${label}"`, "success");
  }

  if (loading)
    return (
      <p className="text-gray-500 font-mono text-sm animate-pulse">
        Loading skills…
      </p>
    );

  return (
    <div className="space-y-8">
      {/* Existing categories */}
      {skills.map((category) => (
        <div
          key={category.id}
          className="bg-[#0d0d20] border border-white/8 rounded-xl p-5 space-y-4"
        >
          <div className="flex items-start justify-between gap-3">
            <SectionTitle>{category.label}</SectionTitle>
            <button
              onClick={() => handleDeleteCategory(category.id, category.label)}
              className="px-3 py-1.5 text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>

          {/* Skill chips */}
          <div className="flex flex-wrap gap-2">
            {category.skills.map((skill) => (
              <span
                key={skill}
                className="group flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-mono"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(category.id, skill)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-400 hover:text-red-400 leading-none"
                  title="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Add skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Add skill to ${category.label}…`}
              value={newSkills[category.id] || ""}
              onChange={(e) =>
                setNewSkills((p) => ({ ...p, [category.id]: e.target.value }))
              }
              onKeyDown={(e) =>
                e.key === "Enter" && handleAddSkill(category.id)
              }
              className="flex-1 bg-[#080814] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50"
            />
            <button
              onClick={() => handleAddSkill(category.id)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-mono rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      ))}

      {/* New category */}
      <div className="bg-[#0d0d20] border border-dashed border-white/10 rounded-xl p-5 space-y-3">
        <SectionTitle>New Category</SectionTitle>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Category name…"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            className="flex-1 bg-[#080814] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-mono rounded-lg transition-colors"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Projects Tab ─────────────────────────────────────────────────────────────

function ProjectsTab({
  password,
  onStatus,
}: {
  password: string;
  onStatus: (msg: string, type: "success" | "error") => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTagsInput, setEditTagsInput] = useState("");
  const [form, setForm] = useState<{
    title: string;
    subtitle: string;
    description: string;
    liveUrl: string;
    githubUrl: string;
    images: string[];
  }>({
    title: "",
    subtitle: "",
    description: "",
    liveUrl: "",
    githubUrl: "",
    images: [],
  });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data.projects) ? data.projects : []);
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

  async function post(body: object) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...body }),
    });
    return res.json();
  }

  async function put(body: object) {
    const res = await fetch("/api/projects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, ...body }),
    });
    return res.json();
  }

  function resetForm() {
    setForm({ title: "", subtitle: "", description: "", liveUrl: "", githubUrl: "", images: [] });
    setTagsInput("");
    setEditTagsInput("");
    setImageUploadError(null);
  }

  function openEdit(project: Project) {
    setEditingId(project.id);
    setForm({
      title: project.title,
      subtitle: project.subtitle,
      description: project.description,
      liveUrl: project.liveUrl || "",
      githubUrl: project.githubUrl || "",
      images: project.images ? [...project.images] : [],
    });
    setEditTagsInput(project.tags.join(", "));
    setShowForm(false);
    setImageUploadError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    resetForm();
  }

  async function handleSaveEdit() {
    if (!editingId) return;
    const { title, subtitle, description, liveUrl, githubUrl, images } = form;
    if (!title.trim() || !subtitle.trim() || !description.trim()) {
      return onStatus("Title, subtitle, and description are required", "error");
    }

    const tags = editTagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const result = await put({
      id: editingId,
      title,
      subtitle,
      description,
      tags,
      liveUrl,
      githubUrl,
      images,
    });
    if (result.error) return onStatus(result.error, "error");

    setProjects((prev) =>
      prev.map((project) =>
        project.id === editingId
          ? { ...project, title, subtitle, description, tags, liveUrl, githubUrl, images }
          : project
      )
    );
    setEditingId(null);
    resetForm();
    onStatus(`Updated project "${title}"`, "success");
  }

  async function handleUploadImages(files: FileList | null) {
    if (!editingId || !files || files.length === 0) return;
    setUploadingImages(true);
    setImageUploadError(null);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("password", password);
      formData.append("projectId", editingId);
      formData.append("file", file);

      const res = await fetch("/api/projects/images", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) {
        setImageUploadError(data.error || "Image upload failed");
        setUploadingImages(false);
        return;
      }
      uploadedUrls.push(data.url);
    }

    setForm((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
    setUploadingImages(false);
  }

  function handleRemoveImage(imageUrl: string) {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((url) => url !== imageUrl),
    }));
  }

  async function handleAddProject() {
    const { title, subtitle, description, liveUrl, githubUrl } = form;
    if (!title.trim() || !subtitle.trim() || !description.trim()) {
      return onStatus("Title, subtitle, and description are required", "error");
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const idBase = slugify(title);
    let id = idBase;
    const existingIds = new Set(projects.map((project) => project.id));
    let suffix = 1;
    while (existingIds.has(id)) {
      id = `${idBase}-${suffix}`;
      suffix += 1;
    }

    const newProject: Project = {
      id,
      title,
      subtitle,
      description,
      tags,
      liveUrl,
      githubUrl,
      featured: false,
      images: [],
    };
    const updated = [...projects, newProject];
    const result = await post({ projects: updated });
    if (result.error) return onStatus(result.error, "error");

    setProjects(updated);
    resetForm();
    setShowForm(false);
    onStatus(`Added project "${title}"`, "success");
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    const updated = projects.filter((project) => project.id !== id);
    const result = await post({ projects: updated });
    if (result.error) return onStatus(result.error, "error");

    setProjects(updated);
    if (editingId === id) {
      cancelEdit();
    }
    onStatus(`Deleted "${title}"`, "success");
  }

  if (loading)
    return (
      <p className="text-gray-500 font-mono text-sm animate-pulse">
        Loading projects…
      </p>
    );

  return (
    <div className="space-y-6">
      {/* Project list */}
      {projects.length === 0 && (
        <p className="text-gray-500 font-mono text-sm">No projects yet.</p>
      )}
      {projects.map((p) => (
        <div
          key={p.id}
          className="bg-[#0d0d20] border border-white/8 rounded-xl p-5 flex flex-col md:flex-row items-start justify-between gap-4"
        >
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{p.title}</p>
            <p className="text-gray-400 text-sm truncate">{p.subtitle}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openEdit(p)}
              className="shrink-0 px-3 py-1.5 text-xs font-mono bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(p.id, p.title)}
              className="shrink-0 px-3 py-1.5 text-xs font-mono bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      {editingId && (
        <div className="bg-[#0d0d20] border border-violet-500/20 rounded-xl p-5 space-y-4">
          <SectionTitle>Edit Project</SectionTitle>

          {[
            { key: "title", placeholder: "Title *" },
            { key: "subtitle", placeholder: "Subtitle *" },
            { key: "liveUrl", placeholder: "Live URL (optional)" },
            { key: "githubUrl", placeholder: "GitHub URL (optional)" },
          ].map(({ key, placeholder }) => (
            <input
              key={key}
              type="text"
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={(e) =>
                setForm((p) => ({ ...p, [key]: e.target.value }))
              }
              className="w-full bg-[#080814] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50"
            />
          ))}

          <textarea
            placeholder="Description *"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
            className="w-full bg-[#080814] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50 resize-none"
          />

          <input
            type="text"
            placeholder="Tags (comma-separated)"
            value={editTagsInput}
            onChange={(e) => setEditTagsInput(e.target.value)}
            className="w-full bg-[#080814] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50"
          />

          <div className="space-y-3">
            <label className="text-xs font-mono uppercase tracking-widest text-gray-400">
              Project Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleUploadImages(e.target.files)}
              className="w-full bg-[#080814] border border-white/10 rounded-lg px-3 py-2 text-sm text-white file:bg-violet-600 file:text-white file:px-3 file:py-2 file:rounded-lg"
            />
            {imageUploadError && (
              <p className="text-red-400 text-sm">{imageUploadError}</p>
            )}
            {uploadingImages && (
              <p className="text-gray-400 text-sm">Uploading images…</p>
            )}
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {form.images.map((image) => (
                  <div key={image} className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#080814] h-28">
                    <Image
                      src={image}
                      alt="Project image"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image)}
                      className="absolute top-2 right-2 rounded-full bg-black/60 text-white w-8 h-8 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1 flex-wrap">
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-mono rounded-lg transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-mono rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!editingId &&
        (!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 border border-dashed border-white/10 rounded-xl text-gray-500 hover:text-violet-400 hover:border-violet-500/30 text-sm font-mono transition-colors"
          >
            + Add New Project
          </button>
        ) : (
          <div className="bg-[#0d0d20] border border-violet-500/20 rounded-xl p-5 space-y-4">
            <SectionTitle>New Project</SectionTitle>

            {[
              { key: "title", placeholder: "Title *" },
              { key: "subtitle", placeholder: "Subtitle *" },
              { key: "liveUrl", placeholder: "Live URL (optional)" },
              { key: "githubUrl", placeholder: "GitHub URL (optional)" },
            ].map(({ key, placeholder }) => (
              <input
                key={key}
                type="text"
                placeholder={placeholder}
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [key]: e.target.value }))
                }
                className="w-full bg-[#080814] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50"
              />
            ))}

            <textarea
              placeholder="Description *"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full bg-[#080814] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50 resize-none"
            />

            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-[#080814] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50"
            />

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAddProject}
                className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-mono rounded-lg transition-colors"
              >
                Save Project
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 text-sm font-mono rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
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
  const [contact, setContact] = useState<ContactData>({
    linkedin: "",
    github: "",
    phone: "",
    email: "",
  });
  const [heroDescription, setHeroDescription] = useState("");
  const [resumeExists, setResumeExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeDeleting, setResumeDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [contactRes, heroRes, resumeRes] = await Promise.all([
          fetch("/api/contact"),
          fetch("/api/hero"),
          fetch("/api/resume"),
        ]);

        const contactData = await contactRes.json();
        const heroData = await heroRes.json();
        const resumeData = await resumeRes.json();

        setContact(contactData.contact ?? contactData);
        setHeroDescription(heroData?.description ?? "");
        setResumeExists(Boolean(resumeData?.exists));
      } catch {
        onStatus("Failed to load contact info", "error");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [onStatus]);

  async function handleSaveHero() {
    setSavingHero(true);
    try {
      const res = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, description: heroDescription }),
      });
      const result = await res.json();
      if (result.error) return onStatus(result.error, "error");
      onStatus("Hero description saved", "success");
    } catch {
      onStatus("Failed to save hero description", "error");
    } finally {
      setSavingHero(false);
    }
  }

  async function handleUploadResume(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);

    const formData = new FormData();
    formData.append("password", password);
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();
      if (result.error) return onStatus(result.error, "error");
      setResumeExists(true);
      onStatus("Resume uploaded", "success");
    } catch {
      onStatus("Failed to upload resume", "error");
    } finally {
      setResumeUploading(false);
    }
  }

  async function handleDeleteResume() {
    if (!confirm("Remove the current resume?")) return;
    setResumeDeleting(true);
    try {
      const res = await fetch("/api/resume", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await res.json();
      if (result.error) return onStatus(result.error, "error");
      setResumeExists(false);
      onStatus("Resume removed", "success");
    } catch {
      onStatus("Failed to remove resume", "error");
    } finally {
      setResumeDeleting(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, ...contact }),
      });
      const result = await res.json();
      if (result.error) return onStatus(result.error, "error");
      onStatus("Contact info saved", "success");
    } catch {
      onStatus("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  }

  const fields: { key: keyof ContactData; label: string; placeholder: string }[] = [
    { key: "email", label: "Email", placeholder: "you@example.com" },
    { key: "phone", label: "Phone", placeholder: "+91 9999999999" },
    { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/…" },
    { key: "github", label: "GitHub URL", placeholder: "https://github.com/…" },
  ];

  if (loading)
    return (
      <p className="text-gray-500 font-mono text-sm animate-pulse">
        Loading contact…
      </p>
    );

  return (
    <div className="space-y-6">
      <div className="bg-[#0d0d20] border border-white/8 rounded-xl p-5 space-y-5">
        <SectionTitle>Contact Details</SectionTitle>

        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <label className="text-xs font-mono text-gray-500 uppercase tracking-wider">
              {label}
            </label>
            <input
              type="text"
              placeholder={placeholder}
              value={contact[key]}
              onChange={(e) =>
                setContact((p) => ({ ...p, [key]: e.target.value }))
              }
              className="w-full bg-[#080814] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50"
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-mono rounded-lg transition-colors"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="bg-[#0d0d20] border border-white/8 rounded-xl p-5 space-y-5">
        <SectionTitle>Hero Description</SectionTitle>

        <textarea
          rows={4}
          value={heroDescription}
          onChange={(e) => setHeroDescription(e.target.value)}
          className="w-full bg-[#080814] border border-white/10 rounded-lg px-3 py-3 text-sm text-white placeholder-gray-600 font-mono focus:outline-none focus:border-violet-500/50 resize-none"
          placeholder="Enter the hero description shown on the home page"
        />

        <button
          onClick={handleSaveHero}
          disabled={savingHero}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-mono rounded-lg transition-colors"
        >
          {savingHero ? "Saving…" : "Save Hero Description"}
        </button>
      </div>

      <div className="bg-[#0d0d20] border border-white/8 rounded-xl p-5 space-y-4">
        <SectionTitle>Resume</SectionTitle>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-400">
            Current resume: {resumeExists ? "resume.pdf ✅" : "No resume uploaded"}
          </p>

          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-mono cursor-pointer transition-colors">
              <span>{resumeExists ? "Replace" : "Upload"}</span>
              <input
                type="file"
                accept=".pdf"
                onChange={handleUploadResume}
                className="sr-only"
              />
            </label>
            {resumeExists && (
              <button
                onClick={handleDeleteResume}
                disabled={resumeDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-mono transition-colors disabled:opacity-50"
              >
                {resumeDeleting ? "Removing…" : "Remove"}
              </button>
            )}
          </div>
        </div>

        {resumeUploading && (
          <p className="text-gray-400 text-sm">Uploading resume…</p>
        )}
      </div>
    </div>
  );
}

// ─── Password Gate ────────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: (pw: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  async function handleSubmit() {
    if (!value.trim()) return;
    // Optimistic — real auth happens on first API call
    // But we can do a quick probe against any endpoint
    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: value, action: "ping" }),
    });
    const data = await res.json();
    if (data.error === "Unauthorized") {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setValue("");
    } else {
      onUnlock(value);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080814]">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div
        className={`relative z-10 w-full max-w-sm mx-4 transition-transform ${shaking ? "animate-bounce" : ""}`}
        style={
          shaking
            ? { animation: "shake 0.4s ease-in-out" }
            : undefined
        }
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>

        <div className="bg-[#0d0d20] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl shadow-black/50">
          {/* Lock icon */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Admin Panel</h1>
              <p className="text-gray-500 text-sm font-mono mt-0.5">
                Enter your password to continue
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className={`w-full bg-[#080814] border rounded-lg px-4 py-3 text-white placeholder-gray-600 font-mono text-sm focus:outline-none transition-colors ${
                error
                  ? "border-red-500/50 focus:border-red-500"
                  : "border-white/10 focus:border-violet-500/50"
              }`}
              autoFocus
            />
            {error && (
              <p className="text-red-400 text-xs font-mono">
                Incorrect password. Try again.
              </p>
            )}
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-mono text-sm rounded-lg transition-colors"
            >
              Unlock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("skills");
  const [status, setStatus] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  function showStatus(msg: string, type: "success" | "error") {
    setStatus({ msg, type });
    setTimeout(() => setStatus(null), 3500);
  }

  if (!password) {
    return <PasswordGate onUnlock={(pw) => setPassword(pw)} />;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-[#080814]">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#7c3aed 1px, transparent 1px), linear-gradient(90deg, #7c3aed 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-1">
              Admin Panel
            </p>
            <h1 className="text-2xl font-bold text-white">
              Kaustubh Shandilya
            </h1>
            <p className="text-gray-500 text-sm font-mono mt-0.5">
              Portfolio CMS
            </p>
          </div>
          <button
            onClick={() => setPassword(null)}
            className="px-3 py-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 rounded-lg transition-colors"
          >
            Lock
          </button>
        </div>

        {/* Status toast */}
        {status && (
          <div className="mb-6">
            <StatusBadge message={status.msg} type={status.type} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[#0d0d20] border border-white/8 rounded-xl mb-8">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-2 text-sm font-mono rounded-lg transition-all ${
                activeTab === id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "skills" && (
          <SkillsTab password={password} onStatus={showStatus} />
        )}
        {activeTab === "projects" && (
          <ProjectsTab password={password} onStatus={showStatus} />
        )}
        {activeTab === "contact" && (
          <ContactTab password={password} onStatus={showStatus} />
        )}
      </div>
    </div>
  );
}