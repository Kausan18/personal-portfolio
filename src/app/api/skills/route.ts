import { NextResponse } from "next/server";
import { getSkills, saveSkills, type SkillCategory } from "@/lib/data";

export async function GET() {
  const data = getSkills();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, action, ...data } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (action === "ping") {
    return NextResponse.json({ success: true });
  }

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  saveSkills(data as { categories: SkillCategory[] });
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { password, action, category, skill } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = getSkills();

  if (action === "deleteCategory") {
    const updated = data.categories.filter((item) => item.label !== category);
    saveSkills({ categories: updated });
    return NextResponse.json({ success: true });
  }

  if (action === "deleteSkill") {
    const updated = data.categories.map((item) =>
      item.label === category
        ? { ...item, skills: item.skills.filter((sk) => sk !== skill) }
        : item
    );
    saveSkills({ categories: updated });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}