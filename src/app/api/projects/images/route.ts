import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Supabase Storage bucket name — create this in your Supabase dashboard
// Dashboard → Storage → New bucket → name: "project-images" → Public: true
const BUCKET = "project-images";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const password = formData.get("password") as string;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = formData.get("projectId") as string;
    const file = formData.get("file") as File;

    if (!projectId || !file) {
      return NextResponse.json(
        { error: "Missing projectId or file" },
        { status: 400 }
      );
    }

    // Sanitize filename and build storage path
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const filename = `${projectId}/${Date.now()}.${ext}`;

    // Convert File to ArrayBuffer → Buffer for Supabase
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase storage upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}

// Optional: delete an image from storage when a project is deleted
export async function DELETE(req: NextRequest) {
  try {
    const { password, path: filePath } = await req.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!filePath) {
      return NextResponse.json({ error: "Missing path" }, { status: 400 });
    }

    // filePath should be just the path within the bucket, e.g. "my-project/1234567890.jpg"
    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete image error:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}