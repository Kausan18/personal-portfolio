import { NextResponse } from "next/server";
import { getContact, saveContact } from "@/lib/data";

export async function GET() {
  const data = getContact();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { password, ...data } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  saveContact(data);
  return NextResponse.json({ success: true });
}