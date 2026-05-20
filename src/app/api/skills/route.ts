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