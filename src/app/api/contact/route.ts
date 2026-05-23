import { NextResponse } from "next/server";
import { getContact, saveContact } from "@/lib/data";

export async function GET() {
  try {
    const data = await getContact();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, ...fields } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await saveContact(fields);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}