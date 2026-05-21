import { writeFile, unlink, access } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

const resumePath = path.join(process.cwd(), "public", "resume.pdf");

export async function GET() {
  try {
    await access(resumePath);
    return Response.json({ exists: true });
  } catch {
    return Response.json({ exists: false });
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password") as string;
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const file = formData.get("file") as File;
  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(resumePath, buffer);
  return Response.json({ success: true });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { password } = body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await unlink(resumePath);
  } catch {
    // ignore if file does not exist
  }

  return Response.json({ success: true });
}
