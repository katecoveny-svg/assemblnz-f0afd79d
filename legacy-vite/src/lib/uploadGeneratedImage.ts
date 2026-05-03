import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads a generated image (base64 data URL or remote URL) to Supabase storage
 * and returns a permanent public URL.
 */
export async function uploadGeneratedImage(
  imageUrl: string,
  userId: string,
  agentId: string
): Promise<string | null> {
  try {
    let blob: Blob;

    if (imageUrl.startsWith("data:")) {
      // Base64 data URL
      const res = await fetch(imageUrl);
      blob = await res.blob();
    } else {
      // Remote URL — download it
      const res = await fetch(imageUrl);
      if (!res.ok) return null;
      blob = await res.blob();
    }

    const ext = blob.type?.includes("png") ? "png" : "jpg";
    const fileName = `${userId}/${agentId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from("chat-images")
      .upload(fileName, blob, { contentType: blob.type || "image/png", upsert: false });

    if (error) {
      console.error("Image upload error:", error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("chat-images")
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (err) {
    console.error("uploadGeneratedImage failed:", err);
    return null;
  }
}
