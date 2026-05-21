import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password") as string;
  if (password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = formData.get("projectId") as string;
  const file = formData.get("file") as File;
  if (!projectId || !file) {
    return Response.json({ error: "Missing projectId or file" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dir = path.join(process.cwd(), "public", "project-images", projectId);
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
  await writeFile(path.join(dir, filename), buffer);

  return Response.json({ url: `/project-images/${projectId}/${filename}` });
}
