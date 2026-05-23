import { NextResponse } from "next/server";
import { getProjects, addProject, updateProject, deleteProject } from "@/lib/data";

export async function GET() {
  try {
    const data = await getProjects();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

// Add a new project
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, ...project } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await addProject(project);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to add project" }, { status: 500 });
  }
}

// Update an existing project
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { password, id, ...updates } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await updateProject(id, updates);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

// Delete a project
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { password, id } = body;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}