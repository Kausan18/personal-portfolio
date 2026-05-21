import { NextResponse } from "next/server";
import { getHero, saveHero } from "@/lib/data";

export async function GET() {
  const data = getHero();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, description } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  saveHero({ description });
  return NextResponse.json({ success: true });
}
