import { NextResponse } from "next/server";
import { getProjects, saveProjects } from "@/lib/data";

export async function GET() {
  const data = getProjects();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, ...data } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  saveProjects(data);
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { password, id, ...updates } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = getProjects();
  const index = data.projects.findIndex((project) => project.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  data.projects[index] = {
    ...data.projects[index],
    ...updates,
  };

  saveProjects(data);
  return NextResponse.json({ success: true });
}