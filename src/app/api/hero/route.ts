import { NextResponse } from "next/server";
import { getHero, saveHero } from "@/lib/data";

export async function GET() {
  try {
    const data = await getHero();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch hero" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, description } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await saveHero({ description });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update hero" }, { status: 500 });
  }
}