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