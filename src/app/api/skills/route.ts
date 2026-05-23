import { NextResponse } from "next/server";
import {
  getSkills,
  saveSkills,
  addSkillCategory,
  deleteSkillCategory,
} from "@/lib/data";

export async function GET() {
  try {
    const data = await getSkills();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch skills" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, action, ...data } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "ping") {
      return NextResponse.json({ success: true });
    }

    // Add a new category
    if (action === "addCategory") {
      await addSkillCategory(data);
      return NextResponse.json({ success: true });
    }

    // Update skills array for an existing category
    // body shape: { password, id, skills: string[] }
    if (data.id && Array.isArray(data.skills)) {
      await saveSkills(data.id, data.skills);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action or invalid payload" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update skills" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { password, action, categoryId } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === "deleteCategory") {
      await deleteSkillCategory(categoryId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to delete skill category" }, { status: 500 });
  }
}