import { getHapaiTool } from "@/lib/hapai/shareable-tools";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const tool = getHapaiTool(slug);
  if (!tool) {
    return Response.json({ error: "Unknown HAPAI tool" }, { status: 404 });
  }

  return Response.json(
    {
      name: `${tool.name} · assembl`,
      short_name: tool.name.slice(0, 28).trim(),
      description: tool.description,
      id: tool.href,
      start_url: tool.href,
      scope: tool.href,
      display: "standalone",
      display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
      background_color: "#FAF7F2",
      theme_color: "#2B6B57",
      categories: ["productivity", "business", "education"],
      icons: [
        {
          src: "/icons/assembl-icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable",
        },
        {
          src: "/icons/assembl-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/manifest+json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
